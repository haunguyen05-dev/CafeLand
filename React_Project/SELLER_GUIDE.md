# 📋 Hướng Dẫn Sử Dụng Trang Quản Lí Seller

## 🎯 Tính Năng

Trang quản lí Seller cho phép các nhà bán hàng (users với role = "seller") có thể:

1. **Xem danh sách Stores** - Hiển thị tất cả các cửa hàng của seller
2. **Quản lí Sản Phẩm** - Thêm, sửa, xóa sản phẩm cho từng store
3. **Thêm Sản Phẩm** - Tạo sản phẩm mới với hình ảnh
4. **Sửa Sản Phẩm** - Cập nhật thông tin sản phẩm
5. **Xóa Sản Phẩm** - Xóa sản phẩm không cần thiết

## 🔐 Hệ Thống Xác Thực

- Chỉ users với `role = "seller"` mới có thể truy cập trang `/seller`
- Trang sẽ tự động redirect đến `/login` nếu user không phải seller
- Thông tin user được lưu trong localStorage và token để xác thực API

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/
│   └── seller/
│       ├── guard/
│       │   └── SellerRoute.tsx          # Route guard
│       ├── layout/
│       │   └── SellerLayout.tsx         # Layout chính
│       ├── pages/
│       │   ├── SellerStorePage.tsx      # Danh sách stores
│       │   └── StoreDetail.tsx          # Chi tiết store & quản lí products
│       └── components/
│           ├── AddEditProductModal.tsx  # Modal thêm/sửa product
│           └── DeleteConfirmModal.tsx   # Modal xác nhận xóa
├── css/
│   └── seller.css                       # Styles cho seller
├── interfaces/
│   ├── User.tsx                         # Interface User (có thêm role)
│   ├── Product.tsx
│   └── Store.tsx
└── App.tsx                              # Routes chính
```

## 🚀 Cách Sử Dụng

### 1. Đăng Nhập với Role Seller
- Truy cập `/login`
- Đăng nhập với tài khoản có role = "seller"
- Sau khi đăng nhập thành công, bạn sẽ thấy nút "Bảng Quản Lí" ở header

### 2. Truy Cập Trang Quản Lí
- Click vào nút "Bảng Quản Lí" ở header
- Hoặc trực tiếp truy cập `/seller`

### 3. Quản Lí Stores
- Trang `/seller` hiển thị danh sách tất cả stores của seller
- Mỗi store card hiển thị:
  - Tên store
  - Trạng thái (Hoạt động / Tạm dừng)
  - Địa chỉ
  - SĐT
  - Ngày tạo
- Click nút "Quản Lí Sản Phẩm" để vào chi tiết store

### 4. Quản Lí Sản Phẩm
- Trang `/seller/store/:id` hiển thị:
  - Thông tin store
  - Danh sách products dạng bảng
  - Nút "Thêm Sản Phẩm"

#### Thêm Sản Phẩm:
1. Click nút "Thêm Sản Phẩm"
2. Nhập các thông tin:
   - Tên sản phẩm (bắt buộc)
   - Mô tả
   - Giá (bắt buộc)
   - Danh mục (bắt buộc)
   - Trạng thái
   - Hình ảnh (có thể upload multiple files)
3. Click "Lưu"

#### Sửa Sản Phẩm:
1. Click icon sửa (bút chì) ở bảng products
2. Sửa thông tin cần thiết
3. Click "Lưu"

#### Xóa Sản Phẩm:
1. Click icon xóa (thùng rác) ở bảng products
2. Xác nhận xóa ở modal
3. Sản phẩm sẽ được xóa khỏi database

## 🎨 Giao Diện

### Header
- Logo "CafeLand Seller"
- Tên seller
- Nút đăng xuất

### Sidebar (Responsive)
- Menu điều hướng
- Link "Quản lí Store"
- Menu toggle button trên mobile

### Main Content
- Tương ứng với từng page
- Full responsive design

## 🔌 API Endpoints

### Stores
- `GET /store?user_id={userId}` - Lấy danh sách stores của user
- `GET /store/:id` - Lấy chi tiết store

### Products
- `GET /product?store_id={storeId}` - Lấy danh sách products của store
- `POST /product` - Tạo sản phẩm mới
- `PUT /product/:id` - Cập nhật sản phẩm
- `DELETE /product/:id` - Xóa sản phẩm

### Categories
- `GET /category` - Lấy danh sách danh mục

## 📱 Responsive Design

Trang được tối ưu cho:
- Desktop (>1200px)
- Tablet (768px - 1200px)
- Mobile (<768px)

Trên mobile:
- Sidebar ẩn mặc định, có nút toggle
- Các button và form phù hợp với màn hình nhỏ
- Bảng products có scroll ngang

## ⚠️ Lưu Ý

1. **Authentication**: Đảm bảo token được lưu trong localStorage với key "token"
2. **Authorization Header**: Các API request cần header:
   ```
   Authorization: Bearer {token}
   ```
3. **Image Upload**: Form data được sử dụng để upload hình ảnh
4. **Error Handling**: Các lỗi sẽ được hiển thị dưới dạng alert hoặc error message
5. **Loading State**: Các button sẽ disable khi đang xử lý

## 🐛 Troubleshooting

### Lỗi "Không thể tải dữ liệu"
- Kiểm tra backend server đang chạy
- Kiểm tra token có hợp lệ không
- Kiểm tra user có role = "seller" không

### Lỗi "Store không tìm thấy"
- Kiểm tra store ID có đúng không
- Kiểm tra store có tồn tại trong database

### Hình ảnh không upload được
- Kiểm tra file size
- Kiểm tra định dạng file (jpg, png, gif, etc)
- Kiểm tra permission của folder upload trên server

## 📚 Dependencies

- React 19.1.1
- React Router DOM 7.9.4
- React Icons 5.5.0
- TypeScript

## 🎓 Mở Rộng

Có thể thêm các tính năng:
- Thống kê doanh số theo store
- Quản lí đơn hàng
- Xem reviews từ khách hàng
- Quản lí khuyến mãi/voucher riêng cho store
- Báo cáo doanh thu
