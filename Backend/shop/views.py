from datetime import timedelta

from django.db import transaction
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Market, Order, OrderItem, Product
from .serializers import MarketSerializer, ProductSerializer


class ProductListView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        products = Product.objects.filter(is_active=True, market__is_active=True).select_related('market')
        if request.query_params.get('category'):
            products = products.filter(category=request.query_params['category'])
        if request.query_params.get('market'):
            products = products.filter(market__name__icontains=request.query_params['market'])
        return Response(ProductSerializer(products, many=True).data)


class MarketListView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response(MarketSerializer(Market.objects.filter(is_active=True).annotate(product_count=Count('products')), many=True).data)


def cart_payload(cart):
    rows = []
    for item in cart.items.select_related('product', 'product__market'):
        product = item.product
        rows.append({'id': str(product.id), 'name': product.name, 'price': product.price, 'quantity': item.quantity,
                     'packaging': item.packaging, 'imageUrl': product.image, 'market': product.market.name})
    return {'items': rows, 'subtotal': sum(row['price'] * row['quantity'] for row in rows)}


class CartView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(cart_payload(cart))

    def put(self, request):
        rows = request.data.get('items')
        if not isinstance(rows, list):
            return Response({'detail': 'items must be a list'}, status=400)
        validated = []
        for row in rows:
            try:
                product = Product.objects.get(pk=row.get('product_id', row.get('id')), is_active=True)
                quantity = int(row.get('quantity', 1))
                if quantity < 1 or quantity > 99:
                    raise ValueError
                validated.append((product, quantity, str(row.get('packaging', ''))[:60]))
            except (Product.DoesNotExist, TypeError, ValueError, AttributeError):
                return Response({'detail': 'Cart contains an invalid product or quantity.'}, status=400)
        cart, _ = Cart.objects.get_or_create(user=request.user)
        with transaction.atomic():
            cart.items.all().delete()
            for product, quantity, packaging in validated:
                CartItem.objects.create(cart=cart, product=product, quantity=quantity, packaging=packaging)
        return Response(cart_payload(cart))


class OrderCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        rows = request.data.get('items', [])
        if not isinstance(rows, list) or not rows:
            return Response({'detail': 'Your basket is empty.'}, status=400)
        delivery_method = str(request.data.get('delivery_method', ''))
        payment_method = str(request.data.get('payment_method', ''))
        if delivery_method not in {'Deliver now', 'Schedule delivery', 'Pickup now', 'Pickup later'}:
            return Response({'detail': 'Choose a valid delivery or pickup option.'}, status=400)
        if payment_method not in {'Mobile Money', 'Card Payment', 'Cash on Delivery'}:
            return Response({'detail': 'Choose a valid payment method.'}, status=400)
        try:
            with transaction.atomic():
                products = {str(p.id): p for p in Product.objects.select_for_update().filter(is_active=True, id__in=[r.get('id') for r in rows])}
                validated = []
                subtotal = 0
                for row in rows:
                    product = products.get(str(row.get('product_id', row.get('id'))))
                    quantity = int(row.get('quantity', 0))
                    packaging = str(row.get('packaging', ''))[:60]
                    if not product or quantity < 1 or quantity > 99 or product.stock < quantity:
                        return Response({'detail': 'A product is unavailable or has insufficient stock.'}, status=400)
                    subtotal += product.price * quantity
                    validated.append((product, quantity, packaging))
                delivery_fee = 0 if delivery_method.startswith('Pickup') else 2000
                service_fee = 500
                order = Order.objects.create(user=request.user,
                    delivery_method=delivery_method,
                    payment_method=payment_method,
                    subtotal=subtotal, delivery_fee=delivery_fee, service_fee=service_fee,
                    total=subtotal + delivery_fee + service_fee)
                for product, quantity, packaging in validated:
                    OrderItem.objects.create(order=order, product=product, product_name=product.name,
                                             unit_price=product.price, quantity=quantity, packaging=packaging)
                    product.stock -= quantity
                    product.save(update_fields=('stock',))
                Cart.objects.filter(user=request.user).delete()
        except (TypeError, ValueError):
            return Response({'detail': 'Order details are invalid.'}, status=400)
        return Response({'order_id': f'TM{order.reference.hex[:8].upper()}', 'status': order.status, 'total': order.total}, status=status.HTTP_201_CREATED)


class AdminSummaryView(APIView):
    permission_classes = (IsAdminUser,)

    def get(self, request):
        orders = Order.objects.all()
        pending = orders.filter(status=Order.Status.PENDING).count()
        revenue = orders.exclude(status=Order.Status.CANCELLED).aggregate(total=Sum('total'))['total'] or 0
        products = Product.objects.filter(is_active=True)
        today = timezone.localdate()
        return Response({'totalOrders': orders.count(), 'revenue': revenue, 'pendingOrders': pending,
                         'lowStockProducts': products.filter(stock__lt=5).count(),
                         'markets': Market.objects.filter(is_active=True).count(),
                         'statusCounts': [{'label': label, 'count': orders.filter(status=value).count()}
                                          for value, label in Order.Status.choices],
                         'topProducts': [{'name': row['product_name'], 'sold': row['sold']}
                                         for row in OrderItem.objects.values('product_name').annotate(sold=Sum('quantity')).order_by('-sold')[:5]],
                         'dailySales': [{'label': (today - timedelta(days=offset)).strftime('%b %d'),
                                         'value': orders.filter(created_at__date=today - timedelta(days=offset)).exclude(status=Order.Status.CANCELLED).aggregate(total=Sum('total'))['total'] or 0}
                                        for offset in reversed(range(7))],
                         'recentOrders': [{'orderId': f'TM{o.reference.hex[:8].upper()}', 'customer': o.user.get_full_name() or o.user.email,
                                           'items': o.items.count(), 'status': o.get_status_display(), 'total': o.total,
                                           'time': o.created_at.isoformat()} for o in orders.select_related('user')[:8]],
                         'lowStock': [{'name': p.name, 'stock': p.stock} for p in products.filter(stock__lt=5).select_related('market')[:8]]})
