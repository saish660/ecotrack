# EcoTrack OneSignal Integration for Median Apps

This document explains how to integrate OneSignal push notifications with your Median-converted Android/iOS app.

## Overview

EcoTrack now supports two notification systems:

- **Firebase Cloud Messaging (FCM)** - for web users
- **OneSignal** - for Median-converted mobile apps

The system automatically detects the platform and uses the appropriate notification service.

## Setup Instructions

### 1. OneSignal Account Setup

1. Create a free account at [OneSignal.com](https://onesignal.com)
2. Create a new app for your EcoTrack project
3. Note down your **App ID** and **REST API Key**

### 2. Configure OneSignal for Android

1. In OneSignal dashboard, go to **Settings** -> **Platforms** -> **Google Android (FCM)**
2. Upload your Firebase `google-services.json` file (the same one you use for Firebase)
3. OneSignal will automatically extract the necessary FCM credentials

### 3. Configure OneSignal for iOS (if needed)

1. In OneSignal dashboard, go to **Settings** -> **Platforms** -> **Apple iOS**
2. Upload your Apple Push Notification certificate or use Auth Key method
3. Follow OneSignal's iOS setup guide

### 4. Configure Your Median App

1. In your Median app configuration, add OneSignal integration:
   - Go to **Native Plugins** -> **OneSignal**
   - Enable OneSignal
   - Enter your OneSignal App ID

### 5. Environment Variables

Add these to your `.env` file:

```bash
# OneSignal Configuration
ONESIGNAL_APP_ID=your_onesignal_app_id_here
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key_here
```

### 6. Database Migration

Run the database migration to add OneSignal fields:

```bash
python manage.py migrate
```

## How It Works

### Platform Detection

The app automatically detects whether it's running in:

- **Web browser** - Uses Firebase FCM
- **Median app** - Uses OneSignal

### User Registration

When users enable notifications:

1. **Web users**: App gets FCM token and stores it in the database
2. **Median app users**: App gets OneSignal player ID and stores it in the database

### Notification Sending

The notification scheduler (`notification_scheduler.py`) runs both commands:

1. `send_daily_notifications` - Sends to FCM subscribers
2. `send_onesignal_notifications` - Sends to OneSignal subscribers

### Testing Notifications

Users can test notifications from the web interface:

- The system automatically uses the appropriate service (FCM or OneSignal)
- Test notifications help verify the setup is working

## Files Added/Modified

### New Files:

- `ecotrack/static/notifications_median.js` - Median OneSignal integration
- `ecotrack/static/notifications_loader.js` - Smart platform detection
- `ecotrack/management/commands/send_onesignal_notifications.py` - OneSignal notification scheduler
- `.env.template` - Environment variable template

### Modified Files:

- `models.py` - Added OneSignal player ID and provider fields to PushSubscription
- `views.py` - Updated subscription and test notification views
- `onesignal_service.py` - Updated OneSignal service
- `settings.py` - Added OneSignal configuration
- `notification_scheduler.py` - Updated to support both systems
- `templates/index.html` - Updated to use smart notification loader

## API Endpoints

The following endpoints now support both FCM and OneSignal:

- `POST /api/notifications/subscribe` - Subscribe to notifications

  - For FCM: Send `fcmToken`, `deviceType`, `notificationTime`
  - For OneSignal: Send `oneSignalPlayerId`, `deviceType`, `notificationTime`, `provider: "onesignal"`

- `POST /api/notifications/test` - Send test notification (automatically detects provider)
- `GET /api/notifications/settings` - Get notification settings (returns provider info)

## Troubleshooting

### OneSignal Player ID Not Found

If OneSignal player ID is not being captured:

1. Ensure OneSignal is properly configured in your Median app
2. Check that push notification permissions are granted on the device
3. Verify the Median JavaScript Bridge is working

### Notifications Not Being Sent

1. Check OneSignal dashboard for delivery reports
2. Verify environment variables are set correctly
3. Check Django logs for error messages
4. Ensure the notification scheduler is running

### Testing in Development

1. Use OneSignal's test notifications feature in their dashboard
2. Use the app's built-in test notification button
3. Check both web and Median app versions

## Production Deployment

1. Set up proper environment variables in production
2. Configure a proper task scheduler (cron, etc.) to run `notification_scheduler.py`
3. Monitor notification delivery rates in OneSignal dashboard
4. Set up proper logging and error handling

## Support

For OneSignal-specific issues, refer to:

- [OneSignal Documentation](https://documentation.onesignal.com/)
- [Median OneSignal Integration](https://median.co/docs/onesignal)

For EcoTrack integration issues, check the Django logs and ensure all environment variables are properly configured.
