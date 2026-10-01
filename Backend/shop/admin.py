from django.contrib import admin

from .models import Cart, CartItem, Market, Order, OrderItem, Product


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'unit_price', 'quantity', 'packaging')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('reference', 'user', 'status', 'total', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'reference')
    inlines = (OrderItemInline,)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'market', 'category', 'price', 'stock', 'is_active')
    list_filter = ('category', 'market', 'is_active')
    search_fields = ('name', 'local_name')


admin.site.register(Market)
admin.site.register(Cart)
admin.site.register(CartItem)
