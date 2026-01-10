import random
from django.contrib.auth.models import AbstractUser
from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
import uuid

# 1. Client (Tenant) Model - Exists in PUBLIC Schema only
class Client(TenantMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    
    # We link the tenant to a teacher's email/username string instead of a ForeignKey
    # because the User table is replicated in schemas, causing FK issues.
    owner_email = models.EmailField(null=True, blank=True) 
    
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)
    created_on = models.DateField(auto_now_add=True)
    auto_create_schema = True
    
    def __str__(self):
        return self.name

# 2. Domain Model - Exists in PUBLIC Schema only
class Domain(DomainMixin):
    tenant = models.ForeignKey(Client, related_name='domains', on_delete=models.CASCADE)
    
    def __str__(self):
        return self.domain

# 3. User Model - Exists in BOTH Public and Tenant Schemas
class User(AbstractUser):
    ROLES = (
        ('admin', 'Super Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLES, default='student')
    
    # ✅ Student ID Field
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Teacher specific fields
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        # ✅ Auto-generate Student ID for students if missing
        if self.role == 'student' and not self.student_id:
            while True:
                # Generate 6 digit random number
                new_id = str(random.randint(100000, 999999))
                # Ensure uniqueness
                if not User.objects.filter(student_id=new_id).exists():
                    self.student_id = new_id
                    break
        
        super().save(*args, **kwargs)
    



class AcademySettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academy_name = models.CharField(max_length=255, default="My Academy")
    # ... (Keep existing branding fields: logo, colors, hero, etc.) ...
    logo = models.ImageField(upload_to='branding/logos/', null=True, blank=True)
    favicon = models.ImageField(upload_to='branding/favicons/', null=True, blank=True)
    primary_color = models.CharField(max_length=50, default="#2563eb") 
    secondary_color = models.CharField(max_length=50, default="#7c3aed") 
    accent_color = models.CharField(max_length=50, default="#f59e0b") 
    hero_title = models.CharField(max_length=255, default="Learn Without Limits")
    hero_subtitle = models.TextField(default="Start, switch, or advance your career with our courses.")
    hero_image = models.ImageField(upload_to='branding/hero/', null=True, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)

    # ✅ NEW: Payment Gateway Settings (Per Tenant)
    # PayHere
    payhere_merchant_id = models.CharField(max_length=100, blank=True, help_text="PayHere Merchant ID")
    payhere_secret = models.CharField(max_length=255, blank=True, help_text="PayHere Merchant Secret")
    
    # OnePay
    onepay_merchant_id = models.CharField(max_length=100, blank=True, help_text="OnePay Merchant ID")
    onepay_app_id = models.CharField(max_length=100, blank=True, help_text="OnePay App ID")
    onepay_api_key = models.CharField(max_length=255, blank=True, help_text="OnePay Hash/API Salt")
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.academy_name}"

    class Meta:
        verbose_name = "Academy Setting"
        verbose_name_plural = "Academy Settings"


class GalleryImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to='branding/gallery/')
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']