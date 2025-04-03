# charts/urls.py
from django.urls import path
from . import views

app_name = 'charts'

urlpatterns = [
    path('', views.display_charts, name='display_charts'),
    # Xóa dòng path('data.csv', views.serve_csv, name='serve_csv_manually') nếu có
]