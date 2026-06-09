"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Hardcoded admin credentials (you can move this to .env later: process.env.ADMIN_USERNAME)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "revolateg2026";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Giả lập độ trễ ngắn để tránh bị brute-force quá nhanh
  await new Promise(resolve => setTimeout(resolve, 800));

  if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Nếu đúng thông tin, set một cookie HTTP-Only tên là 'admin_token'
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "authorized_revolateg_admin_session_true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/cyber-core-xyz", // Chỉ gửi cookie này cho trang admin
      maxAge: 60 * 60 * 24, // Hết hạn sau 1 ngày
    });

    return { success: true };
  } else {
    return { error: "UNAUTHORIZED ACCESS: ID Đặc vụ hoặc Mã bảo mật không chính xác!" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/cyber-core-xyz/login");
}
