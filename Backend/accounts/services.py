from datetime import timedelta

from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import User, UserRole
from .utils import DEFAULT_OTP_TTL_SECONDS, clear_otp, generate_otp_code, get_stored_otp, send_otp_email, store_otp
from .validators import validate_password_strength


class AccountService:
    @staticmethod
    def ensure_group(role):
        group_name = role.lower()
        if role == UserRole.ADMIN:
            group_name = 'admin'
        elif role == UserRole.VENDOR:
            group_name = 'vendor'
        else:
            group_name = 'customer'
        group, _ = Group.objects.get_or_create(name=group_name)
        return group

    @classmethod
    def create_user_account(cls, *, email, phone_number, password, first_name='', last_name='', role=UserRole.CUSTOMER):
        from .validators import validate_phone_number

        validate_phone_number(phone_number)
        validate_password_strength(password)

        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError('A user with this email already exists.')
        if User.objects.filter(phone_number=phone_number).exists():
            raise ValidationError('A user with this phone number already exists.')

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=password,
                phone_number=phone_number,
                first_name=first_name,
                last_name=last_name,
                role=role,
                is_active=True,
                is_verified=False,
            )
            group = cls.ensure_group(role)
            user.groups.add(group)
            otp = generate_otp_code()
            store_otp(email, otp, ttl_seconds=DEFAULT_OTP_TTL_SECONDS)
            user.otp_code = otp
            user.otp_created_at = timezone.now()
            user.otp_attempt_count = 0
            user.save(update_fields=['otp_code', 'otp_created_at', 'otp_attempt_count'])
            send_otp_email(email, otp)
            return user, otp

    @staticmethod
    def verify_user_otp(email, otp_code):
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise ValidationError('No user found with this email.')

        if user.otp_created_at and timezone.now() - user.otp_created_at > timedelta(seconds=DEFAULT_OTP_TTL_SECONDS):
            clear_otp(email)
            user.otp_code = None
            user.otp_created_at = None
            user.otp_attempt_count = 0
            user.save(update_fields=['otp_code', 'otp_created_at', 'otp_attempt_count'])
            raise ValidationError('OTP has expired or does not exist.')

        stored_otp = get_stored_otp(email)
        if not stored_otp:
            raise ValidationError('OTP has expired or does not exist.')
        if str(stored_otp) != str(otp_code):
            user.otp_attempt_count += 1
            user.save(update_fields=['otp_attempt_count'])
            if user.otp_attempt_count >= 3:
                clear_otp(email)
                raise ValidationError('Too many failed OTP attempts. Request a new OTP.')
            raise ValidationError('Invalid OTP.')

        user.is_verified = True
        user.otp_code = None
        user.otp_created_at = None
        user.otp_attempt_count = 0
        user.save(update_fields=['is_verified', 'otp_code', 'otp_created_at', 'otp_attempt_count'])
        clear_otp(email)
        return True

    @staticmethod
    def resend_otp(email):
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise ValidationError('No user found with this email.')
        otp = generate_otp_code()
        store_otp(email, otp, ttl_seconds=DEFAULT_OTP_TTL_SECONDS)
        user.otp_code = otp
        user.otp_created_at = timezone.now()
        user.otp_attempt_count = 0
        user.save(update_fields=['otp_code', 'otp_created_at', 'otp_attempt_count'])
        send_otp_email(email, otp)
        return otp

    @staticmethod
    def change_password(user, old_password, new_password):
        if not user.check_password(old_password):
            raise ValidationError('Current password is incorrect.')
        validate_password_strength(new_password)
        user.set_password(new_password)
        user.save(update_fields=['password'])

    @staticmethod
    def reset_password(email, new_password):
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise ValidationError('No user found with this email.')
        validate_password_strength(new_password)
        user.set_password(new_password)
        user.save(update_fields=['password'])

    @staticmethod
    def activate_user(user):
        user.is_active = True
        user.save(update_fields=['is_active'])

    @staticmethod
    def deactivate_user(user):
        user.is_active = False
        user.save(update_fields=['is_active'])

    @staticmethod
    def soft_delete_user(user):
        user.is_deleted = True
        user.deleted_at = timezone.now()
        user.is_active = False
        user.save(update_fields=['is_deleted', 'deleted_at', 'is_active'])
