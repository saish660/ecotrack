import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','DjangoProject.settings')
import django

django.setup()
from django.contrib.auth import get_user_model
from django.test import Client

User = get_user_model()
user = User.objects.first()
print('First user:', user)
if not user:
    raise SystemExit('No users in database')

client = Client()
client.force_login(user)
resp = client.get('/api/notifications/settings')
print('Status code:', resp.status_code)
print('Response body:\n', resp.content.decode())
