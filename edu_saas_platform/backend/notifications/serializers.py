from rest_framework import serializers
from django.utils.timesince import timesince
from django.utils import timezone
from .models import Notification, NotificationPreference, Notice

class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'status',
            'is_urgent', 'action_url', 'created_at', 'time_ago'
        ]
        read_only_fields = fields
    
    def get_time_ago(self, obj):
        return timesince(obj.created_at, timezone.now())

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = '__all__'

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        # ✅ Added 'image' to fields
        fields = ['id', 'title', 'message', 'image', 'is_important', 'created_at']
        read_only_fields = ['id', 'created_at']