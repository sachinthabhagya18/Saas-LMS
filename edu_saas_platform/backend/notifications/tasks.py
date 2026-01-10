# notifications/tasks.py
from celery import shared_task
from notifications.services import NotificationService

@shared_task
def send_bulk_notification_task(user_ids, title, message):
    from users.models import User
    users = User.objects.filter(id__in=user_ids)
    
    for user in users:
        NotificationService.send_in_app_notification(
            recipient=user,
            title=title,
            message=message,
            notification_type='system'
        )