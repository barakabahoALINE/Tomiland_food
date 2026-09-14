from django.contrib.auth.models import Group
from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .models import UserRole


@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    if sender.name != 'accounts':
        return
    for role_name in [UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN]:
        Group.objects.get_or_create(name=role_name.lower())
