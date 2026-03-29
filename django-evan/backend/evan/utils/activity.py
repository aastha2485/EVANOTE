from datetime import date
from evan.models import ActivityLog

def log_activity(user, action_type):
    today = date.today()

    obj, created = ActivityLog.objects.get_or_create(
        user=user,
        date=date.today(),
        action_type=action_type
    )

    obj.actions_count += 1
    obj.save()