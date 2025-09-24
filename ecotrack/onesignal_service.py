"""OneSignal service helper for sending push notifications via OneSignal REST API."""
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class OneSignalService:
    BASE_URL = "https://api.onesignal.com/notifications"

    @classmethod
    def is_configured(cls) -> bool:
        return bool(getattr(settings, 'ONESIGNAL_APP_ID', None) and getattr(settings, 'ONESIGNAL_REST_API_KEY', None))

    @classmethod
    def send_notification(cls, player_ids, title: str, body: str, data: dict | None = None) -> bool:
        if not cls.is_configured():
            logger.error("OneSignal not configured: missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY")
            return False
        if not player_ids:
            return False
        payload = {
            "app_id": getattr(settings, 'ONESIGNAL_APP_ID'),
            "include_player_ids": player_ids,
            "headings": {"en": title},
            "contents": {"en": body},
            "data": data or {},
        }
        headers = {
            "Authorization": f"Basic {getattr(settings, 'ONESIGNAL_REST_API_KEY')}",
            "Content-Type": "application/json",
        }
        try:
            resp = requests.post(cls.BASE_URL, json=payload, headers=headers, timeout=10)
            if resp.status_code >= 200 and resp.status_code < 300:
                logger.info("OneSignal notification sent: %s", resp.text[:200])
                return True
            logger.error("OneSignal send failed (%s): %s", resp.status_code, resp.text[:300])
            return False
        except Exception as e:
            logger.exception("OneSignal send exception: %s", e)
            return False
"""
OneSignal push notification service.
Sends notifications to Android devices (Median-wrapped app) using OneSignal REST API.
"""

from typing import Dict, Optional, List
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class OneSignalService:
    @staticmethod
    def _headers() -> Dict[str, str]:
        api_key = getattr(settings, 'ONESIGNAL_API_KEY', '')
        return {
            'Authorization': f'Basic {api_key}',
            'Content-Type': 'application/json'
        }

    @staticmethod
    def _app_id() -> str:
        return getattr(settings, 'ONESIGNAL_APP_ID', '')

    @classmethod
    def send_notification(cls, player_id: str, title: str, body: str, data: Optional[Dict] = None) -> bool:
        if not player_id:
            logger.error('OneSignal send_notification: missing player_id')
            return False

        payload = {
            'app_id': cls._app_id(),
            'include_player_ids': [player_id],
            'headings': {'en': title or ''},
            'contents': {'en': body or ''},
            'data': data or {},
            'priority': 10,  # High priority
        }
        try:
            resp = requests.post('https://api.onesignal.com/notifications', json=payload, headers=cls._headers(), timeout=10)
            if resp.ok:
                logger.info('OneSignal notification sent successfully')
                return True
            logger.error(f'OneSignal error {resp.status_code}: {resp.text}')
            return False
        except Exception as e:
            logger.error(f'OneSignal send failed: {type(e).__name__} - {e}')
            return False

    @classmethod
    def send_bulk(cls, player_ids: List[str], title: str, body: str, data: Optional[Dict] = None) -> Dict:
        ids = [pid for pid in player_ids if pid]
        if not ids:
            return {'success_count': 0, 'failure_count': 0, 'failed_ids': []}

        payload = {
            'app_id': cls._app_id(),
            'include_player_ids': ids,
            'headings': {'en': title or ''},
            'contents': {'en': body or ''},
            'data': data or {},
            'priority': 10,
        }
        try:
            resp = requests.post('https://api.onesignal.com/notifications', json=payload, headers=cls._headers(), timeout=10)
            if resp.ok:
                # OneSignal doesn't give per-id success; assume all ok
                return {'success_count': len(ids), 'failure_count': 0, 'failed_ids': []}
            logger.error(f'OneSignal bulk error {resp.status_code}: {resp.text}')
            return {'success_count': 0, 'failure_count': len(ids), 'failed_ids': ids}
        except Exception as e:
            logger.error(f'OneSignal bulk send failed: {type(e).__name__} - {e}')
            return {'success_count': 0, 'failure_count': len(ids), 'failed_ids': ids}
