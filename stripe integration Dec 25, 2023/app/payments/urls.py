from django.urls import path

from . import views

urlpatterns = [
        path('', views.HomePageView.as_view(), name='home'),
        path('get/<int:id>', views.ItemView.as_view()),
        path('config/', views.stripe_config),
        path('buy/<int:id>', views.buy),
        path('success/', views.SuccessView.as_view()),
        path('cancelled/', views.CancelledView.as_view()),

        path('cart/', views.CartView.as_view()),
        path('cart/<int:id>', views.CartView.as_view()),

        path('cart/add/<int:item_id>', views.CartViewManage.as_view()),
        path('cart/add/<int:item_id>/<int:cart_id>', views.CartViewManage.as_view())
        ]
