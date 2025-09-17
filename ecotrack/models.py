from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime, timedelta
import json


def get_default_dict():
    return {}


class User(AbstractUser):
    days_since_last_survey = models.PositiveIntegerField(default=0)
    streak = models.PositiveIntegerField(default=0)
    sustainability_score = models.PositiveIntegerField(default=0)
    carbon_footprint = models.JSONField(default=list, blank=True)
    habits = models.JSONField(default=list, blank=True)
    user_data = models.JSONField(default=get_default_dict, blank=True)
    survey_answered = models.BooleanField(default=False)
    achievements = models.JSONField(default=list, blank=True)
    last_checkin = models.DateField(null=True, blank=True, default=datetime.now() - timedelta(days=1))
    habits_today = models.PositiveIntegerField(default=0)
    last_8_footprint_measurements = models.JSONField(default=list, blank=True)

    # By inheriting from AbstractUser, you get these fields automatically:
    # username
    # first_name
    # last_name
    # email
    # password
    # groups
    # user_permissions
    # is_staff
    # is_active
    # is_superuser
    # last_login
    # date_joined

    def __str__(self):
        return self.username


class PushSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='push_subscription')
    endpoint = models.TextField()
    p256dh_key = models.TextField()
    auth_key = models.TextField()
    notification_time = models.TimeField(default=datetime.strptime('09:00', '%H:%M').time())  # Default to 9:00 AM
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # De-duplication tracking to avoid multiple sends in the same day for the same scheduled time
    last_sent_date = models.DateField(null=True, blank=True)
    last_sent_time = models.TimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - Push Subscription"
    
    def get_subscription_info(self):
        """Return subscription info in the format expected by pywebpush"""
        return {
            'endpoint': self.endpoint,
            'keys': {
                'p256dh': self.p256dh_key,
                'auth': self.auth_key
            }
        }