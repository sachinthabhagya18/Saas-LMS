from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'currency', 'payment_method', 'status', 
            'receipt_image', 'created_at', 'student_name', 'student_email', 'course_title'
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def get_student_name(self, obj):
        # Try getting user from direct link (new flow) or enrollment (old flow)
        user = obj.student
        if not user and obj.enrollment:
            user = obj.enrollment.student
            
        if user:
            if user.first_name or user.last_name:
                return f"{user.first_name} {user.last_name}".strip()
            return user.username
        return "Unknown Student"

    def get_student_email(self, obj):
        # Try direct student link first
        if obj.student:
            return obj.student.email
        # Fallback to enrollment link
        if obj.enrollment:
            return obj.enrollment.student.email
        return "N/A"

    def get_course_title(self, obj):
        # Try direct course link first
        if obj.course:
            return obj.course.title
        # Fallback to enrollment link
        if obj.enrollment:
            return obj.enrollment.course.title
        return "N/A"