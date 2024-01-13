from django.shortcuts import render
from django.conf import settings
from django.http.response import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import TemplateView

from .models import Item, Order
from .utils import format_item, createStripeSession

import stripe

class HomePageView(TemplateView):
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        items = Item.objects.all().values()
        context = super(HomePageView, self).get_context_data(**kwargs)
        context.update({
            'items': items
            })

        return context

class SuccessView(TemplateView):
    template_name = 'success.html'

class CancelledView(TemplateView):
    template_name = 'cancelled.html'

@method_decorator(csrf_exempt, name='dispatch')
class CartView(TemplateView):
    template_name = 'cart.html'

    def get_context_data(self, *args, **kwargs):
        if 'id' in self.kwargs.keys():
            order_id = self.kwargs['id']
            order = Order.objects.get(id=order_id)
            cart = {}
            cart['id'] = order.id
            cart['items'] = order.items.all()
            cart['total'] = order.total_price
        else:
            cart = {}
            # cart['items'] = []
        context = super(CartView, self).get_context_data(**kwargs)
        context.update({
            'cart': cart
            })

        return context

    def post(self, *args, **kwargs):
        cart_id = self.kwargs['id']
        cart = Order.objects.get(id=cart_id)
        items = cart.items.all()
        f_items = [format_item(item) for item in items]
        res =  createStripeSession(f_items)
        return res

class CartViewManage(TemplateView):
    template_name = 'cart.html'
    print('handling cart')

    def get(self, *args, **kwargs):
        if 'cart_id' in self.kwargs.keys():
            cart_id = self.kwargs['cart_id']
            order = Order.objects.get(id=cart_id)
        else:
            order = Order()
            order.save()

        item_id = self.kwargs['item_id']
        item = Item.objects.get(id=item_id)
        order.items.add(item)

        return JsonResponse({'cartId': order.id, 'ok': True})


class ItemView(TemplateView):
    template_name = 'item.html'

    def get_context_data(self, *args, **kwargs):
        item_id = self.kwargs['id']
        item = Item.objects.get(id=item_id)
        context = super(ItemView, self).get_context_data(**kwargs)
        context.update({
            'item': item
            })

        return context


@csrf_exempt
def stripe_config(request):
    if request.method == 'GET':
        stripe_config = {'publicKey': settings.STRIPE_PUBLISHABLE_KEY}
        return JsonResponse(stripe_config, safe=False)

@csrf_exempt
def buy(request, id):
    if request.method == 'GET':
            item = Item.objects.get(id=id)
            f_item = format_item(item)
            res = createStripeSession([f_item])
            return res

