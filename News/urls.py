from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/news/', views.FetchNews.as_view(), name='fetch_news'),
]
