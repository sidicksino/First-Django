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

@api_view(['GET', 'PUT', 'DELETE'])
def news(request, pk):
    try:
        news = News.objects.get(pk=pk)
    except News.DoesNotExist:
        return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response(NewsSerializer(news).data)
    
    elif request.method == 'PUT':
        serializer = NewsSerializer(news, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        news.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)