import uuid

from django.conf import settings
from django.db import models


class Market(models.Model):
    name = models.CharField(max_length=120, unique=True)
    area = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, default='Kigali')
    image = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=160)
    local_name = models.CharField(max_length=160, blank=True)
    category = models.SlugField(max_length=80, db_index=True)
    subcategory = models.CharField(max_length=100, blank=True)
    market = models.ForeignKey(Market, on_delete=models.PROTECT, related_name='products')
    price = models.PositiveIntegerField(help_text='Price in RWF')
    price_unit = models.CharField(max_length=40, default='RWF')
    image = models.URLField(blank=True)
    description = models.TextField(blank=True)
    packaging = models.JSONField(default=list, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shop_cart')
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    packaging = models.CharField(max_length=60, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('cart', 'product', 'packaging'), name='unique_cart_product_packaging')]


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PREPARING = 'PREPARING', 'Preparing'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='shop_orders')
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    delivery_method = models.CharField(max_length=80)
    payment_method = models.CharField(max_length=80)
    subtotal = models.PositiveIntegerField()
    delivery_fee = models.PositiveIntegerField(default=0)
    service_fee = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    packaging = models.CharField(max_length=60, blank=True)
