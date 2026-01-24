from django.contrib import admin

# Register your models here.
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'publishedAt', 'url')
    list_filter = ('publishedAt', 'category')
