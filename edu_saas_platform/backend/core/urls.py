# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     path('django-admin/', admin.site.urls),
#     path('api/auth/', include('users.urls')),  # auth endpoints
#     path('api/courses/', include('courses.urls')),  # courses endpoints
#     path('api/notifications/', include('notifications.urls')),  # notifications endpoints
#     path('api/payments/', include('payments.urls')),  # payments endpoints
#     path('api/teachers/', include('teachers.urls')),  # Add this line

# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),  # auth endpoints
    path('api/courses/', include('courses.urls')),  # courses endpoints
    path('api/notifications/', include('notifications.urls')),  # notifications endpoints
    path('api/payments/', include('payments.urls')),  # payments endpoints
    path('api/teachers/', include('teachers.urls')),  # Add this line

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)