from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'personal', views.NotificationViewSet, basename='notification')
router.register(r'notices', views.NoticeViewSet, basename='notice')
router.register(r'preferences', views.NotificationPreferenceViewSet, basename='preference')

urlpatterns = [
    path('', include(router.urls)),
]