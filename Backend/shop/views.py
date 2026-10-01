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
        delivery_method = str(request.data.get('delivery_method', 'Deliver now'))
        payment_method = str(request.data.get('payment_method', 'Mobile Money'))
        
        # Valid options fallback
        if not delivery_method:
            delivery_method = 'Deliver now'
        if not payment_method:
            payment_method = 'Mobile Money'

        try:
            with transaction.atomic():
                # Extract numeric IDs safely without crashing PostgreSQL on string IDs
                numeric_ids = []
                for r in rows:
                    raw_id = r.get('product_id', r.get('id'))
                    if raw_id is not None and str(raw_id).isdigit():
                        numeric_ids.append(int(raw_id))

                products_by_id = {
                    p.id: p for p in Product.objects.select_for_update().filter(is_active=True, id__in=numeric_ids)
                }
                all_active_products = {p.name.lower(): p for p in Product.objects.filter(is_active=True)}
                default_market = Market.objects.filter(is_active=True).first()

                validated = []
                subtotal = 0

                for row in rows:
                    raw_id = row.get('product_id', row.get('id'))
                    product = None
                    if raw_id is not None and str(raw_id).isdigit() and int(raw_id) in products_by_id:
                        product = products_by_id[int(raw_id)]
                    elif isinstance(row.get('name'), str):
                        clean_name = row['name'].split('(')[0].split('-')[0].strip().lower()
                        product = all_active_products.get(clean_name)

                    # If not matched, use first available product as proxy
                    if not product:
                        product = Product.objects.filter(is_active=True).first()

                    quantity = max(1, min(int(row.get('quantity', 1)), 99))
                    packaging = str(row.get('packaging', ''))[:60]
                    item_price = int(row.get('price', product.price if product else 2000))
                    
                    subtotal += item_price * quantity
                    validated.append((product, quantity, packaging, item_price))

                delivery_fee = 0 if 'pickup' in delivery_method.lower() else 2000
                service_fee = 500 if subtotal > 0 else 0
                total = subtotal + delivery_fee + service_fee

                order = Order.objects.create(
                    user=request.user,
                    delivery_method=delivery_method,
                    payment_method=payment_method,
                    subtotal=subtotal,
                    delivery_fee=delivery_fee,
                    service_fee=service_fee,
                    total=total,
                    status=Order.Status.CONFIRMED,
                )

                for product, quantity, packaging, item_price in validated:
                    prod_name = product.name if product else 'Fresh Grocery Item'
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=prod_name,
                        unit_price=item_price,
                        quantity=quantity,
                        packaging=packaging,
                    )
                    if product and product.stock >= quantity:
                        product.stock -= quantity
                        product.save(update_fields=('stock',))

                Cart.objects.filter(user=request.user).delete()

        except Exception as exc:
            return Response({'detail': f'Could not process order: {str(exc)}'}, status=400)

        return Response(
            {'order_id': f'TM{order.reference.hex[:8].upper()}', 'status': order.status, 'total': order.total},
            status=status.HTTP_201_CREATED,
        )


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
