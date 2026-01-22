from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import requests

def get_news_data(category="technology"):
    """Helper function to fetch news data from the API."""
    url = "https://newsdata.io/api/1/news"
    params = {
        "apikey": settings.NEWSDATA_API_KEY,
        "language": "en",
        "country": "rw",  # Consider making this dynamic or broader for "Global" feel
        "image": 1,
        "category": category,
        "removeduplicate": 1
    }
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            # Filter results to ensure they have images
            results = [
                article for article in data.get('results', []) 
                if article.get('image_url')
            ]
            return {"results": results, "error": None}
        else:
            return {"results": [], "error": f"Failed to fetch news: {response.text}"}
    except requests.exceptions.RequestException as e:
        return {"results": [], "error": f"Request failed: {str(e)}"}

class FetchNews(APIView):
    def get(self, request):
        data = get_news_data()
        if data["error"]:
             # In a real API we might want to pass the status code from the upstream response
            return Response(
                {"error": data["error"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response({"results": data["results"]}, status=status.HTTP_200_OK)

def home(request):
    """View to render the futuristic home page."""
    # We can fetch some default news for server-side rendering (SSR)
    # The dedicated API can be used for client-side filtering/loading more
    news_data = get_news_data()
    context = {
        "news_articles": news_data["results"],
        "error": news_data["error"]
    }
    return render(request, 'news/home.html', context)
