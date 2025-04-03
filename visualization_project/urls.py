# visualization_project/urls.py
from django.contrib import admin
# Đảm bảo bạn đã import 'include'
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Thêm dòng này:
    # Bất kỳ URL nào bắt đầu bằng 'charts/' sẽ được chuyển tiếp
    # đến file urls.py của app 'charts' (file bạn vừa tạo ở trên)
    # để xử lý tiếp.
    path('charts/', include('charts.urls')),

    # ----- TÙY CHỌN -----
    # Nếu bạn muốn trang biểu đồ là trang chủ của website
    # (truy cập qua http://127.0.0.1:8000/ thay vì /charts/)
    # thì bạn dùng dòng này THAY CHO dòng 'charts/' ở trên:
    # path('', include('charts.urls')),
    # --------------------
]