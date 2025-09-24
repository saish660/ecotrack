from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('ecotrack', '0025_alter_pushsubscription_web_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='pushsubscription',
            name='onesignal_player_id',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='pushsubscription',
            name='push_provider',
            field=models.CharField(default='fcm', max_length=20),
        ),
    ]
