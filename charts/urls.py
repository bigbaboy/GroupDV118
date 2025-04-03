# charts/urls.py
from django.urls import path
from . import views # Import views từ file views.py cùng thư mục

# Đặt tên namespace cho các URL của app này.
# Giúp phân biệt URL nếu có nhiều app trùng tên URL pattern.
app_name = 'charts'

# Danh sách các mẫu URL cho app charts
urlpatterns = [
    # Khi người dùng truy cập vào đường dẫn gốc của app này
    # (ví dụ, nếu project URL là '/charts/', thì đây tương ứng với '/charts/')
    # thì sẽ gọi hàm views.display_charts.
    # name='display_charts' là tên để gọi URL này trong code Django khác nếu cần.
    path('', views.display_charts, name='display_charts'),

    # Nếu sau này bạn có thêm các trang khác cho app charts, ví dụ:
    # path('details/', views.show_details, name='show_details'),
]