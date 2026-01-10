from django.db.models.signals import post_save
from django.dispatch import receiver
from courses.models import Enrollment
from payments.models import Payment
from .services import NotificationService

@receiver(post_save, sender=Enrollment)
def notify_enrollment(sender, instance, created, **kwargs):
    if created:
        NotificationService.send_in_app_notification(
            recipient=instance.student,
            title="Enrollment Successful",
            message=f"You enrolled in {instance.course.title}",
            notification_type='course_enrollment',
            course=instance.course
        )

@receiver(post_save, sender=Payment)
def notify_payment(sender, instance, created, **kwargs):
    if instance.status == 'completed':
        NotificationService.send_in_app_notification(
            recipient=instance.enrollment.student,
            title="Payment Successful",
            message=f"Payment for {instance.enrollment.course.title} received.",
            notification_type='payment_success',
            payment=instance
        )