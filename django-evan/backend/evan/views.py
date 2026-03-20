
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import (Notebook,
                     Note,
                     Track,
                     Topic,
                     Explanation,
                     FeynmanExplanation,
                     JournalEntry,
                     UserProfile,
                     UserSettings,
                     DailyActivity,
                     )
from .serializers import NotebookSerializer, NoteSerializer, RegisterSerializer, TrackSerializer, TopicSerializer, FeynmanSerializer, JournalEntrySerializer
from django.contrib.auth import get_user_model

User = get_user_model()
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.parsers import JSONParser
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db.models.functions import ExtractDay
from django.db.models import Count
from django.utils.timezone import make_aware
from datetime import datetime
from datetime import timedelta
from zoneinfo import ZoneInfo   # Python 3.9+
from django.db.models import Avg


def calculate_streak(user):
    today = timezone.now().date()

    activity_dates = set(
        DailyActivity.objects.filter(user=user)
        .values_list("date", flat=True)
    )

    # CURRENT STREAK
    current_streak = 0
    check_day = today

    while check_day in activity_dates:
        current_streak += 1
        check_day -= timedelta(days=1)

    # LONGEST STREAK
    longest_streak = 0
    temp_streak = 0

    sorted_dates = sorted(activity_dates)
    previous_day = None

    for d in sorted_dates:
        if previous_day and (d - previous_day).days == 1:
            temp_streak += 1
        else:
            temp_streak = 1

        longest_streak = max(longest_streak, temp_streak)
        previous_day = d

    return {
        "current": current_streak,
        "longest": longest_streak
    }

def register_activity(user):
    today = timezone.now().date()

    DailyActivity.objects.get_or_create(
        user=user,
        date=today
    )
    
class NotebookListCreateView(generics.ListCreateAPIView):
    serializer_class = NotebookSerializer
    permission_classes = [IsAuthenticated]

    #Controls what data the user is allowed to see.
    def get_queryset(self):
        return Notebook.objects.filter(user=self.request.user)
    
    #Controls how new data is saved and who owns it.
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    


# class NoteListCreateView(generics.ListCreateAPIView):
#     queryset = Note.objects.all()
#     serializer_class = NoteSerializer


class NotebookNotesListCreateView(generics.ListCreateAPIView):
    serializer_class  = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_notebook(self):
        return get_object_or_404(
            Notebook,
            id=self.kwargs['notebook_id'],
            user=self.request.user
        )

    def get_queryset(self):
        notebook = self.get_notebook()
        return Note.objects.filter(notebook=notebook)
    
    def perform_create(self, serializer):
        notebook = self.get_notebook()
        serializer.save(
            notebook=notebook,
            user=self.request.user 
        )

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] #allow public access
    parser_classes = [JSONParser]

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     serializer.save()
    #     return Response(
    #         {"message": "User created successfully"},
    #         status=status.HTTP_201_CREATED
    #     )
    
class AllNotesListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Note.objects.filter(
            user=self.request.user
        ).order_by("-updated_at")
        
        search = self.request.query_params.get("search")
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
            
        notebook_id = self.request.query_params.get("notebook")

        if notebook_id:
            queryset = queryset.filter(notebook_id=notebook_id)
                        
        return queryset
        
        # return Note.objects.filter(user=self.request.user).order_by("-updated_at")
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
    
    
class TrackListCreateView(generics.ListCreateAPIView):
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Track.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        

class TopicListCreateView(generics.ListCreateAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        topics = Topic.objects.filter(
            track__user=self.request.user,
            track_id=self.kwargs["track_id"]
        ).order_by("order")

        for topic in topics:
            topic.check_and_reactivate()

        return topics
        
    def perform_create(self, serializer):
        serializer.save(track_id=self.kwargs["track_id"])
        
    
        

class TopicDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        topics = Topic.objects.filter(track__user=self.request.user)

        for topic in topics:
            topic.check_and_reactivate()

        return topics

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        status_before = instance.status

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # If changed to done
        if "status" in request.data:
            if instance.status == "done" and status_before != "done":
                register_activity(request.user)
                today = timezone.now().date()
                instance.completed_at = timezone.now()
                instance.last_completed_date = today

                if instance.repeat_type != "none":

                    if instance.repeat_type == "daily":
                        instance.next_active_date = today + timedelta(days=1)

                    elif instance.repeat_type == "interval" and instance.repeat_interval_days:
                        instance.next_active_date = today + timedelta(days=instance.repeat_interval_days)

                    elif instance.repeat_type == "weekly":
                        instance.weekly_count += 1

                        if instance.weekly_target and instance.weekly_count >= instance.weekly_target:
                            instance.next_active_date = instance.get_next_monday()
                        else:
                            instance.next_active_date = None

                instance.save()

            if instance.status != "done" and status_before == "done":
                instance.completed_at = None
                instance.save()

        return Response(self.get_serializer(instance).data)
    
class FeynmanListCreateView(generics.ListCreateAPIView):
    serializer_class = FeynmanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Explanation.objects.filter(
            topic_id=self.kwargs["topic_id"],
            author=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        register_activity(self.request.user)
        topic = get_object_or_404(
            Topic,
            id=self.kwargs["topic_id"],
            track__user=self.request.user
        )

        content = serializer.validated_data["content"]

        word_count = len(content.split())
        sentence_count = content.count(".") + content.count("!")

        length_score = min(word_count / 120, 1.0)
        structure_score = min(sentence_count / 5, 1.0)

        clarity = round((length_score * 0.6 + structure_score * 0.4), 2)

        # 🔥 GET USER SETTINGS
        user_settings, _ = UserSettings.objects.get_or_create(
            user=self.request.user
        )

        threshold = user_settings.feynman_threshold
        auto_mark = user_settings.auto_mark_done

        existing = Explanation.objects.filter(
            topic=topic,
            author=self.request.user
        ).order_by("-created_at").first()

        if existing:
            # 🔥 UPDATE instead of create
            existing.content = content
            existing.clarity_score = clarity
            existing.save()
            explanation = existing
        else:
            explanation = serializer.save(
                topic=topic,
                author=self.request.user,
                clarity_score=clarity,
                published=True
            )

        # 🔥 APPLY SETTINGS LOGIC
        if clarity >= threshold and auto_mark:
            topic.status = "done"
            topic.completed_at = timezone.now()
            topic.save()
            
        

        return Response({
            "id": explanation.id,
            "content": explanation.content,
            "clarity_score": explanation.clarity_score,
            "created_at": explanation.created_at
        })
        
class NotebookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notebook.objects.all()
    serializer_class = NotebookSerializer

class TopicListView(generics.ListAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Topic.objects.filter(track__user=self.request.user)
    
        
class TrackDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Track.objects.filter(user=self.request.user)
    



class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get("q", "")

        notes = Note.objects.filter(
            user=request.user
        ).filter(
            Q(title__icontains=query) |
            Q(content__icontains=query)
        )[:5]

        notebooks = Notebook.objects.filter(
            user=request.user,
            name__icontains=query
        )[:5]

        tracks = Track.objects.filter(
            user=request.user,
            title__icontains=query
        )[:5]

        topics = Topic.objects.filter(
            track__user=request.user,
            title__icontains=query
        )[:5]

        return Response({
            "notes": NoteSerializer(notes, many=True).data,
            "notebooks": NotebookSerializer(notebooks, many=True).data,
            "tracks": TrackSerializer(tracks, many=True).data,
            "topics": TopicSerializer(topics, many=True).data,
        })
        


GOOGLE_CLIENT_ID = "43487209354-ra3dq746db7fvhkml0vu8tpa145mm40b.apps.googleusercontent.com"


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        auth_type="google"

        if not token:
            return Response({"error": "No token provided"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                GOOGLE_CLIENT_ID
            )

            email = idinfo["email"]
            name = idinfo.get("name", "")

        except ValueError:
            return Response({"error": "Invalid token"}, status=400)

        user, created = User.objects.get_or_create(
            username=email,
            defaults={"email": email}
        )

        refresh = RefreshToken.for_user(user)
        

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })
        

        
class JournalEntryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, date):
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()

        tz_name = request.GET.get("tz", "UTC")

        try:
            user_tz = ZoneInfo(tz_name)
        except:
            user_tz = ZoneInfo("UTC")

        completed_topics = []

        topics = Topic.objects.filter(
            track__user=request.user,
            completed_at__isnull=False
        )

        for topic in topics:
            local_time = topic.completed_at.astimezone(user_tz)

            if local_time.date() == parsed_date:
                completed_topics.append(topic)

        entry, _ = JournalEntry.objects.get_or_create(
            user=request.user,
            date=parsed_date
        )

        return Response({
            "content": entry.content,
            "completed": [{"title": t.title} for t in completed_topics],
        })
    

class JournalCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.GET.get("month")
        year = request.GET.get("year")

        if not month or not year:
            return Response({"error": "Month and year required"}, status=400)

        month = int(month)
        year = int(year)

        data = {}

        # Completed Topics
        topics = Topic.objects.filter(
            track__user=request.user,
            completed_at__isnull=False,
            completed_at__year=year,
            completed_at__month=month
        )

        for topic in topics:
            day = topic.completed_at.day
            data.setdefault(day, {"completed": 0, "good": 0, "partial": 0})
            data[day]["completed"] += 1

        # Feynman Explanations
        explanations = Explanation.objects.filter(
            author=request.user,
            created_at__year=year,
            created_at__month=month
        )

        for exp in explanations:
            day = exp.created_at.day
            data.setdefault(day, {"completed": 0, "good": 0, "partial": 0})

            if exp.clarity_score >= 0.75:
                data[day]["good"] += 1
            else:
                data[day]["partial"] += 1

        return Response(data)
    

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.userprofile

        avatar_url = None
        if profile.avatar:
            avatar_url = request.build_absolute_uri(profile.avatar.url)

        return Response({
            "name": user.username,
            "email": user.email,
            "avatar": avatar_url,
            "bio": profile.bio,  # ✅ ADDED
            "auth_type": profile.auth_type,
            "created_at": user.date_joined,  # ✅ RAW DATE
        })

    def patch(self, request):
        user = request.user
        profile = user.userprofile

        username = request.data.get("name")
        bio = request.data.get("bio")
        avatar = request.FILES.get("avatar")

        # ✅ update username
        if username:
            user.username = username
            user.save()

        # ✅ update bio
        if bio is not None:
            profile.bio = bio

        # ✅ update avatar
        if avatar:
            profile.avatar = avatar

        profile.save()

        avatar_url = None
        if profile.avatar:
            avatar_url = request.build_absolute_uri(profile.avatar.url)

        return Response({
            "name": user.username,
            "avatar": avatar_url,
            "bio": profile.bio,  # ✅ RETURN BIO
        })

    def delete(self, request):
        request.user.delete()
        return Response({"status": "account deleted"})
    
class SettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings_obj, _ = UserSettings.objects.get_or_create(user=request.user)

        return Response({
            "theme": settings_obj.theme,
            "feynman_threshold": settings_obj.feynman_threshold,
            "auto_mark_done": settings_obj.auto_mark_done,
            "show_due_warnings": settings_obj.show_due_warnings,
        })

    def patch(self, request):
        settings_obj, _ = UserSettings.objects.get_or_create(user=request.user)

        for field in [
            "theme",
            "feynman_threshold",
            "auto_mark_done",
            "show_due_warnings",
        ]:
            if field in request.data:
                setattr(settings_obj, field, request.data[field])

        settings_obj.save()

        return self.get(request)
    
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class ExportAllDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        tracks = Track.objects.filter(user=user)
        topics = Topic.objects.filter(track__user=user)
        feynman = FeynmanExplanation.objects.filter(author=user)
        journals = JournalEntry.objects.filter(user=user)

        data = {
            "exported_at": now(),
            "user": {
                "username": user.username,
                "email": user.email,
                "date_joined": user.date_joined,
                "auth_type": user.auth_type,
            },
            "tracks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "type": t.type,
                    "due_date": t.due_date,
                    "progress_percentage": t.progress_percentage,
                    "created_at": t.created_at,
                }
                for t in tracks
            ],
            "topics": [
                {
                    "id": tp.id,
                    "track_id": tp.track.id,
                    "title": tp.title,
                    "status": tp.status,
                    "due_date": tp.due_date,
                    "completed_at": tp.completed_at,
                    "order": tp.order,
                    "created_at": tp.created_at,
                }
                for tp in topics
            ],
            "feynman_attempts": [
                {
                    "note_id": fx.note.id,
                    "topic_id": fx.note.topic.id if fx.note.topic else None,
                    "clarity_score": fx.clarity_score,
                    "created_at": fx.created_at,
                }
                for fx in feynman
            ],
            "journal_entries": [
                {
                    "date": j.date,
                    "content": j.content,
                }
                for j in journals
            ],
        }

        return Response(data)


class ExportJournalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        journals = JournalEntry.objects.filter(user=request.user)

        data = {
            "exported_at": now(),
            "journal_entries": [
                {
                    "date": j.date,
                    "content": j.content,
                }
                for j in journals
            ],
        }

        return Response(data)
    
    
class ExportJournalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        journals = JournalEntry.objects.filter(user=request.user)

        data = {
            "exported_at": now(),
            "journal_entries": [
                {
                    "date": j.date,
                    "content": j.content,
                }
                for j in journals
            ]
        }

        return Response(data)
    

class PersonalTrackStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, track_id):
        from evan.models import Topic

        today = timezone.now().date()

        # Start of week (Monday)
        start_of_week = today - timedelta(days=today.weekday())

        topics = Topic.objects.filter(
            track_id=track_id,
            track__user=request.user,
            track__type="personal",
            last_completed_date__isnull=False
        )

        today_completed = topics.filter(
            last_completed_date=today
        ).count()

        week_completed = topics.filter(
            last_completed_date__gte=start_of_week
        ).count()

        active_days = topics.filter(
            last_completed_date__gte=start_of_week
        ).values("last_completed_date").distinct().count()

        consistency = 0
        if active_days > 0:
            consistency = int((active_days / 7) * 100)

        return Response({
            "today_completed": today_completed,
            "week_completed": week_completed,
            "active_days": active_days,
            "consistency": consistency
        })
        

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        today = timezone.now().date()

        # -------------------------
        # 1️⃣ LEARNING OVERVIEW
        # -------------------------

        learning_tracks = Track.objects.filter(
            user=user
        ).exclude(type="personal")

        topics = Topic.objects.filter(
            track__in=learning_tracks
        )

        total_tracks = learning_tracks.count()
        total_topics = topics.count()

        completed_topics = topics.filter(status="done").count()
        in_progress_topics = topics.filter(status="in_progress").count()

        clarity = Explanation.objects.filter(
            author=user
        ).aggregate(avg=Avg("clarity_score"))

        avg_clarity = clarity["avg"] or 0

        # -------------------------
        # MOMENTUM INDICATOR
        # -------------------------

        last_week_start = today - timedelta(days=7)
        prev_week_start = today - timedelta(days=14)

        recent_completed = Topic.objects.filter(
            track__user=user,
            completed_at__date__gte=last_week_start
        ).count()

        previous_completed = Topic.objects.filter(
            track__user=user,
            completed_at__date__gte=prev_week_start,
            completed_at__date__lt=last_week_start
        ).count()

        if recent_completed > previous_completed:
            momentum = "up"
        elif recent_completed < previous_completed:
            momentum = "down"
        else:
            momentum = "steady"

        # -------------------------
        # 2️⃣ ACTIVITY SYSTEM
        # -------------------------

        start_of_month = today.replace(day=1)

        activities = DailyActivity.objects.filter(
            user=user,
            date__gte=start_of_month
        )

        activity_dates = [
            a.date.isoformat() for a in activities
        ]


        # -------- STREAK --------

        all_activity = DailyActivity.objects.filter(
            user=user
        ).order_by("-date")

        dates = [a.date for a in all_activity]

        current_streak = 0
        longest_streak = 0

        prev_date = None
        streak = 0

        for date in dates:
            if prev_date is None:
                streak = 1
            else:
                diff = (prev_date - date).days

                if diff == 1:
                    streak += 1
                elif diff == 0:
                    continue
                else:
                    streak = 1

            longest_streak = max(longest_streak, streak)

            if current_streak == 0:
                if date == today:
                    current_streak = streak

            prev_date = date


        # -------------------------
        # 3️⃣ FOCUS & URGENCY
        # -------------------------

        upcoming = Topic.objects.filter(
            track__user=user,
            track__type__in=["subject", "project"],
            due_date__isnull=False,
            due_date__gte=today
        ).order_by("due_date")[:3]

        upcoming_data = [
            {
                "title": t.title,
                "due_date": t.due_date.isoformat(),
                "track": t.track.title
            }
            for t in upcoming
        ]


        recent = Explanation.objects.filter(
            author=user
        ).order_by("-created_at")[:3]

        recent_data = [
            {
                "topic": r.topic.title,
                "clarity_score": r.clarity_score,
                "date": r.created_at
            }
            for r in recent
        ]


        # -------------------------
        # 4️⃣ PERSONAL TRACK SUMMARY
        # -------------------------

        personal_tracks = Track.objects.filter(
            user=user,
            type="personal"
        )

        personal_summary = None

        if personal_tracks.exists():

            today_completed = Topic.objects.filter(
                track__in=personal_tracks,
                completed_at__date=today
            ).count()

            start_week = today - timedelta(days=today.weekday())

            active_days = DailyActivity.objects.filter(
                user=user,
                date__gte=start_week
            ).count()

            consistency = int((active_days / 7) * 100)

            personal_summary = {
                "today_completed": today_completed,
                "active_days": active_days,
                "consistency": consistency
            }
            
        
        # -------------------------
        # TODAY FOCUS ENGINE
        # -------------------------

        focus_items = []

        # 1️⃣ Deadlines today / tomorrow
        deadline_topics = Topic.objects.filter(
            track__user=user,
            due_date__isnull=False,
            due_date__lte=today + timedelta(days=1)
        ).order_by("due_date")

        for t in deadline_topics:
            label = "due today" if t.due_date == today else "due tomorrow"

            focus_items.append({
                "icon": "🔥",
                "text": f"{t.title} – {label}"
            })


        # 2️⃣ Repeat tasks ready
        repeat_tasks = Topic.objects.filter(
            track__user=user,
            repeat_type__in=["daily", "interval"],
            status="pending"
        )

        for t in repeat_tasks:
            focus_items.append({
                "icon": "🔁",
                "text": f"{t.title} – repeat today"
            })


        # 3️⃣ Needs explanation
        explanation_missing = Topic.objects.filter(
            track__user=user,
            track__type__in=["subject", "project"],
            explanations__isnull=True
        )

        for t in explanation_missing:
            focus_items.append({
                "icon": "🧠",
                "text": f"Explain {t.title}"
            })


        # 4️⃣ In-progress topics
        in_progress = Topic.objects.filter(
            track__user=user,
            status="in_progress"
        )

        for t in in_progress:
            icon = "💻" if t.track.type == "project" else "📚"

            focus_items.append({
                "icon": icon,
                "text": t.title
            })


        # take top 3
        today_focus = focus_items[:3]
        
        # -------------------------
        # 🔟 RECENT NOTES
        # -------------------------

        recent_notes = Note.objects.filter(
            user=user
        ).order_by("-updated_at")[:3]

        recent_notes_data = [
            {
                "id": n.id,
                "title": n.title
            }
            for n in recent_notes
        ]


        # -------------------------
        # RESPONSE
        # -------------------------

        return Response({
            "today_focus": today_focus,
            
            "learning_overview": {
                "total_tracks": total_tracks,
                "total_topics": total_topics,
                "completed_topics": completed_topics,
                "in_progress": in_progress_topics,
                "avg_clarity": round(avg_clarity, 2),
                "momentum": momentum
            },

            "activity": {
                "dates": activity_dates,
                "month": today.month,
                "year": today.year,
                "current_streak": current_streak,
                "longest_streak": longest_streak
            },

            "focus": {
                "upcoming": upcoming_data,
                "recent_practice": recent_data
            },
            
            "recent_notes": recent_notes_data,

            "personal_summary": personal_summary
        })
        
        
class ExportNotesPDF(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notes = Note.objects.filter(user=request.user)

        html = render_to_string("notes_pdf.html", {"notes": notes})

        response = HttpResponse(content_type="application/pdf")
        pisa.CreatePDF(html, dest=response)

        return response
    

class ExportJournalPDF(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = JournalEntry.objects.filter(user=request.user)

        html = render_to_string("journal_pdf.html", {"entries": entries})

        response = HttpResponse(content_type="application/pdf")
        pisa.CreatePDF(html, dest=response)

        return response
    
    
class ExportBackup(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            "notes": list(Note.objects.filter(user=request.user).values()),
            "topics": list(Topic.objects.filter(track__user=request.user).values()),
            "tracks": list(Track.objects.filter(user=request.user).values()),
            "journal": list(JournalEntry.objects.filter(user=request.user).values()),
        }

        return Response(data)