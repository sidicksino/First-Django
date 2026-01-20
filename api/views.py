from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
from .serializer import NewsSerializer
from .models import News

# Create your views here.
@api_view(['GET'])
def fetch_news(request):
    return Response(NewsSerializer({ "title": "Hello", "desciption": "Hello, World!" }, many=False).data)