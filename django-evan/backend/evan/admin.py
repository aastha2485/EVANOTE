from django.contrib import admin

# Register your models here.
from .models import Notebook, Note, Track, Topic, DailyActivity


admin.site.register(Notebook)
admin.site.register(Note)
admin.site.register(Track)
admin.site.register(Topic)
admin.site.register(DailyActivity)
