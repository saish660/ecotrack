from django.db import migrations, models

class Migration(migrations.Migration):
    """
    This migration originally added onesignal_player_id and push_provider.
    They already exist in the current database (perhaps manually added or from a prior attempt),
    so we convert this migration into a no-op to avoid duplicate column errors.
    """

    dependencies = [
        ('ecotrack', '0025_alter_pushsubscription_web_fields'),
    ]

    operations = []
