from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    NotebookListCreateView, 
    NotebookNotesListCreateView,
    RegisterView,
    AllNotesListCreateView,
    NoteDetailView,
    TrackListCreateView,
    TopicListCreateView,
    TopicDetailView,
    FeynmanListCreateView,
    NotebookDetailView,
    TopicListView,
    TrackDetailView,
    GlobalSearchView,
    GoogleLoginView,
    JournalEntryView,
    JournalCalendarView,
    ProfileView,
    SettingsView,
    ExportAllDataView,
    ExportJournalView,
    PersonalTrackStatsView,
    DashboardView,
    ExportNotesPDF,
    ExportJournalPDF,
    ExportBackup,
)

urlpatterns = [
    path('notebooks/', NotebookListCreateView.as_view()),
    path('notes/', AllNotesListCreateView.as_view()),
    path("notes/<int:pk>/", NoteDetailView.as_view()),
    path('notebooks/<int:notebook_id>/notes/', NotebookNotesListCreateView.as_view()),
    path('register/', RegisterView.as_view()),
    path("tracks/<int:pk>/", TrackDetailView.as_view()),
    path("tracks/", TrackListCreateView.as_view()),
    path("tracks/<int:track_id>/topics/", TopicListCreateView.as_view()),
    path("topics/<int:pk>/", TopicDetailView.as_view()),
   
    path("notebooks/<int:pk>/", NotebookDetailView.as_view()),
    path("topics/", TopicListView.as_view()),
    path(
    "topics/<int:topic_id>/feynman/",
    FeynmanListCreateView.as_view(),
    name="topic-feynman"
    ),
    path("search/", GlobalSearchView.as_view()),
    path("google-login/", GoogleLoginView.as_view()),
    path("journal/calendar/", JournalCalendarView.as_view()),
    path("journal/<str:date>/", JournalEntryView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("settings/", SettingsView.as_view()),
    path("export/all/", ExportAllDataView.as_view()),
    path("export/journal/", ExportJournalView.as_view()),
    path(
    "tracks/<int:track_id>/personal-stats/",
    PersonalTrackStatsView.as_view(),
),
    path("dashboard/", DashboardView.as_view()),
    path("export/notes/pdf/", ExportNotesPDF.as_view()),
path("export/journal/pdf/", ExportJournalPDF.as_view()),
path("export/backup/", ExportBackup.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



# path('notes/', NoteListCreateView.as_view()),
