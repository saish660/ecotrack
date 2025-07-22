from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime, timedelta


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