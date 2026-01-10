from rest_framework import serializers
from .models import User, AcademySettings,GalleryImage
from django.contrib.auth.password_validation import validate_password
from django.db import connection

# ... (Keep RegisterSerializer and UserSerializer as they are) ...

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    teacher_domain = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role', 'first_name', 'last_name', 'student_id', 'teacher_domain')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'student_id': {'required': False},
            'role': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "A user with that username already exists."})
            
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data.pop('teacher_domain', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    teacher_domain = serializers.SerializerMethodField()

    class Meta:
        model = User
        # ✅ Fields MUST include 'phone' and 'address' for profile updates to work
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name', 'student_id', 'phone', 'address', 'teacher_domain')
        read_only_fields = ('id', 'teacher_domain')

    def get_teacher_domain(self, obj):
        if obj.role == 'teacher' and hasattr(obj, 'tenant_client'):
            domain = obj.tenant_client.domains.filter(is_primary=True).first()
            return domain.domain if domain else None
        return None
        return None

# ✅ NEW: Serializer for Updating Tenant/Domain
class TenantUpdateSerializer(serializers.Serializer):
    domain = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)


# ✅ NEW: Serializer for Teachers to Manage Students
class StudentManageSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'student_id', 'phone', 'address', 'password', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data['role'] = 'student' # Enforce role
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
    

# ✅ UPDATED: Include Payment Fields
class AcademySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademySettings
        fields = '__all__'
        # Note: In a real production app, you might want to make secrets 'write_only' 
        # so they aren't visible in API responses, but for editing forms we usually need them.

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = '__all__'