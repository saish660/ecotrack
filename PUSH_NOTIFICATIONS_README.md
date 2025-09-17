# EcoTrack Push Notifications Setup

This guide explains how to set up and use the push notification feature in EcoTrack.

## Features Implemented

✅ **Push Notification Subscription System**

- Users can enable/disable push notifications
- Customizable daily notification times
- Test notification functionality
- Automatic cleanup of invalid subscriptions

✅ **Backend Components**

- Django models for storing push subscriptions
- REST API endpoints for subscription management
- VAPID keys for secure push messaging
- Management commands for sending scheduled notifications

✅ **Frontend Components**

- Service worker for handling background notifications
- Interactive UI for notification settings
- JavaScript for subscription management
- Responsive notification settings panel

✅ **Scheduling System**

- Management command for sending daily notifications
- Cross-platform scheduler script
- Windows batch script for Task Scheduler
- Flexible time-based notification delivery

## Quick Start

### 1. Installation

All required packages are already included in `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 2. Database Migration

The push notification model is already migrated:

```bash
python manage.py migrate
```

### 3. VAPID Keys

VAPID keys are already generated and configured in `settings.py`.

### 4. Start the Server

```bash
python manage.py runserver
```

## Using Push Notifications

### For Users

1. **Access Notification Settings**

   - Go to the Profile tab in the EcoTrack app
   - Scroll down to the "Push Notifications" section

2. **Enable Notifications**

   - Toggle the "Enable Daily Reminders" switch
   - The browser will request notification permission
   - Grant permission when prompted

3. **Set Notification Time**

   - Choose your preferred daily reminder time
   - Click "Save Settings" to update

4. **Test Notifications**
   - Click "Send Test Notification" to verify setup
   - You should receive a test notification immediately

### For Administrators

#### Manual Notification Testing

```bash
# Test with dry-run (no actual notifications sent)
python manage.py send_daily_notifications --dry-run

# Send notifications for current time
python manage.py send_daily_notifications
```

#### Setting Up Automatic Daily Notifications

**Option 1: Using the Python Scheduler**

```bash
# Run the continuous scheduler (for development/testing)
python notification_scheduler.py
```

**Option 2: Using Windows Task Scheduler**

1. Open Windows Task Scheduler
2. Create a new task
3. Set it to run every minute
4. Set the action to run: `send_notifications.bat`

**Option 3: Using Cron (Linux/Mac)**
Add this to your crontab:

```bash
# Run every minute to check for notifications
* * * * * /path/to/your/venv/bin/python /path/to/your/project/manage.py send_daily_notifications
```

## API Endpoints

The following API endpoints are available:

- `GET /api/notifications/settings` - Get user's notification settings
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `POST /api/notifications/unsubscribe` - Unsubscribe from notifications
- `POST /api/notifications/update-time` - Update notification time
- `POST /api/notifications/test` - Send a test notification

## Files Added/Modified

### New Files Created:

- `ecotrack/models.py` - Added PushSubscription model
- `ecotrack/static/sw.js` - Service worker for push notifications
- `ecotrack/static/notifications.js` - Frontend notification management
- `ecotrack/management/commands/send_daily_notifications.py` - Management command
- `notification_scheduler.py` - Continuous scheduler script
- `send_notifications.bat` - Windows batch script

### Modified Files:

- `ecotrack/views.py` - Added notification views
- `ecotrack/urls.py` - Added notification endpoints
- `ecotrack/templates/index.html` - Added notification settings UI
- `ecotrack/static/styles.css` - Added notification styling
- `DjangoProject/settings.py` - Added VAPID keys
- `requirements.txt` - Added required packages

## Browser Compatibility

Push notifications are supported in:

- Chrome 42+
- Firefox 44+
- Safari 16+
- Edge 79+

## Security Notes

- VAPID keys are used for secure message authentication
- All API endpoints require user authentication
- Notifications only work over HTTPS in production
- Service worker handles notifications securely in the background

## Troubleshooting

### Common Issues:

1. **Notifications not appearing**

   - Check browser notification permissions
   - Verify VAPID keys are correctly configured
   - Ensure service worker is registered

2. **Service worker errors**

   - Check browser console for errors
   - Verify `/static/sw.js` is accessible
   - Clear browser cache and re-register

3. **Scheduling not working**
   - Verify the management command runs without errors
   - Check timezone settings in `settings.py`
   - Ensure the scheduler is running continuously

## Development vs Production

### Development

- Use `python notification_scheduler.py` for testing
- Notifications work on localhost with HTTP
- Debug using browser developer tools

### Production

- Use a proper task scheduler (cron/Task Scheduler)
- Requires HTTPS for notifications to work
- Consider using a message queue for high volume

## Next Steps

The push notification system is fully functional and ready to use. Users can now:

1. Subscribe to daily reminders
2. Customize notification times
3. Receive automated daily check-ins
4. Test notifications on demand

The system will automatically clean up invalid subscriptions and provide feedback to users about their notification status.
