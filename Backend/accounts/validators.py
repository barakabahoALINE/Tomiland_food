import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_password_strength(password):
    errors = []

    if len(password) < 8:
        errors.append(_('Password must be at least 8 characters long.'))

    if not re.search(r'[A-Z]', password):
        errors.append(_('Password must contain at least one uppercase letter.'))

    if not re.search(r'[a-z]', password):
        errors.append(_('Password must contain at least one lowercase letter.'))

    if not re.search(r'\d', password):
        errors.append(_('Password must contain at least one digit.'))

    if not re.search(r'[^A-Za-z0-9]', password):
        errors.append(_('Password must contain at least one special character.'))

    if errors:
        raise ValidationError(_('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'))


def validate_phone_number(value):
    pattern = re.compile(r'^\+?[1-9]\d{7,14}$')
    if not pattern.match(value):
        raise ValidationError(_('Enter a valid phone number.'))


def validate_otp_code(value):
    if not re.fullmatch(r'\d{6}', str(value)):
        raise ValidationError(_('OTP must be a 6-digit number.'))
