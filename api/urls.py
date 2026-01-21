from django.urls import path
from .views import fetch_news, create_news, news

urlpatterns = [
    path('fetch_news/', fetch_news, name='fetch_news'),
    path('create_news/', create_news, name='create_news'),
    path('news/<int:pk>/', news, name='news'),
]