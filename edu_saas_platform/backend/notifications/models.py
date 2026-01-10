from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

User = settings.AUTH_USER_MODEL

class NotificationType(models.TextChoices):
    COURSE_ENROLLMENT = 'course_enrollment', 'Course Enrollment'
    PAYMENT_SUCCESS = 'payment_success', 'Payment Success'
    PAYMENT_FAILED = 'payment_failed', 'Payment Failed'
    ASSIGNMENT_SUBMITTED = 'assignment_submitted', 'Assignment Submitted'
    ASSIGNMENT_GRADED = 'assignment_graded', 'Assignment Graded'
    COURSE_EXPIRY = 'course_expiry', 'Course Expiry'
    SYSTEM = 'system', 'System Notification'

class NotificationStatus(models.TextChoices):
    UNREAD = 'unread', 'Unread'
    READ = 'read', 'Read'
    ARCHIVED = 'archived', 'Archived'

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    status = models.CharField(max_length=20, choices=NotificationStatus.choices, default=NotificationStatus.UNREAD)
    
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, null=True, blank=True)
    enrollment = models.ForeignKey('courses.Enrollment', on_delete=models.CASCADE, null=True, blank=True)
    payment = models.ForeignKey('payments.Payment', on_delete=models.CASCADE, null=True, blank=True)
    assignment = models.ForeignKey('courses.Assignment', on_delete=models.CASCADE, null=True, blank=True)
    submission = models.ForeignKey('courses.Submission', on_delete=models.CASCADE, null=True, blank=True)
    
    is_urgent = models.BooleanField(default=False)
    action_url = models.URLField(blank=True, null=True)
    action_text = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def mark_as_read(self):
        if self.status != NotificationStatus.READ:
            self.status = NotificationStatus.READ
            self.read_at = timezone.now()
            self.save()

class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    email_course_updates = models.BooleanField(default=True)
    email_payment_notifications = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

class EmailTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    template_type = models.CharField(max_length=50, choices=NotificationType.choices)
    subject = models.CharField(max_length=255)
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Notice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    message = models.TextField()
    # ✅ NEW: Image field for Notice
    image = models.ImageField(upload_to='notices/images/', null=True, blank=True)
    is_important = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title