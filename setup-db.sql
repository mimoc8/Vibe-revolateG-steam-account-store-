-- Cập nhật bảng orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS order_code text UNIQUE,
ADD COLUMN IF NOT EXISTS cart_snapshot jsonb,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'vietqr';

-- Cho phép update orders (cần thiết nếu chưa có)
-- Nếu dùng Service Role Key trên backend (Webhook), không cần RLS, 
-- nhưng nếu update từ client thì cần policy. 
-- Ở đây ta sẽ update qua Server Actions/Webhook nên không cần mở public RLS cho UPDATE.
