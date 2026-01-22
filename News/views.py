from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import requests

def get_news_data(country="rw", category="all"):

    url = "https://newsdata.io/api/1/latest"
    
    # Basic validation
    if not country:
        country = "rw"
    if not category:
        category = "all"
        
    params = {
        "apikey": settings.NEWSDATA_API_KEY,
        "language": "en",
        "country": country,
        "image": 1,
        "removeduplicate": 1
    }
    
    if category and category != 'all':
        params['category'] = category
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()

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
        country = request.query_params.get('country', 'rw')
        category = request.query_params.get('category', 'all')
        
        data = get_news_data(country=country, category=category)
        
        if data["error"]:
             # In a real API we might want to pass the status code from the upstream response
            return Response(
                {"error": data["error"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response({"results": data["results"]}, status=status.HTTP_200_OK)

def home(request):
    """View to render the futuristic home page with filters."""
    # Get filters from query params
    selected_country = request.GET.get('country', 'rw')
    selected_category = request.GET.get('category', 'all')
    
    # We can fetch some default news for server-side rendering (SSR)
    # The dedicated API can be used for client-side filtering/loading more
    news_data = get_news_data(country=selected_country, category=selected_category)
    
    context = {
        "news_articles": news_data["results"],
        "error": news_data["error"],
        "selected_country": selected_country,
        "selected_category": selected_category,
    }
    return render(request, 'news/home.html', context)

def about(request):
    """View to render the about page."""
    return render(request, 'news/about.html')

def contact(request):
    """View to render the contact page."""
    return render(request, 'news/contact.html')
