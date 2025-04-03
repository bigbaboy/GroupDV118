from django.shortcuts import render
# Import hàm 'static' để lấy URL cho file tĩnh
from django.templatetags.static import static

# Định nghĩa view function tên là display_charts
def display_charts(request):
    """
    View này xử lý việc hiển thị trang biểu đồ.
    Nó lấy URL của file CSV và truyền vào template.
    """
    # Dùng hàm static() để lấy đường dẫn URL đúng cho file CSV
    # 'charts/data_ggsheet.csv' là đường dẫn tương đối bên trong thư mục static
    csv_url = static('charts/data_ggsheet.csv')

    # Tạo một dictionary (gọi là context) để chứa dữ liệu
    # sẽ được gửi tới template. Template sẽ truy cập URL này
    # thông qua biến {{ csv_data_url }}.
    context = {
        'csv_data_url': csv_url
    }

    # Gọi hàm render() để tạo phản hồi HTML:
    # - request: Đối tượng yêu cầu gốc.
    # - 'charts/index.html': Tên file template cần render.
    # - context: Dữ liệu được truyền vào template.
    return render(request, 'charts/index.html', context)