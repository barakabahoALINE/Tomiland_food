from django.urls import path

from .views import AdminSummaryView, CartView, MarketListView, OrderCreateView, ProductListView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='shop-products'),
    path('markets/', MarketListView.as_view(), name='shop-markets'),
    path('cart/', CartView.as_view(), name='shop-cart'),
    path('orders/', OrderCreateView.as_view(), name='shop-orders'),
    path('admin/summary/', AdminSummaryView.as_view(), name='shop-admin-summary'),
]
