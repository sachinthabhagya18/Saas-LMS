from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.PaymentViewSet, basename='payment')

urlpatterns = [
    # ✅ FIX: params are now <uuid:course_id>
    path('init-payhere/<uuid:course_id>/', views.init_payhere_payment, name='init_payhere'),
    path('init-onepay/<uuid:course_id>/', views.init_onepay_payment, name='init_onepay'),
    path('payhere/notify/', views.payhere_notify, name='payhere_notify'),
    path('', include(router.urls)),
]