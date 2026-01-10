from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_username', 'course_title', 'amount', 'status', 'created_at')
    list_filter = ('status', 'payment_method')
    search_fields = ('gateway_transaction_id', 'enrollment__student__username')
    
    def student_username(self, obj):
        return obj.enrollment.student.username
    
    def course_title(self, obj):
        return obj.enrollment.course.title