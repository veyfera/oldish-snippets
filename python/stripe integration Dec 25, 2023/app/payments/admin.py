from django.contrib import admin
from .models import Item, Order#, Price

# class PriceInlineAdmin(admin.TabularInline):
    # model = Price
    # extra = 0

class ItemAdmin(admin.ModelAdmin):
    model = Item
    extra = 0
    # inlines = [PriceInlineAdmin]

admin.site.register(Item, ItemAdmin)

class OrderAdmin(admin.ModelAdmin):
    model = Order
    extra = 0

admin.site.register(Order, OrderAdmin)
