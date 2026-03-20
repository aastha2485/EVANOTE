from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.utils.timezone import now

# Create your models here.

class User(AbstractUser):
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    auth_type = models.CharField(max_length=20, default="password")

    def __str__(self):
        return self.username

class Notebook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']  #extra instruction saying order them by updated_at (descending (newest first)).

    def __str__(self):
        return self.name

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notebook = models.ForeignKey(
        Notebook, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    topic = models.OneToOneField(
        "Topic",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="note"
    )
    
    title = models.CharField(max_length=150)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        
    def __str__(self):
        return self.title
    

class Track(models.Model):
    TRACK_TYPES = [
        ("subject", "Subject"),
        ("project", "Project"),
        ("personal", "Personal/General"),
    ]
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TRACK_TYPES)
    deadline = models.DateField(null=True, blank=True)
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tracks"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    @property
    def progress_percentage(self):
        if self.type == "personal":
            return 0
        
        topics = self.topics.all()
        total = topics.count()

        if total == 0:
            return 0

        score = 0

        for topic in topics:
            if topic.status == "done":
                score += 1
            elif topic.status == "in_progress":
                score += 0.5
            # pending adds 0

        return int((score / total) * 100)
    
    def __str__(self):
        return self.title
   
    
class Topic(models.Model):
    title = models.CharField(max_length=255)
    
    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="topics"
    )
    
    order = models.PositiveIntegerField(default=0)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("in_progress", "In Progress"),
            ("done", "Done"),
        ],
        default="pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_completed_date = models.DateField(null=True, blank=True)
    next_active_date = models.DateField(null=True, blank=True)

    weekly_target = models.IntegerField(null=True, blank=True)
    weekly_count = models.IntegerField(default=0)

    REPEAT_TYPES = [
        ("none", "None"),
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("interval", "Interval"),
    ]

    repeat_type = models.CharField(
        max_length=20,
        choices=REPEAT_TYPES,
        default="none"
    )
    
    repeat_interval_days = models.IntegerField(
        null=True,
        blank=True
    )

    @property
    def is_completed(self):
        return self.status == "done"

    # 🔐 ADD THIS HERE
    def save(self, *args, **kwargs):
        # Enforce repeat only for Personal tracks
        if self.track.type != "personal":
            self.repeat_type = "none"
            self.repeat_interval_days = None

        super().save(*args, **kwargs)
        
    def check_and_reactivate(self):
        if self.repeat_type == "none":
            return

        today = timezone.now().date()

        # DAILY / INTERVAL reactivation
        if self.next_active_date and today >= self.next_active_date:
            self.status = "pending"
            self.next_active_date = None

            if self.repeat_type == "weekly":
                self.weekly_count = 0

            self.save()
            return

        # Weekly safety reset (if next_active_date somehow missing)
        if self.repeat_type == "weekly":
            if today.weekday() == 0 and self.weekly_count > 0:
                self.weekly_count = 0
                if self.status == "done":
                    self.status = "pending"
                self.save()
                
    def get_next_week_start(self):
        today = timezone.now().date()
        weekday = today.weekday()  # Monday = 0, Sunday = 6
        days_until_monday = 7 - weekday
        return today + timedelta(days=days_until_monday)
    

    def get_next_monday(self):
        today = timezone.now().date()
        weekday = today.weekday()  # Monday = 0
        days_until_monday = (7 - weekday) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        return today + timedelta(days=days_until_monday)

    def __str__(self):
        return self.title
    
    
    
class Explanation(models.Model):
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="explanations"
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    clarity_score = models.FloatField(default=0)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
class RecallAttempt(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="recalls")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    answer = models.TextField()
    strength = models.CharField(max_length=20)  # weak / decent / strong
    created_at = models.DateTimeField(auto_now_add=True)
    
class QuizAttempt(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="quiz_attempts")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.FloatField()
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class FeynmanExplanation(models.Model):
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name="feynman_explanations"
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    clarity_score = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    content = models.TextField(blank=True)

    class Meta:
        unique_together = ("user", "date")

    def __str__(self):
        return f"{self.user.username} - {self.date}"
    
class UserProfile(models.Model):
    AUTH_TYPES = [
        ("password", "Email + Password"),
        ("google", "Google Account"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    auth_type = models.CharField(max_length=20, choices=AUTH_TYPES)
    avatar = models.ImageField(
        upload_to="profile_photos/",
        blank=True,
        null=True
    )
    bio = models.TextField(blank=True, default="") 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
    
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance, auth_type="password")
        

class UserSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    theme = models.CharField(max_length=10, default="dark")
    feynman_threshold = models.FloatField(default=0.75)
    auto_mark_done = models.BooleanField(default=True)
    show_due_warnings = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} settings"
    
    
class DailyActivity(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    date = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user} - {self.date}"
    

