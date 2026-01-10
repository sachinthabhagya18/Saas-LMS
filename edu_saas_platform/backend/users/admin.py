from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django_tenants.admin import TenantAdminMixin
from .models import User, Client, Domain

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Removed 'tenant' from list_display and list_filter
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Role & Profile', {'fields': ('role', 'phone', 'address', 'student_id')}),
    )

@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    # Changed 'teacher' to 'owner_email'
    list_display = ('name', 'schema_name', 'owner_email', 'created_on')
    search_fields = ('name', 'schema_name', 'owner_email')

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'tenant', 'is_primary')
    search_fields = ('domain',)