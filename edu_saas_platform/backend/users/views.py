import datetime
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django_tenants.utils import schema_context, get_tenant_model, get_tenant_domain_model
from django.db import transaction
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import User, Domain, AcademySettings, GalleryImage
from .serializers import RegisterSerializer, UserSerializer, TenantUpdateSerializer, StudentManageSerializer, AcademySettingsSerializer, GalleryImageSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        role = request.data.get('role', 'student')
        if role == 'teacher':
            return self.register_teacher(request)
        return super().create(request, *args, **kwargs)

    def register_teacher(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        username = data['username']
        email = data['email']
        password = data['password']
        
        tenant_name = f"{username}'s Academy"
        schema_name = f"teacher_{username.lower().replace(' ', '')}"
        
        host_port = request.get_host().split(':')[-1] if ':' in request.get_host() else '8000'
        domain_base = f"{username.lower()}.localhost"
        
        if settings.DEBUG:
             domain_url = f"{domain_base}:{host_port}"
        else:
             domain_url = f"{username.lower()}.yourdomain.com"

        try:
            with transaction.atomic():
                client = get_tenant_model().objects.create(
                    name=tenant_name,
                    schema_name=schema_name,
                    owner_email=email
                )
                
                get_tenant_domain_model().objects.create(
                    domain=domain_url,
                    tenant=client,
                    is_primary=True
                )
                
                User.objects.create_user(
                    username=username, 
                    email=email, 
                    password=password, 
                    role='teacher'
                )

                with schema_context(schema_name):
                    User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        role='teacher'
                    )

            return Response({
                "message": "Academy created successfully.",
                "domain": domain_url,
                "login_url": f"http://{domain_url}/login"
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class UserProfileView(generics.RetrieveAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = UserSerializer
#     def get_object(self):
#         return self.request.user

class TeacherListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    def get_queryset(self):
        return User.objects.filter(role='teacher')

class TeacherDomainsView(generics.ListAPIView):
    permission_classes = [AllowAny] 
    
    def list(self, request, *args, **kwargs):
        try:
            domains = Domain.objects.filter(is_primary=True).exclude(tenant__schema_name='public')
            domain_list = []
            for domain in domains:
                email = getattr(domain.tenant, 'owner_email', 'Unknown') or "No Email"
                domain_list.append({
                    'id': str(domain.id),
                    'domain': domain.domain,
                    'teacher_email': email,
                    'schema_name': domain.tenant.schema_name,
                    'created_on': domain.tenant.created_on
                })
            return Response(domain_list)
        except Exception as e:
            return Response([], status=status.HTTP_200_OK)

class TeacherDomainUpdateView(generics.UpdateAPIView):
    permission_classes = [AllowAny] 
    serializer_class = TenantUpdateSerializer
    queryset = Domain.objects.all()
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        domain_id = kwargs.get('id')
        domain_obj = get_object_or_404(Domain, id=domain_id)
        tenant = domain_obj.tenant
        
        new_domain = request.data.get('domain')
        new_password = request.data.get('password')
        
        try:
            with transaction.atomic():
                if new_domain and new_domain != domain_obj.domain:
                    domain_obj.domain = new_domain
                    domain_obj.save()
                
                if new_password:
                    owner_email = tenant.owner_email
                    if owner_email:
                        try:
                            public_user = User.objects.get(email=owner_email)
                            public_user.set_password(new_password)
                            public_user.save()
                        except User.DoesNotExist:
                            pass 
                        
                        with schema_context(tenant.schema_name):
                            try:
                                tenant_user = User.objects.get(email=owner_email)
                                tenant_user.set_password(new_password)
                                tenant_user.save()
                            except User.DoesNotExist:
                                pass 
                                
            return Response({'message': 'Academy updated successfully', 'domain': domain_obj.domain})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ✅ NEW: Student ViewSet for Teachers
class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentManageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Teachers should only see students within their tenant
        return User.objects.filter(role='student').order_by('-date_joined')

# Token verification views
from rest_framework.decorators import api_view
@api_view(['GET'])
def verify_token(request):
    return Response({'valid': True, 'user': {'id': request.user.id, 'role': request.user.role}})

@api_view(['GET'])
def teacher_check(request):
    if request.user.role != 'teacher':
        return Response({'error': 'Teacher access required'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'message': 'Access granted'})

# ✅ FIXED: Allow Updates (PATCH) for User Profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # Custom update to handle password separately if needed
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if password is in data
        password = request.data.get('password')
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if password:
            instance.set_password(password)
            instance.save()

        return Response(serializer.data)


class AcademySettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = AcademySettingsSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self):
        # ✅ FIXED: Get the first record regardless of ID (Singleton pattern)
        # This fixes the "id=1" error with UUIDs
        obj = AcademySettings.objects.first()
        if not obj:
            # Create default if it doesn't exist
            obj = AcademySettings.objects.create(academy_name="My Academy")
        return obj


# ✅ NEW: Gallery ViewSet
class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        # Allow public read access for the gallery page
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
class SuperAdminRevenueView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        Client = get_tenant_model()
        tenants = Client.objects.exclude(schema_name='public')
        
        month_param = request.query_params.get('month')
        filter_year = None
        filter_month = None
        
        if month_param:
            try:
                # This line was crashing before due to missing import
                date_obj = datetime.datetime.strptime(month_param, "%Y-%m")
                filter_year = date_obj.year
                filter_month = date_obj.month
            except ValueError:
                pass 

        report_data = []
        global_stats = {
            'total_revenue': 0,
            'total_sales': 0,
            'total_courses': 0,
            'top_course': None,
            'top_teacher': None
        }
        
        teacher_revenues = {}

        for tenant in tenants:
            try:
                with schema_context(tenant.schema_name):
                    from courses.models import Course, Enrollment

                    courses = Course.objects.all()
                    
                    for course in courses:
                        enrollments_query = Enrollment.objects.filter(course=course, status='paid')
                        
                        if filter_year and filter_month:
                            enrollments_query = enrollments_query.filter(
                                enrolled_at__year=filter_year,
                                enrolled_at__month=filter_month
                            )
                        
                        paid_count = enrollments_query.count()
                        revenue = paid_count * float(course.price)
                        
                        # Show if there are sales OR if we are not filtering by month (show lifetime stats)
                        # Modified logic: If month filter active, only show items with sales in that month.
                        # If no filter, show all courses with lifetime sales > 0
                        show_item = paid_count > 0 if month_param else paid_count >= 0

                        if show_item and paid_count > 0:
                            item = {
                                'tenant_name': tenant.name,
                                'owner_email': tenant.owner_email,
                                'course_title': course.title,
                                'price': float(course.price),
                                'currency': course.currency,
                                'sales_count': paid_count,
                                'revenue': revenue,
                                'is_free': course.is_free
                            }
                            report_data.append(item)
                            
                            global_stats['total_revenue'] += revenue
                            global_stats['total_sales'] += paid_count
                            
                            t_name = tenant.name
                            teacher_revenues[t_name] = teacher_revenues.get(t_name, 0) + revenue

                    global_stats['total_courses'] += courses.count()

            except Exception as e:
                print(f"Error processing tenant {tenant.schema_name}: {e}")
                continue
        
        if report_data:
            sorted_courses = sorted(report_data, key=lambda x: x['revenue'], reverse=True)
            global_stats['top_course'] = sorted_courses[0]['course_title'] if sorted_courses else "N/A"
            
        if teacher_revenues:
            top_t = max(teacher_revenues, key=teacher_revenues.get)
            global_stats['top_teacher'] = top_t

        return Response({
            'stats': global_stats,
            'details': report_data
        })

    """
    Aggregates course sales and revenue across ALL tenants.
    Supports filtering by month (YYYY-MM).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        Client = get_tenant_model()
        tenants = Client.objects.exclude(schema_name='public')
        
        # Get Month Parameter (e.g., "2023-11")
        month_param = request.query_params.get('month')
        filter_year = None
        filter_month = None
        
        if month_param:
            try:
                date_obj = datetime.datetime.strptime(month_param, "%Y-%m")
                filter_year = date_obj.year
                filter_month = date_obj.month
            except ValueError:
                pass # Ignore invalid format

        report_data = []
        global_stats = {
            'total_revenue': 0,
            'total_sales': 0,
            'total_courses': 0,
            'top_course': None,
            'top_teacher': None
        }
        
        teacher_revenues = {}

        for tenant in tenants:
            try:
                with schema_context(tenant.schema_name):
                    from courses.models import Course, Enrollment

                    # Get active courses
                    courses = Course.objects.all()
                    
                    for course in courses:
                        # Filter Enrollments by Status AND Date (if provided)
                        enrollments_query = Enrollment.objects.filter(course=course, status='paid')
                        
                        if filter_year and filter_month:
                            enrollments_query = enrollments_query.filter(
                                enrolled_at__year=filter_year,
                                enrolled_at__month=filter_month
                            )
                        
                        paid_count = enrollments_query.count()
                        revenue = paid_count * float(course.price)
                        
                        if paid_count > 0 or not month_param: 
                            # If filtering by month, only show active courses. 
                            # If no filter, show everything or adjust logic as needed.
                            if paid_count > 0:
                                item = {
                                    'tenant_name': tenant.name,
                                    'owner_email': tenant.owner_email,
                                    'course_title': course.title,
                                    'price': float(course.price),
                                    'currency': course.currency,
                                    'sales_count': paid_count,
                                    'revenue': revenue,
                                    'is_free': course.is_free
                                }
                                report_data.append(item)
                                
                                # Aggregations
                                global_stats['total_revenue'] += revenue
                                global_stats['total_sales'] += paid_count
                                
                                # Teacher stats
                                t_name = tenant.name
                                teacher_revenues[t_name] = teacher_revenues.get(t_name, 0) + revenue

                    global_stats['total_courses'] += courses.count()

            except Exception as e:
                print(f"Error processing tenant {tenant.schema_name}: {e}")
                continue
        
        if report_data:
            sorted_courses = sorted(report_data, key=lambda x: x['revenue'], reverse=True)
            global_stats['top_course'] = sorted_courses[0]['course_title'] if sorted_courses else "N/A"
            
        if teacher_revenues:
            top_t = max(teacher_revenues, key=teacher_revenues.get)
            global_stats['top_teacher'] = top_t

        return Response({
            'stats': global_stats,
            'details': report_data
        })