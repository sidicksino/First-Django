from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
from .serializer import NewsSerializer
from .models import News

# Create your views here.
@api_view(['GET'])
def fetch_news(request):
    news = News.objects.all()
    return Response(NewsSerializer(news, many=True).data)

@api_view(['POST'])
def create_news(request):
    serializer = NewsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
