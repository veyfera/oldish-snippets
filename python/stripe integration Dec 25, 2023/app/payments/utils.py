from django.conf import settings
from django.http.response import JsonResponse
import stripe

def createStripeSession(items):
    domain_url = 'http://localhost:8000/'
    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        checkout_session = stripe.checkout.Session.create(
                success_url = domain_url + 'success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url = domain_url + 'cancelled/',
                payment_method_types = ['card'],
                mode = 'payment',
                line_items = items
                )
        return JsonResponse({'sessionId': checkout_session['id']})
    except Exception as e:
        return JsonResponse({'error': str(e)})


def format_item(item):
    return {
            'price_data': {
                'currency': item.currency,
                'unit_amount': item.price,
                'product_data': {
                    'name': item.name,
                    'description': item.description,
                    }},
                'quantity': 1,
                }
