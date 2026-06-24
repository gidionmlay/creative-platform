from django.db import migrations


CARDS = [
    {'title': 'Branding', 'description': 'Strategic brand identity and visual systems', 'link_anchor': '#branding', 'sort_order': 0},
    {'title': 'Graphic Design', 'description': 'Digital and print design solutions', 'link_anchor': '#design', 'sort_order': 1},
    {'title': 'Video Production', 'description': 'Content creation and media production', 'link_anchor': '#video', 'sort_order': 2},
    {'title': 'Digital Marketing', 'description': 'Digital marketing and campaign strategy', 'link_anchor': '#marketing', 'sort_order': 3},
    {'title': 'Printing Services', 'description': 'High-quality printing and merchandise', 'link_anchor': '#printing', 'sort_order': 4},
    {'title': 'Training & Digital Skills', 'description': 'Professional development programs', 'link_anchor': '#training', 'sort_order': 5},
]


def seed_cards(apps, schema_editor):
    ServiceBentoCard = apps.get_model('cms', 'ServiceBentoCard')
    for card in CARDS:
        ServiceBentoCard.objects.get_or_create(
            title=card['title'],
            defaults=card
        )


def reverse(apps, schema_editor):
    ServiceBentoCard = apps.get_model('cms', 'ServiceBentoCard')
    ServiceBentoCard.objects.filter(
        title__in=[c['title'] for c in CARDS]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0003_servicebentocard'),
    ]

    operations = [
        migrations.RunPython(seed_cards, reverse),
    ]
