from django.core.management.base import BaseCommand
from django.conf import settings
from ecotrack.models import PushSubscription
from pywebpush import webpush, WebPushException
import json
from datetime import datetime, timezone
import pytz


class Command(BaseCommand):
    help = 'Send daily push notifications to users'

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
        
        # Get current time in the server timezone
        tz = pytz.timezone(settings.TIME_ZONE)
        current_time = datetime.now(tz).time()
        
        # Find all active subscriptions that should receive notifications now
        current_hour = current_time.hour
        current_minute = current_time.minute
        
        # Get subscriptions that match the current hour and minute exactly
        subscriptions = PushSubscription.objects.filter(
            is_active=True,
            notification_time__hour=current_hour,
            notification_time__minute=current_minute
        )
        
        if not subscriptions.exists():
            self.stdout.write(
                self.style.WARNING(
                    f'No active subscriptions found for current time: {current_time.strftime("%H:%M")}'
                )
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Found {subscriptions.count()} subscriptions to process at {current_time.strftime("%H:%M")}'
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
                
                # Create personalized notification payload
                payload = {
                    'title': 'EcoTrack Daily Reminder',
                    'body': f'Hi {user.first_name or user.username}! Time to check in on your sustainability goals.',
                    'icon': '/static/icons/ecotrack_logo.png',
                    'badge': '/static/icons/favicon-32x32.png',
                    'tag': 'daily-reminder',
                    'data': {
                        'url': '/',
                        'timestamp': str(datetime.now())
                    },
                    'actions': [
                        {
                            'action': 'open_app',
                            'title': 'Open EcoTrack',
                            'icon': '/static/icons/favicon-32x32.png'
                        }
                    ]
                }
                
                if dry_run:
                    self.stdout.write(
                        f'Would send notification to: {user.username} at {subscription.notification_time}'
                    )
                    sent_count += 1
                    continue
                
                # Send notification
                webpush(
                    subscription_info=subscription.get_subscription_info(),
                    data=json.dumps(payload),
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims={
                        "sub": settings.VAPID_CLAIMS_EMAIL,
                    }
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'Sent notification to: {user.username}')
                )
                # Update last sent markers
                subscription.last_sent_date = today_date
                subscription.last_sent_time = subscription.notification_time
                subscription.save(update_fields=["last_sent_date", "last_sent_time", "updated_at"])
                sent_count += 1
                
            except WebPushException as ex:
                self.stdout.write(
                    self.style.ERROR(
                        f'Failed to send notification to user {subscription.user.username}: {str(ex)}'
                    )
                )
                failed_count += 1
                
                # If the subscription is invalid, deactivate it
                if ex.response and ex.response.status_code in [404, 410]:
                    subscription.is_active = False
                    subscription.save()
                    self.stdout.write(
                        self.style.WARNING(
                            f'Deactivated invalid subscription for user: {subscription.user.username}'
                        )
                    )
                    
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
                f'\n- Sent: {sent_count} notifications'
                f'\n- Failed: {failed_count} notifications'
                f'\n- Total processed: {sent_count + failed_count}'
            )
        )