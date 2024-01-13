from django.db import models
from django.utils.translation import gettext_lazy as _

class Item(models.Model):

    class Currency(models.TextChoices):
        USD = 'usd', _("$ United States dollar")
        EUR = 'eur', _("€ Euro")

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500, default='')
    price = models.IntegerField(default=0)
    currency = models.CharField(max_length=4, choices=Currency.choices, default=Currency.USD)

    def __str__(self):
        return self.name

    def get_display_price(self):
        return "{0:.2f}".format(self.price / 100)

    def idk(self):
        return 'idk_text'

class Order(models.Model):
    items = models.ManyToManyField(Item)
    # discount = models.ForeignKey(Discount, on_delete=models.CASCADE)
    # tax = models.ForeignKey(Tax, on_delete=models.CASCADE)

    def total_price(self):
        items = self.items.all()
        sum = 0
        for item in items:
            sum += item.price

        return sum

    def __str__(self):
        return str(self.id)

# class Discount(models.Model):
    # pass

# class Tax(models.Model):
    # pass
