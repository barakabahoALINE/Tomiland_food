import random
import string

from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings

DEFAULT_OTP_TTL_SECONDS = 300


def generate_otp_code(length=6):
    return ''.join(random.choices(string.digits, k=length))


def get_otp_cache_key(email):
    return f'otp:{email.lower()}'


def store_otp(email, otp, ttl_seconds=DEFAULT_OTP_TTL_SECONDS):
    cache.set(get_otp_cache_key(email), otp, ttl_seconds)


def get_stored_otp(email):
    return cache.get(get_otp_cache_key(email))


def clear_otp(email):
    cache.delete(get_otp_cache_key(email))


def send_otp_email(email, otp):
    subject = 'Tomiland Foods - Your OTP Verification Code'
    message = f'Your verification code is {otp}. It will expire in 5 minutes.'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)


def get_default_group_name(role):
    return f'{role.lower()}s'


def build_success_response(message, data=None, status=200):
    payload = {'success': True, 'message': message}
    if data is not None:
        payload['data'] = data
    return payload, status


def build_error_response(message, status=400, errors=None):
    payload = {'success': False, 'message': message}
    if errors is not None:
        payload['errors'] = errors
    return payload, status
