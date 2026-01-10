from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

# ✅ NEW: Router for students
router = DefaultRouter()
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'gallery', views.GalleryImageViewSet, basename='gallery')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('teachers/', views.TeacherListView.as_view(), name='teacher-list'),
    path('teacher-domains/', views.TeacherDomainsView.as_view(), name='teacher-domains'),
    path('teacher-domains/<int:id>/', views.TeacherDomainUpdateView.as_view(), name='teacher-domain-update'),
    path('verify/', views.verify_token, name='verify-token'),
    path('teacher-check/', views.teacher_check, name='teacher-check'),
    path('settings/', views.AcademySettingsView.as_view(), name='academy-settings'),
    path('admin/revenue/', views.SuperAdminRevenueView.as_view(), name='admin-revenue'),
    
    # ✅ Include router URLs for students (e.g., /api/auth/students/)
    path('', include(router.urls)),
]