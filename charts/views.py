# charts/views.py
from django.shortcuts import render
from django.conf import settings
# Không cần import HttpResponse, Http404, os, reverse nữa

def display_charts(request):
    """
    Phục vụ trang biểu đồ, truyền URL tĩnh của file CSV vào template.
    Sử dụng tên file đã đổi là 'data.csv'.
    """
    # Tạo URL tĩnh cho file data.csv
    csv_url = settings.STATIC_URL + 'charts/data.csv'
    print(f"DEBUG: URL passed to template = {csv_url}")

    context = {
        'csv_data_url': csv_url
    }
    return render(request, 'charts/index.html', context)

# Xóa bỏ hoàn toàn hàm serve_csv(request) nếu có