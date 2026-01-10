import logging
from django.utils import timezone
from .models import Notification, NotificationStatus

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_in_app_notification(recipient, title, message, notification_type='system', **kwargs):
        """Send in-app notification safely"""
        try:
            notification = Notification.objects.create(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                **kwargs
            )
            return notification
        except Exception as e:
            logger.error(f"Failed to create in-app notification: {e}")
            return None

# ✅ ADDED: Missing NotificationManager class
class NotificationManager:
    @staticmethod
    def get_unread_count(user):
        return Notification.objects.filter(
            recipient=user, status=NotificationStatus.UNREAD
        ).count()

    @staticmethod
    def mark_all_as_read(user):
        return Notification.objects.filter(
            recipient=user, status=NotificationStatus.UNREAD
        ).update(status=NotificationStatus.READ, read_at=timezone.now())