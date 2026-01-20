from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
import requests

# Create your views here.
def fetch_news(request):
    url = "https://newsdata.io/api/1/news"
    
    params = {
        "apikey": settings.NEWSDATA_API_KEY,
        "language": "en",
        "country": "us",
        "category": "technology"
    }
    
    try:
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            return JsonResponse(data, safe=False)
        else:
            return JsonResponse(
                {"error": "Failed to fetch news", "details": response.text},
                status=response.status_code
            )
    except requests.exceptions.RequestException as e:
        return JsonResponse(
            {"error": "Request failed", "details": str(e)},
            status=500
        )
