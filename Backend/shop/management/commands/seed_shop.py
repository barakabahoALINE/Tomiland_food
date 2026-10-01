from django.core.management.base import BaseCommand

from shop.models import Market, Product


class Command(BaseCommand):
    help = 'Add a small starter set of Tomiland markets and products.'

    def handle(self, *args, **options):
        markets = {}
        for name, area in [('Kimironko Market', 'Kimironko'), ('Nyabugogo Market', 'Nyabugogo'),
                           ('Simba Supermarket', 'Remera'), ('Quality Supermarket', 'Kacyiru')]:
            markets[name], _ = Market.objects.get_or_create(name=name, defaults={'area': area})

        products = [
            ('Tomatoes', 'Inyanya', 'fresh-produce', 'Vegetables', 'Kimironko Market', 1200, ['1 kg', '2 kg', '5 kg'], 30),
            ('Avocados', 'Avoka', 'fresh-produce', 'Fruits', 'Nyabugogo Market', 1500, ['500 g', '1 kg'], 24),
            ('Onions', 'Igitunguru', 'fresh-produce', 'Vegetables', 'Simba Supermarket', 1200, ['1 kg', '2 kg'], 18),
            ('Potatoes', 'Ibirayi', 'fresh-produce', 'Root vegetables', 'Kimironko Market', 3000, ['2 kg', '5 kg'], 20),
            ('Rice', 'Umuceri', 'dry-goods', 'Grains', 'Quality Supermarket', 9000, ['5 kg'], 16),
            ('Beans', 'Ibishyimbo', 'dry-goods', 'Legumes', 'Nyabugogo Market', 2400, ['2 kg'], 22),
            ('Cooking Oil', 'Amavuta', 'cooking-essentials', 'Oils', 'Simba Supermarket', 2600, ['1 L'], 14),
            ('Leafy Greens', 'Imiboga', 'fresh-produce', 'Greens', 'Kimironko Market', 900, ['1 bunch'], 25),
            ('Chicken Breast', 'Nyama y’inkoko', 'meat-fish', 'Poultry', 'Quality Supermarket', 4800, ['500 g', '1 kg'], 8),
            ('Fresh Milk', 'Amata', 'dairy-eggs', 'Milk', 'Quality Supermarket', 1200, ['1 L'], 12),
            ('Eggs', 'Amagi', 'dairy-eggs', 'Eggs', 'Kimironko Market', 2500, ['6 pieces', '12 pieces'], 20),
            ('Spinach', 'Isombe', 'fresh-produce', 'Vegetables', 'Nyabugogo Market', 900, ['500 g', '1 kg'], 4),
        ]
        for name, local_name, category, subcategory, market, price, packaging, stock in products:
            Product.objects.update_or_create(name=name, market=markets[market], defaults={
                'local_name': local_name, 'category': category, 'subcategory': subcategory,
                'price': price, 'packaging': packaging, 'stock': stock, 'is_active': True,
            })
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(markets)} markets and {len(products)} products.'))
