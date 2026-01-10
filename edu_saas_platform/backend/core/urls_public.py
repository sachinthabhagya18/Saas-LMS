# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     path('django-admin/', admin.site.urls),
#     # Public endpoints (Tenant Registration, Login for Teachers)
#     path('api/auth/', include('users.urls')), 
#     path('api/payments/', include('payments.urls')),
#     path('api/courses/', include('courses.urls')),
#     path('api/notifications/', include('notifications.urls')),
# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Public endpoints (Tenant Registration, Login for Teachers)
    path('api/auth/', include('users.urls')), 
    path('api/payments/', include('payments.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)