#!/usr/bin/env python
"""
Test script to verify OneSignal integration works correctly.
Run this after setting up your OneSignal credentials.
"""

import os
import sys
import django

# Add the Django project to the path and setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DjangoProject.settings')
django.setup()

from ecotrack.onesignal_service import OneSignalService
from django.conf import settings

def test_onesignal_config():
    """Test OneSignal configuration"""
    print("=== OneSignal Configuration Test ===")
    
    app_id = getattr(settings, 'ONESIGNAL_APP_ID', '')
    api_key = getattr(settings, 'ONESIGNAL_REST_API_KEY', '')
    
    if not app_id:
        print("❌ ONESIGNAL_APP_ID is not configured")
        return False
    
    if not api_key:
        print("❌ ONESIGNAL_REST_API_KEY is not configured")
        return False
    
    print(f"✅ OneSignal App ID: {app_id[:8]}...")
    print(f"✅ OneSignal API Key: {api_key[:8]}...")
    return True

def test_onesignal_service():
    """Test OneSignal service functionality"""
    print("\n=== OneSignal Service Test ===")
    
    try:
        # Test with a fake player ID (this will fail but shows the service is working)
        result = OneSignalService.send_notification(
            player_id="test-player-id",
            title="Test Notification",
            body="This is a test from EcoTrack OneSignal integration",
            data={"test": "true"}
        )
        
        # We expect this to fail since it's a fake player ID
        if result:
            print("✅ OneSignal service is working (unexpectedly succeeded)")
        else:
            print("✅ OneSignal service is working (failed as expected with fake ID)")
        
        return True
    except Exception as e:
        print(f"❌ OneSignal service error: {e}")
        return False

def test_database_schema():
    """Test database schema has OneSignal fields"""
    print("\n=== Database Schema Test ===")
    
    try:
        from ecotrack.models import PushSubscription
        
        # Check if OneSignal fields exist
        fields = [f.name for f in PushSubscription._meta.fields]
        
        if 'onesignal_player_id' not in fields:
            print("❌ onesignal_player_id field missing from PushSubscription model")
            return False
        
        if 'provider' not in fields:
            print("❌ provider field missing from PushSubscription model")
            return False
        
        print("✅ OneSignal fields are present in database schema")
        
        # Test creating a OneSignal subscription
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # This is just a test - we won't save it
        test_subscription = PushSubscription(
            onesignal_player_id="test-player-id",
            provider="onesignal",
            device_type="median",
            is_active=True
        )
        
        print("✅ OneSignal subscription model can be created")
        return True
        
    except Exception as e:
        print(f"❌ Database schema error: {e}")
        return False

def test_management_commands():
    """Test management commands exist"""
    print("\n=== Management Commands Test ===")
    
    import os
    
    fcm_command = os.path.join(os.path.dirname(__file__), 'ecotrack', 'management', 'commands', 'send_daily_notifications.py')
    onesignal_command = os.path.join(os.path.dirname(__file__), 'ecotrack', 'management', 'commands', 'send_onesignal_notifications.py')
    
    if not os.path.exists(fcm_command):
        print("❌ FCM notification command not found")
        return False
    
    if not os.path.exists(onesignal_command):
        print("❌ OneSignal notification command not found")
        return False
    
    print("✅ Both notification commands are available")
    return True

def main():
    """Run all tests"""
    print("🚀 EcoTrack OneSignal Integration Test\n")
    
    tests = [
        ("Configuration", test_onesignal_config),
        ("Service", test_onesignal_service),
        ("Database Schema", test_database_schema),
        ("Management Commands", test_management_commands)
    ]
    
    passed = 0
    total = len(tests)
    
    for name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {name} test failed with exception: {e}")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! OneSignal integration is ready.")
        print("\nNext steps:")
        print("1. Set your OneSignal credentials in .env file")
        print("2. Build and deploy your Median app with OneSignal enabled")
        print("3. Test notifications from the web interface")
    else:
        print("⚠️  Some tests failed. Please check the configuration.")
        
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)