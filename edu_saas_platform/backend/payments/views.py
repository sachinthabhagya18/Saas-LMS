import hashlib
import json
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes, authentication_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.db import transaction

from .models import Payment
from .serializers import PaymentSerializer
# ✅ FIX: Import Course model
from courses.models import Enrollment, Course 
from users.models import AcademySettings

def get_tenant_payment_config():
    config = AcademySettings.objects.first()
    return config

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        user = self.request.user
        if user.role in ['teacher', 'admin']:
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(student=user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def upload_receipt(self, request):
        # ✅ FIX: Read course_id from request (Frontend sends this now)
        course_id = request.data.get('course_id')
        
        # If frontend is still sending enrollment_id by mistake, we could handle it, 
        # but for the new flow we strictly want course_id.
        if not course_id: 
            return Response({'error': 'Course ID required'}, status=400)
        
        course = get_object_or_404(Course, id=course_id)
        
        # Check duplicate pending
        existing = Payment.objects.filter(student=request.user, course=course, status='pending', payment_method='manual').first()
        if existing:
            return Response({'error': 'You already have a pending slip for this course.'}, status=400)

        # ✅ Create Payment linked to Course & Student (Enrollment is None for now)
        payment = Payment.objects.create(
            student=request.user,
            course=course,
            amount=course.price,
            currency=course.currency,
            payment_method='manual',
            status='pending',
            receipt_image=request.data.get('receipt_image')
        )
        return Response(PaymentSerializer(payment).data, status=201)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'teacher': return Response({'error': 'Only teachers can approve'}, status=403)
        payment = self.get_object()
        
        if payment.status == 'completed': return Response({'message': 'Already approved'})
        
        try:
            with transaction.atomic():
                payment.status = 'completed'
                
                # ✅ FIX: Create the Enrollment now if it doesn't exist
                enrollment, created = Enrollment.objects.get_or_create(
                    student=payment.student,
                    course=payment.course,
                    defaults={'status': 'paid', 'amount': payment.amount}
                )
                
                # If it existed but was pending/expired, force it to paid
                if not created:
                    enrollment.status = 'paid'
                    enrollment.save()
                    
                # Link enrollment to payment
                payment.enrollment = enrollment
                payment.save()

            return Response({'status': 'approved'})
            
        except Exception as e:
            print(f"Error approving payment: {e}")
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'teacher': return Response({'error': 'Only teachers can reject'}, status=403)
        payment = self.get_object()
        payment.status = 'rejected'
        payment.save()
        return Response({'status': 'rejected'})


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def init_payhere_payment(request, course_id):
    try:
        config = get_tenant_payment_config()
        if not config or not config.payhere_merchant_id:
            return Response({'error': 'PayHere not configured.'}, status=400)
        
        course = get_object_or_404(Course, id=course_id)
        user = request.user

        payment = Payment.objects.create(
            student=user,
            course=course,
            amount=course.price,
            currency='LKR',
            payment_method='payhere',
            status='pending'
        )

        amount_formatted = "{:.2f}".format(float(payment.amount))
        order_id = str(payment.id)
        
        merchant_id = config.payhere_merchant_id
        merchant_secret = config.payhere_secret
        hashed_secret = hashlib.md5(merchant_secret.encode('utf-8')).hexdigest().upper()
        hash_string = f"{merchant_id}{order_id}{amount_formatted}LKR{hashed_secret}"
        payment_hash = hashlib.md5(hash_string.encode('utf-8')).hexdigest().upper()

        host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        if ':8000' in host: frontend_host = host.replace(':8000', ':3000')
        else: frontend_host = host 
        
        data = {
            "sandbox": "1", 
            "merchant_id": merchant_id,
            "return_url": f"{protocol}://{frontend_host}/student/courses/{course.id}/learn", 
            "cancel_url": f"{protocol}://{frontend_host}/student/courses/{course.id}",       
            "notify_url": f"{protocol}://{host}/api/payments/payhere/notify/",
            "order_id": order_id,
            "items": f"Course: {course.title}",
            "currency": "LKR",
            "amount": amount_formatted,
            "first_name": user.first_name or "Student",
            "last_name": user.last_name or "User",
            "email": user.email,
            "phone": user.phone or "0777123456",
            "address": user.address or "Colombo",
            "city": "Colombo",
            "country": "Sri Lanka",
            "hash": payment_hash
        }
        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def init_onepay_payment(request, course_id):
    try:
        config = get_tenant_payment_config()
        if not config or not config.onepay_merchant_id: return Response({'error': 'OnePay not configured.'}, status=400)

        course = get_object_or_404(Course, id=course_id)
        user = request.user

        payment = Payment.objects.create(
            student=user, course=course, amount=course.price,
            currency='LKR', payment_method='onepay', status='pending'
        )

        amount_formatted = "{:.2f}".format(float(payment.amount))
        reference = str(payment.id)
        
        hash_source = f"{config.onepay_merchant_id}{config.onepay_app_id}{config.onepay_api_key}{amount_formatted}{reference}"
        payment_hash = hashlib.sha256(hash_source.encode('utf-8')).hexdigest()

        host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        if ':8000' in host: frontend_host = host.replace(':8000', ':3000')
        else: frontend_host = host 
        
        redirect_url = "https://www.onepay.lk/ipg/request.php" 
        params = {
            "merchant_id": config.onepay_merchant_id,
            "app_id": config.onepay_app_id,
            "reference": reference,
            "amount": amount_formatted,
            "currency": "LKR",
            "hash": payment_hash,
            "customer_first_name": user.first_name or "Student",
            "customer_last_name": user.last_name or "User",
            "customer_email": user.email,
            "customer_phone_number": user.phone or "0777123456",
            "transaction_redirect_url": f"{protocol}://{frontend_host}/student/courses/{course.id}/learn",
            "additional_data": "Course Enrollment"
        }
        return Response({"url": redirect_url, "params": params})

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny]) 
def payhere_notify(request):
    try:
        data = request.data
        order_id = data.get('order_id')
        status_code = data.get('status_code')
        
        if str(status_code) == '2': 
            try:
                payment = Payment.objects.get(id=order_id)
                if payment.status != 'completed':
                    with transaction.atomic():
                        payment.status = 'completed'
                        payment.gateway_transaction_id = data.get('payment_id')
                        payment.save()
                        
                        enrollment, created = Enrollment.objects.get_or_create(
                            student=payment.student,
                            course=payment.course,
                            defaults={'status': 'paid', 'amount': payment.amount}
                        )
                        if not created:
                            enrollment.status = 'paid'
                            enrollment.save()
                            
                        payment.enrollment = enrollment
                        payment.save()
                        
                return Response({'status': 'success'})
            except Payment.DoesNotExist:
                return Response({'error': 'Payment not found'}, status=404)

        return Response({'status': 'ignored'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)