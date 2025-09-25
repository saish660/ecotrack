"""Unified OneSignal service (single class) for sending push notifications via OneSignal REST API.

Supports both single and bulk sends using player IDs. Uses settings:
  ONESIGNAL_APP_ID
  ONESIGNAL_REST_API_KEY
"""

from typing import Dict, Optional, List
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
    def _headers(cls) -> Dict[str, str]:
        return {
            'Authorization': f"Basic {getattr(settings, 'ONESIGNAL_REST_API_KEY', '')}",
            'Content-Type': 'application/json'
        }

    @classmethod
    def _app_id(cls) -> str:
        return getattr(settings, 'ONESIGNAL_APP_ID', '')

    @classmethod
    def send_notification(cls, player_id: str, title: str, body: str, data: Optional[Dict] = None) -> bool:
        if not player_id:
            logger.error('OneSignal send_notification: missing player_id')
            return False
        return cls.send_bulk([player_id], title, body, data).get('success_count', 0) == 1

    @classmethod
    def send_bulk(cls, player_ids: List[str], title: str, body: str, data: Optional[Dict] = None) -> Dict:
        if not cls.is_configured():
            logger.error("OneSignal not configured: missing credentials")
            return {'success_count': 0, 'failure_count': len(player_ids), 'failed_ids': player_ids}
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
            resp = requests.post(cls.BASE_URL, json=payload, headers=cls._headers(), timeout=15)
            if 200 <= resp.status_code < 300:
                logger.info('OneSignal bulk sent (%d recipients)', len(ids))
                return {'success_count': len(ids), 'failure_count': 0, 'failed_ids': []}
            logger.error('OneSignal bulk error %s: %s', resp.status_code, resp.text[:400])
            return {'success_count': 0, 'failure_count': len(ids), 'failed_ids': ids}
        except Exception as e:
            logger.exception('OneSignal bulk send exception: %s', e)
            return {'success_count': 0, 'failure_count': len(ids), 'failed_ids': ids}

