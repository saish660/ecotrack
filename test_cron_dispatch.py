import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','DjangoProject.settings')
import django
from django.conf import settings
from django.utils import timezone
from datetime import time as dtime

django.setup()
from django.test import Client
from ecotrack.models import User, PushSubscription

settings.CRON_SECRET = 'testsecret'

u = User.objects.first() or User.objects.create_user(username='cronuser', password='x')

now = timezone.localtime(timezone.now())
# Normalize time to minute granularity
sched_time = dtime(hour=now.hour, minute=now.minute)
ps, _ = PushSubscription.objects.update_or_create(
    user=u,
    defaults={
        'onesignal_player_id': 'dummy-player-id',
        'provider': 'onesignal',
        'notification_time': sched_time,
        'is_active': True
    }
)

client = Client()
resp = client.get('/api/cron/dispatch?token=testsecret')
print('Status:', resp.status_code)
print('Body:', resp.content.decode())
