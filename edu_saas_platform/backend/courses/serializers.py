from rest_framework import serializers
from django.utils import timezone
from .models import Course, Chapter, Session, Enrollment, Assignment, Submission
from payments.models import Payment 

class CourseSerializer(serializers.ModelSerializer):
    enrollment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'banner',
            'price', 'currency', 'course_type', 'is_free', 'published', 'created_at',
            'enrollment_count', 'owner'
        ]
        read_only_fields = ['id', 'created_at', 'owner']
    
    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

class ChapterSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Chapter
        fields = ['id', 'course', 'course_title', 'title', 'banner', 'order']
        read_only_fields = ['id']

class SessionSerializer(serializers.ModelSerializer):
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    
    class Meta:
        model = Session
        fields = [
            'id', 'chapter', 'chapter_title', 'title', 'description', 'banner',
            'media_type', 'video_url', 'file', 'order', 'duration_seconds',
            'scheduled_at', 'recording_url'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        media_type = data.get('media_type')
        video_url = data.get('video_url')
        file = data.get('file')

        if media_type == 'video' and not video_url:
            raise serializers.ValidationError({'video_url': 'Video URL is required'})
        if media_type == 'pdf' and not file:
            raise serializers.ValidationError({'file': 'PDF file is required'})
        if media_type == 'link' and not video_url:
            raise serializers.ValidationError({'video_url': 'Link URL is required'})
        if media_type == 'zoom' and not video_url:
             raise serializers.ValidationError({'video_url': 'Zoom Meeting URL is required'})
        return data

class EnrollmentSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    
    # Student Details
    student_id = serializers.CharField(source='student.id', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    
    # Course Details
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_description = serializers.CharField(source='course.description', read_only=True)
    course_is_free = serializers.BooleanField(source='course.is_free', read_only=True)
    course_banner = serializers.ImageField(source='course.banner', read_only=True)

    # ✅ NEW: Check if a manual payment slip is pending
    has_pending_approval = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_id', 'student_name', 'student_email', 'student_username',
            'course', 'course_title', 'course_description', 
            'course_is_free', 'course_banner', 'enrolled_at', 'expires_at', 
            'status', 'amount', 'transaction_ref', 'has_pending_approval'
        ]
        read_only_fields = [
            'id', 'student', 'enrolled_at', 'expires_at', 
            'status', 'transaction_ref', 'course_title', 'course_description', 
            'course_is_free', 'course_banner', 'has_pending_approval'
        ]

    def get_student_name(self, obj):
        if obj.student.first_name or obj.student.last_name:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return obj.student.username

    def get_has_pending_approval(self, obj):
        # Checks if this enrollment has any payment record that is 'manual' and 'pending'
        return obj.payment_records.filter(payment_method='manual', status='pending').exists()

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user.role == 'student':
             if 'student' in attrs and attrs['student'] != request.user:
                raise serializers.ValidationError("You can only enroll yourself.")
        return attrs

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ('id', 'submitted_at')