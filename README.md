# Portfolio cá nhân

Website tĩnh được xây dựng bằng HTML, CSS và JavaScript thuần. Dự án không cần framework, bước build, package cài đặt hay biến môi trường.

## Cấu trúc

```text
.
├── index.html
├── about.html
├── contact.html
├── css/
│   └── style.css
├── images/
│   ├── avatar.jpg
│   ├── avatar.svg
│   └── logo.svg
└── js/
    └── script.js
```

`index.html` nằm ở thư mục gốc và là trang mặc định. Điều hướng và tài nguyên dùng đường dẫn tương đối từ thư mục này.

## Chạy trên máy cá nhân

Mở PowerShell tại thư mục dự án, chạy máy chủ HTTP tích hợp trong Python:

```powershell
py -m http.server 8000
```

Mở <http://localhost:8000>. Dừng máy chủ bằng `Ctrl+C`.

## Deploy lên Vercel

Không cần tạo `vercel.json`, cài package hay cấu hình biến môi trường cho website tĩnh này.

1. Đảm bảo source đã được đưa lên một repository Git mà bạn có quyền truy cập. Việc push repository do bạn tự thực hiện.
2. Đăng nhập Vercel và chọn **Add New → Project**, sau đó import repository.
3. Đặt **Root Directory** là thư mục chứa `index.html` (mặc định `./` khi `index.html` ở gốc repository).
4. Chọn **Framework Preset: Other** nếu Vercel không tự nhận diện dự án.
5. Để **Build Command** và **Install Command** trống/không ghi đè; không có bước build.
6. Để **Output Directory** mặc định nếu cấu hình Vercel tự phục vụ file tĩnh từ root. Nếu giao diện yêu cầu chỉ định thư mục output, nhập `.` để dùng chính thư mục gốc có `index.html`.
7. Chọn **Deploy**. Sau khi hoàn tất, mở URL do Vercel cung cấp và kiểm tra trang chủ, About, Contact, ảnh, CSS và JavaScript.

Các trang hiện có là `index.html`, `about.html`, `projects.html` và `contact.html`. Mục Dự án trên Navbar mở trang Projects.

## Form liên hệ

Form cần Formspree endpoint thật trước khi có thể gửi tin nhắn. Trong `contact.html`, thay `FORM_ID` trong thuộc tính `action` (`https://formspree.io/f/FORM_ID`) bằng ID được cấp khi tạo form trên Formspree. Website không cần biến môi trường cho endpoint này; khi chưa cấu hình, form sẽ báo trạng thái chưa kết nối và không gửi request.

Tham khảo hướng dẫn Vercel: <https://vercel.com/docs/builds/configure-a-build> và <https://vercel.com/docs/deployments>.
