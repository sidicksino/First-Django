from django.urls import path
from .views import FetchNews

urlpatterns = [
    path("news/", FetchNews.as_view(), name="fetch_news"),
]
