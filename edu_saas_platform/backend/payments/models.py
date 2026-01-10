from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

User = settings.AUTH_USER_MODEL

class PaymentType(models.TextChoices):
    PER_COURSE = 'per_course', 'Per Course'
    PER_CHAPTER = 'per_chapter', 'Per Chapter'
    MONTHLY = 'monthly', 'Monthly'
    SESSION = 'session', 'Per Session'
    PHYSICAL = 'physical', 'Physical Class'

class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'
    REJECTED = 'rejected', 'Rejected' 

class Currency(models.TextChoices):
    LKR = 'LKR', 'Sri Lankan Rupee'
    USD = 'USD', 'US Dollar'

class Domain(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    domain_url = models.URLField()
    institution_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.LKR)
    duration_days = models.IntegerField(default=30)
    features = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_subscription_plans')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('onepay', 'OnePay'),
        ('stripe', 'Stripe'),
        ('payhere', 'PayHere'),
        ('manual', 'Manual/Bank Slip'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to your existing Enrollment model
    enrollment = models.ForeignKey('courses.Enrollment', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_records')
    
    # ✅ NEW: Directly link Student and Course for the pre-enrollment payment record
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.LKR)
    payment_type = models.CharField(max_length=20, choices=PaymentType.choices, default=PaymentType.PER_COURSE)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='payhere')
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    
    # ✅ NEW: Receipt Image for Manual Payments
    receipt_image = models.ImageField(upload_to='payments/receipts/', null=True, blank=True)
    
    gateway_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Commission fields for admin revenue
    admin_commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    admin_commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    instructor_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def student_username(self):
        return self.enrollment.student.username
    student_username.short_description = 'Student'
    
    def student_email(self):
        return self.enrollment.student.email
    student_email.short_description = 'Student Email'
    
    def course_title(self):
        return self.enrollment.course.title
    course_title.short_description = 'Course'
    
    def __str__(self):
        return f"Payment {self.id} - {self.enrollment.student.username} - {self.amount} {self.currency}"

class Commission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commissions_received')
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='commission_records')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    calculated_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Commission - {self.instructor.username} - {self.amount}"

class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    student_info = models.JSONField(default=dict)
    course_info = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        super().save(*args, **kwargs)

    def generate_invoice_number(self):
        return f"INV-{self.created_at.strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

    def __str__(self):
        return self.invoice_number

class DomainSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='subscriptions')
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.domain.name} - {self.subscription_plan.name}"

class RevenueReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_date = models.DateField()
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    admin_commission = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    instructor_payouts = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Revenue Report - {self.report_date}"