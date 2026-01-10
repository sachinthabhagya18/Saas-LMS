from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, ChapterViewSet, SessionViewSet,
    EnrollmentViewSet, AssignmentViewSet, SubmissionViewSet
)

router = DefaultRouter()

# ✅ FIXED: Register specific endpoints FIRST to prevent URL conflicts
router.register(r'chapters', ChapterViewSet, basename='chapter')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'submissions', SubmissionViewSet, basename='submission')

# ✅ FIXED: Register the root '' endpoint LAST
router.register(r'', CourseViewSet, basename='course') 

urlpatterns = [
    path('', include(router.urls)),
]