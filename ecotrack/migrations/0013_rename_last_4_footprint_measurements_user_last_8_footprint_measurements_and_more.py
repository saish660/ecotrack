# Generated by Django 5.2.4 on 2025-07-23 10:40

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecotrack', '0012_user_last_4_footprint_measurements_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='last_4_footprint_measurements',
            new_name='last_8_footprint_measurements',
        ),
        migrations.AlterField(
            model_name='user',
            name='last_checkin',
            field=models.DateField(blank=True, default=datetime.datetime(2025, 7, 22, 16, 10, 52, 401640), null=True),
        ),
    ]
