from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecotrack', '0024_alter_user_last_checkin'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pushsubscription',
            name='endpoint',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='pushsubscription',
            name='p256dh_key',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='pushsubscription',
            name='auth_key',
            field=models.TextField(blank=True, null=True),
        ),
    ]
