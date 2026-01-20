from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import requests

class FetchNews(APIView):
    def get(self, request):
        url = "https://newsdata.io/api/1/news"
        
        params = {
            "apikey": settings.NEWSDATA_API_KEY,
            "language": "en",
            "country": "rw",
            "image": 1,
            "category": "technology",
            "removeduplicate": 1
        }
        
        try:
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                # Filter results to ensure they have images
                data['results'] = [
                    article for article in data.get('results', []) 
                    if article.get('image_url')
                ]
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Failed to fetch news", "details": response.text},
                    status=response.status_code
                )
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": "Request failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
