from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
import uuid

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    COURSE_TYPE = (
        ('online', 'Online'),
        ('physical', 'Physical'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_courses')
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    # ✅ NEW: Banner Image
    banner = models.ImageField(upload_to='courses/banners/', null=True, blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='LKR')
    course_type = models.CharField(max_length=20, choices=COURSE_TYPE, default='online')
    is_free = models.BooleanField(default=False)
    expiry_days = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

class Chapter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    # ✅ NEW: Banner Image
    banner = models.ImageField(upload_to='chapters/banners/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Session(models.Model):
    MEDIA_TYPE = (
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('link', 'Link'),
        ('zoom', 'Zoom Class'), # ✅ Added Zoom Type
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    banner = models.ImageField(upload_to='sessions/banners/', null=True, blank=True)
    
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE, default='video')
    
    # Used for: Video URL, External Link, or Zoom Join URL
    video_url = models.URLField(blank=True, null=True, help_text="External video link, Zoom Join URL, or S3 url")
    
    file = models.FileField(upload_to='sessions/files/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    
    # ✅ NEW FIELDS FOR ZOOM
    scheduled_at = models.DateTimeField(null=True, blank=True, help_text="Date and time for Zoom class")
    recording_url = models.URLField(blank=True, null=True, help_text="YouTube link for the class recording")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.chapter.title} - {self.title}"

class Enrollment(models.Model):
    # ... (Keep existing Enrollment code exactly as is)
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transaction_ref = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('student', 'course')

    def save(self, *args, **kwargs):
        if self.course.expiry_days and not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=self.course.expiry_days)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} -> {self.course.title}"

class Assignment(models.Model):
    # ... (Keep existing Assignment code)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)

class Submission(models.Model):
    # ... (Keep existing Submission code)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='assignments/submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')