from django.core.management.base import BaseCommand
from django.conf import settings
from ecotrack.models import PushSubscription
from ecotrack.onesignal_service import OneSignalService
import json
from datetime import datetime, timezone
import pytz
from google import genai


class Command(BaseCommand):
    help = 'Send daily push notifications to users using OneSignal (for Median apps)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending notifications',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS('DRY RUN MODE - No notifications will be sent')
            )
        
        # Check if OneSignal is configured
        if not getattr(settings, 'ONESIGNAL_APP_ID', '') or not getattr(settings, 'ONESIGNAL_REST_API_KEY', ''):
            self.stdout.write(
                self.style.ERROR('OneSignal not configured. Set ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY in environment variables.')
            )
            return
        
        # Get current time in the server timezone
        tz = pytz.timezone(settings.TIME_ZONE)
        current_time = datetime.now(tz).time()
        
        # Find all active subscriptions that should receive notifications now
        current_hour = current_time.hour
        current_minute = current_time.minute
        
        # Get subscriptions that match the current hour and minute exactly and have valid OneSignal player IDs
        subscriptions = PushSubscription.objects.filter(
            is_active=True,
            provider='onesignal',
            notification_time__hour=current_hour,
            notification_time__minute=current_minute
        ).exclude(
            onesignal_player_id__isnull=True
        ).exclude(
            onesignal_player_id__exact=''
        )
        
        if not subscriptions.exists():
            self.stdout.write(
                self.style.WARNING(
                    f'No active OneSignal subscriptions found for current time: {current_time.strftime("%H:%M")}'
                )
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Found {subscriptions.count()} OneSignal subscriptions to process at {current_time.strftime("%H:%M")}'
            )
        )
        
        sent_count = 0
        failed_count = 0
        
        for subscription in subscriptions:
            try:
                user = subscription.user
                # Check if already sent today for this scheduled time
                today_date = datetime.now(tz).date()
                if (
                    subscription.last_sent_date == today_date
                    and subscription.last_sent_time == subscription.notification_time
                ):
                    # Skip as it's already sent today for this time
                    continue
                
                # Create personalized notification message using Gemini AI
                try:
                    client = genai.Client()

                    prompt = f"""
                        Generate 1 single short, catchy, and engaging notification message strictly to encourage users to fill out the EcoTrack check-in form.
                        EcoTrack is an app that helps users track their sustainability habits and promotes eco-friendly behavior. It includes features like:
                        - Daily surveys to track eco actions 🌱
                        - Personalized sustainability score 📊
                        - AI chatbot to guide users 🤖
                        - Personalized suggestions for greener living 💡
                        - Achievements for completing surveys and taking eco-friendly actions 🎁
                        - Daily streaks kept alive by submitting check-in everyday

                        Ensure the notifications are:
                        - under 60 characters
                        - Friendly, heartwarming, motivating, and aligned with EcoTrack's eco-conscious mission
                        - Include clear call-to-actions like "Share your thoughts", "fill now", "complete now"
                        - Include relevant emojis for engagement
                        - Highlight rewards or benefits if possible
                        Give the message a human touch, with some warmth, inviting gesture and showing that you care for the user.
                        The user's username is {user.username}, in case you need it.
                    """

                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt,
                    ).text
                except:
                    response = f"Hey {user.username}!, time to track your eco habits 🌱"
                
                if dry_run:
                    self.stdout.write(
                        f'Would send OneSignal notification to: {user.username} at {subscription.notification_time}'
                    )
                    self.stdout.write(f'Message: {response}')
                    sent_count += 1
                    continue
                
                # Check if OneSignal player ID exists
                player_id = subscription.get_onesignal_player_id()
                if not player_id or not player_id.strip():
                    self.stdout.write(
                        self.style.WARNING(f'Skipping {user.username} - no OneSignal player ID')
                    )
                    # Mark subscription as inactive since it has no player ID
                    subscription.is_active = False
                    subscription.save()
                    continue
                
                # Send OneSignal notification
                success = OneSignalService.send_notification(
                    player_id=player_id,
                    title='Daily Check-in Reminder',
                    body=response,
                    data={
                        'url': '/',
                        'timestamp': str(datetime.now()),
                        'type': 'daily_reminder',
                        'user_id': str(user.id)
                    }
                )
                
                if success:
                    self.stdout.write(
                        self.style.SUCCESS(f'Sent OneSignal notification to: {user.username}')
                    )
                    # Update last sent markers
                    subscription.last_sent_date = today_date
                    subscription.last_sent_time = subscription.notification_time
                    subscription.save(update_fields=["last_sent_date", "last_sent_time", "updated_at"])
                    sent_count += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(f'Failed to send OneSignal notification to: {user.username}')
                    )
                    failed_count += 1
                
            except Exception as ex:
                self.stdout.write(
                    self.style.ERROR(
                        f'Unexpected error sending notification to user {subscription.user.username}: {str(ex)}'
                    )
                )
                failed_count += 1
        
        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary:'
                f'\n- Sent: {sent_count} OneSignal notifications'
                f'\n- Failed: {failed_count} notifications'
                f'\n- Total processed: {sent_count + failed_count}'
            )
        )