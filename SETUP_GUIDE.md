# Setup & Installation Guide / Hướng Dẫn Cài Đặt

*Scroll down for the Vietnamese version! / Cuộn xuống dưới để xem bản Tiếng Việt!*

---

## 🇬🇧 ENGLISH VERSION

Welcome to the RevolateG Source Code! Follow these steps to get your project up and running locally, and to configure your database and payment gateways.

### 1. Prerequisites
- **Node.js** (v18 or higher) installed on your machine.
- A **Supabase** account (for Database and Google Authentication).
- A **PayOS** account (for payment integration).

### 2. Initial Setup
**Step 1: Extract and open the code**
Extract the ZIP file and open the project folder in VS Code (or any code editor).

**Step 2: Install dependencies**
Open the Terminal in your editor and run the following command to install the required packages:
```bash
npm install
```

### 3. Database Configuration (Supabase)
**Step 1:** Log in to [Supabase](https://supabase.com/) and create a new Project.
**Step 2:** Navigate to the **SQL Editor** from the left sidebar in Supabase.
**Step 3:** Open the `setup-db.sql` file provided in this source code, copy all its content, and paste it into the Supabase SQL Editor. Click **Run** to create the necessary tables (`users`, `market_items`, `orders`, `cart_items`, etc.).
**Step 4:** Get your API Keys:
Go to `Project Settings > API` on Supabase to retrieve:
- Project URL
- `anon` `public` key
- `service_role` key

### 4. Environment Variables Configuration (CRITICAL)
Rename the `.env.example` file to `.env.local` (or create a new file named `.env.local`). Then, paste your API keys into this file:

```env
# Replace with your Supabase API keys
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Retrieve these keys from your PayOS Dashboard
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key

# Admin Dashboard Login Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 5. Running the Website
Once the above steps are completed, run the following command in your terminal:
```bash
npm run dev
```
Your browser will open the app at: `http://localhost:3000`.

- **Admin Dashboard:** To access the management panel (to add/remove games, view orders), go to `http://localhost:3000/cyber-core-xyz/login` and log in using the admin credentials you set in your `.env.local` file.

Enjoy building and selling with RevolateG!

---
---

## 🇻🇳 PHIÊN BẢN TIẾNG VIỆT

Chào mừng bạn đã mua Source Code này! Dưới đây là các bước để chạy website lên máy tính của bạn và cấu hình các dịch vụ cần thiết (Supabase & PayOS).

### 1. Yêu Cầu Hệ Thống
- Máy tính phải cài đặt sẵn **Node.js** (phiên bản 18 trở lên).
- Có tài khoản **Supabase** (để quản lý Database và Đăng nhập bằng Google).
- Có tài khoản **PayOS** (để tích hợp thanh toán).

### 2. Các Bước Khởi Chạy Ban Đầu
**Bước 1: Giải nén và mở thư mục code**
Giải nén file ZIP, sau đó mở thư mục dự án bằng VS Code (hoặc trình soạn thảo khác).

**Bước 2: Cài đặt thư viện**
Mở Terminal trong VS Code và chạy lệnh sau để tải các thư viện cần thiết:
```bash
npm install
```

### 3. Cấu hình Database (Supabase)
**Bước 1:** Đăng nhập vào [Supabase](https://supabase.com/) và tạo một Project mới.
**Bước 2:** Vào phần **SQL Editor** trong thanh công cụ bên trái của Supabase.
**Bước 3:** Mở file `setup-db.sql` có sẵn trong source code này, copy toàn bộ nội dung bên trong và dán vào SQL Editor trên Supabase, sau đó nhấn nút **Run** (để tạo các bảng như `users`, `market_items`, `orders`, `cart_items`...).
**Bước 4:** Lấy thông tin API Keys:
Vào phần `Project Settings > API` trên Supabase để lấy các thông tin:
- Project URL
- `anon` `public` key
- `service_role` key

### 4. Cấu hình Biến Môi Trường (Cực Kỳ Quan Trọng)
Đổi tên file `.env.example` thành `.env.local` (Hoặc tạo mới một file tên `.env.local`). Sau đó dán các thông tin API bạn vừa lấy được vào file này:

```env
# Thay thế bằng API keys của Supabase bạn vừa lấy
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Lấy các key này từ dashboard của PayOS
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key

# Tên đăng nhập và mật khẩu vào trang Quản Trị (Admin)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=mat_khau_cua_ban
```

### 5. Chạy Trang Web
Sau khi đã hoàn thành các bước trên, bạn chạy lệnh sau trên Terminal:
```bash
npm run dev
```
Trình duyệt sẽ mở lên tại: `http://localhost:3000`.

- **Trang Admin:** Để vào bảng quản trị (thêm xóa game, xem đơn hàng), hãy truy cập `http://localhost:3000/cyber-core-xyz/login` và nhập tài khoản admin bạn đã thiết lập ở file `.env.local`.

Chúc bạn cài đặt thành công và kinh doanh phát đạt với hệ thống này!
