from rest_framework import serializers

from .models import Market, Product


class MarketSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    rating = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = Market
        fields = ('id', 'name', 'area', 'city', 'location', 'image', 'rating')

    def get_rating(self, obj):
        return 4.7

    def get_location(self, obj):
        return ', '.join(part for part in (obj.area, obj.city) if part)


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    market = serializers.CharField(source='market.name', read_only=True)
    vendor = serializers.CharField(source='market.name', read_only=True)
    kinyarwandaName = serializers.CharField(source='local_name', read_only=True)
    priceUnit = serializers.CharField(source='price_unit', read_only=True)
    availability = serializers.SerializerMethodField()
    freshness = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    badge = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'kinyarwandaName', 'category', 'subcategory', 'market', 'vendor', 'price', 'priceUnit', 'image', 'description', 'packaging', 'stock', 'availability', 'freshness', 'rating', 'badge')

    def get_availability(self, obj):
        return 'out_of_stock' if obj.stock == 0 else ('limited' if obj.stock < 5 else 'available')

    def get_freshness(self, obj):
        return 'Fresh'

    def get_rating(self, obj):
        return 4.7

    def get_badge(self, obj):
        return 'FRESH' if obj.stock else 'OUT OF STOCK'
