from django.urls import path
from .views import fetch_news

urlpatterns = [
    path('fetch_news/', fetch_news, name='fetch_news'),
]