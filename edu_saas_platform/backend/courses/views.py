import logging
import traceback
from rest_framework import viewsets, status, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
# ✅ NEW: Import Parsers for handling file uploads
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from users.models import User
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.utils import timezone

from .models import Course, Chapter, Session, Enrollment, Assignment, Submission
from payments.models import Payment 

from .serializers import (
    CourseSerializer, ChapterSerializer, SessionSerializer,
    EnrollmentSerializer, AssignmentSerializer, SubmissionSerializer
)
from notifications.services import NotificationService

logger = logging.getLogger(__name__)

class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['teacher', 'admin']
        )

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    # ✅ FIXED: Add parsers to handle Image Uploads (Multipart) AND JSON
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        queryset = Course.objects.filter(published=True)
        if self.request.user.is_authenticated and self.request.user.role in ['teacher', 'admin']:
            queryset = Course.objects.all()

        course_type = self.request.query_params.get('course_type')
        if course_type:
            queryset = queryset.filter(course_type=course_type)

        is_free = self.request.query_params.get('is_free')
        if is_free is not None:
            queryset = queryset.filter(is_free=(is_free.lower() == 'true'))

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'chapters', 'sessions', 'stats', 'search']:
            return [permissions.AllowAny()]
        
        if self.action in ['enroll', 'enrollment_status']:
            return [permissions.IsAuthenticated()]

        return [permissions.IsAuthenticated(), IsTeacherOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        course = self.get_object()
        chapters = course.chapters.all().order_by('order')
        return Response(ChapterSerializer(chapters, many=True).data)

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        course = self.get_object()
        sessions = Session.objects.filter(
            chapter__course=course
        ).select_related('chapter').order_by('chapter__order', 'order')
        return Response(SessionSerializer(sessions, many=True).data)

    # ✅ FIXED: Enrollment Logic to handle retries
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        # Check for existing enrollment
        existing = Enrollment.objects.filter(student=user, course=course).first()
        
        if existing:
            # 1. If Paid -> Block duplicate
            if existing.status == 'paid':
                return Response({"detail": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)
            
            # 2. If Pending + Manual Slip Uploaded -> Block (Wait for approval)
            # (We assume if it's in Enrollment table with 'pending', it might be waiting for approval 
            # OR it's an old abandoned one. To be safe, we check if a Payment record exists)
            # BUT: In "Payment First" flow, Payments exist INDEPENDENTLY initially.
            
            # 3. Clean up "Abandoned" Pending Enrollment
            # If it's pending, we delete it so we can create a fresh one or just return it.
            # Returning the existing one allows frontend to proceed to payment.
            return Response(EnrollmentSerializer(existing).data, status=status.HTTP_200_OK)

        try:
            with transaction.atomic():
                enrollment = Enrollment.objects.create(
                    student=user, 
                    course=course, 
                    amount=0 if course.is_free else course.price, 
                    status='pending'
                )
                
                if course.is_free:
                    enrollment.status = 'paid'
                    enrollment.transaction_ref = f"FREE-{enrollment.id.hex[:8]}"
                    enrollment.save()
                    
            # Notification only if free (paid ones handled by payment webhook)
            if course.is_free:
                try:
                    NotificationService.send_in_app_notification(recipient=user, title="Enrollment Successful", message=f"You have successfully enrolled in {course.title}", notification_type='course_enrollment', course=course, enrollment=enrollment)
                except Exception as e: logger.error(f"Failed to send enrollment notification: {e}")
                
            return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            traceback.print_exc()
            logger.error(f"Enrollment failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total': Course.objects.filter(published=True).count(),
            'online': Course.objects.filter(published=True, course_type='online').count(),
            'physical': Course.objects.filter(published=True, course_type='physical').count(),
            'free': Course.objects.filter(published=True, is_free=True).count()
        })

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '')
        if not q:
            return Response([])
        
        courses = Course.objects.filter(published=True).filter(
            models.Q(title__icontains=q) | 
            models.Q(description__icontains=q)
        )
        return Response(CourseSerializer(courses, many=True).data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def enrollment_status(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        # 1. Check for Active Enrollment
        enrollment = Enrollment.objects.filter(student=user, course=course).first()
        if enrollment and enrollment.status == 'paid':
             return Response({'is_enrolled': True, 'status': 'paid', 'enrollment_id': enrollment.id})
        
        # 2. Check for Pending Manual Payment (Slip Uploaded)
        # Using the NEW relation (Payment -> Student/Course directly)
        pending_payment = Payment.objects.filter(student=user, course=course, payment_method='manual', status='pending').exists()
        
        if pending_payment:
             return Response({'is_enrolled': False, 'status': 'pending_approval'})

        return Response({'is_enrolled': False, 'status': None})




class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    # ✅ FIXED: Add parsers for Chapter banners
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Chapter.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        chapter = self.get_object()
        sessions = chapter.sessions.all().order_by('order')
        return Response(SessionSerializer(sessions, many=True).data)

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    # ✅ FIXED: Add parsers for Session files/banners
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Session.objects.all()
        chapter_id = self.request.query_params.get('chapter_id')
        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_complete(self, request, pk=None):
        session = self.get_object()
        user = request.user
        
        has_access = Enrollment.objects.filter(
            student=user, 
            course=session.chapter.course, 
            status='paid'
        ).exists()

        if not has_access:
            return Response(
                {"detail": "You must be enrolled and paid to complete sessions."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return Response({"status": "marked_complete", "session_id": session.id})

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        # Teachers see all enrollments
        return Enrollment.objects.all().order_by('-enrolled_at')

    
    def perform_update(self, serializer):
        user = self.request.user
        if user.role in ['teacher', 'admin']:
            # If status is in request, manually save it because it's read_only in serializer
            status_val = self.request.data.get('status')
            if status_val:
                serializer.save(status=status_val)
            else:
                serializer.save()
        else:
            serializer.save()


    def update(self, request, *args, **kwargs):
        if request.user.role not in ['teacher', 'admin']:
             return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Assignment.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser) # ✅ Good practice for submissions too
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Submission.objects.filter(student=user)
        return Submission.objects.all()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)