from django.db import models

# Create your models here.

class News(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50)
    image_url = models.URLField()
    published_at = models.DateTimeField()
    source = models.CharField(max_length=100)
    url = models.URLField()
    language = models.CharField(max_length=10)
    country = models.CharField(max_length=50)

    class Meta:
        verbose_name = "News"
        verbose_name_plural = "News"
        ordering = ["-published_at"]

    def __str__(self):
        return self.title

    
    