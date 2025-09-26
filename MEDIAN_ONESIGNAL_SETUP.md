# Median OneSignal Integration - Complete Setup Guide

## What I Fixed in notifications_median.js

### 1. Enhanced Bridge Detection
- Added multiple fallback methods to access OneSignal data from Median bridge
- **Method 1**: `median.onesignal.onesignalInfo()` (recommended Median API)
- **Method 2**: Direct property access (`median.onesignal.onesignalUserId`)  
- **Method 3**: Legacy callback approach with `median.onesignal.info()`

### 2. Native Subscription State Tracking
- Added `isNativeSubscribed` property to track OneSignal subscription status
- Reads `oneSignalSubscribed` boolean from bridge response
- Shows appropriate status messages based on subscription state

### 3. Polling for Readiness
- Added `pollOneSignalInfoUntilReady()` method that retries for up to 30 seconds
- Handles case where OneSignal takes time to initialize after app launch
- Provides real-time status updates during polling

### 4. Enhanced Error Handling
- Better logging to identify which bridge method is being used
- Graceful fallbacks when primary methods fail
- Timeout protection for callback-based approaches

## Required Median App Configuration

### 1. OneSignal Plugin Setup in Median
```json
{
  "plugins": {
    "onesignal": {
      "enabled": true,
      "onesignal_app_id": "YOUR_ONESIGNAL_APP_ID",
      "onesignal_google_project_number": "YOUR_FCM_SENDER_ID"
    }
  }
}
```

### 2. Required Permissions (Android)
Add to your Median app's AndroidManifest.xml:
```xml
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### 3. Firebase Configuration
- Upload your `google-services.json` to OneSignal dashboard
- Ensure your app's package ID matches Firebase project configuration
- Verify FCM sender ID matches in both Firebase and OneSignal

## Required Server Configuration

### 1. Environment Variables (.env)
```bash
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
CRON_SECRET=your_secure_cron_secret
```

### 2. Python Dependencies (requirements.txt)
```
requests>=2.25.0
django>=5.0.0
```

### 3. OneSignal Service Setup
- Already configured in `onesignal_service.py`
- Uses OneSignal REST API for sending notifications
- Handles bulk sending for scheduled notifications

## Troubleshooting the TOO_MANY_REGISTRATIONS Error

This FCM error prevents OneSignal from getting a valid token. Solutions:

### On Device/Emulator:
1. **Uninstall and reinstall** the app completely
2. **Clear Google Play Services data**:
   - Settings > Apps > Google Play services > Storage > Clear data
   - Settings > Apps > Google Play Store > Storage > Clear data
   - Reboot device
3. **Use fresh emulator** with Google Play Store enabled

### In Development:
1. Ensure unique package ID for your app
2. Don't reuse the same test device for multiple Firebase projects
3. Consider using different OneSignal apps for dev/staging/prod

## Testing the Integration

### 1. Check Console Logs
Look for these messages in the Median app's WebView console:
```
Median NotificationManager initializing...
Using median.onesignal.onesignalInfo()
OneSignal Info: {oneSignalUserId: "...", oneSignalSubscribed: true}
OneSignal Player ID: uuid-string-here
```

### 2. Test Subscription Flow
1. Toggle "Enable Daily Reminders" 
2. Set a notification time
3. Click "Send Test Notification"
4. Check device for notification arrival

### 3. Verify Database Storage
Check that `onesignal_player_id` is saved:
```sql
SELECT user_id, onesignal_player_id, provider, is_active 
FROM ecotrack_pushsubscription 
WHERE onesignal_player_id IS NOT NULL;
```

### 4. Test Cron Notifications
Manual trigger (replace YOUR_SECRET):
```bash
curl "http://localhost:8000/api/cron/dispatch?token=YOUR_SECRET"
```

Should return JSON with `sent_success > 0` if player IDs are valid.

## Expected User Experience

### Successful Flow:
1. App loads → "Loading notification settings... (you can still interact)"
2. Bridge connects → "Native notifications are ready!"
3. User toggles on → Subscription saved to server
4. Test notification → Arrives on device
5. Scheduled notifications work via cron

### If OneSignal Not Ready:
1. App shows "Waiting for device push registration..."
2. Polls for up to 30 seconds
3. Shows specific error if no player ID obtained
4. User can still interact with controls (always visible)

## Key Improvements Made

1. **No Import Required**: Median bridge is injected by wrapper at runtime
2. **Multiple Bridge Methods**: Supports different Median build versions
3. **Always-Visible Controls**: User can interact even during loading
4. **Real-time Status**: Shows exactly what's happening during setup
5. **Polling Mechanism**: Waits for OneSignal to be ready instead of failing immediately
6. **Enhanced Logging**: Easy to debug what's working/failing

The integration should now work reliably on Median-wrapped Android apps with proper OneSignal configuration.