"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function updateUserStatusAction(userId: string, newStatus: string) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  const secureToken = process.env.PAYOS_CHECKSUM_KEY ? `admin_${process.env.PAYOS_CHECKSUM_KEY}` : "authorized_revolateg_admin_session_true";

  if (!adminToken || adminToken.value !== secureToken) {
    return { success: false, error: "Unauthorized" };
  }

  // Use service role key to bypass RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Cập nhật trạng thái Ban trên hệ thống Supabase Auth (khóa đăng nhập)
  if (newStatus === 'banned') {
    // Ban 100 năm
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
    if (banError) console.error("Failed to ban user in auth:", banError);
  } else if (newStatus === 'active') {
    // Gỡ Ban
    const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
    if (unbanError) console.error("Failed to unban user in auth:", unbanError);
  }

  return { success: true };
}

export async function deleteGameAction(gameId: string) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  const secureToken = process.env.PAYOS_CHECKSUM_KEY ? `admin_${process.env.PAYOS_CHECKSUM_KEY}` : "authorized_revolateg_admin_session_true";

  if (!adminToken || adminToken.value !== secureToken) {
    return { success: false, error: "Unauthorized" };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Hủy liên kết khóa ngoại với bảng orders để có thể xóa
  await supabaseAdmin.from('orders').update({ game_id: null }).eq('game_id', gameId);

  // Xóa các dữ liệu phụ thuộc (cart_items, item_secrets)
  await supabaseAdmin.from('cart_items').delete().eq('item_id', gameId);
  await supabaseAdmin.from('item_secrets').delete().eq('item_id', gameId);

  // Thực sự xóa game khỏi database
  const { error } = await supabaseAdmin.from('market_items').delete().eq('id', gameId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  const secureToken = process.env.PAYOS_CHECKSUM_KEY ? `admin_${process.env.PAYOS_CHECKSUM_KEY}` : "authorized_revolateg_admin_session_true";

  if (!adminToken || adminToken.value !== secureToken) {
    return { success: false, error: "Unauthorized" };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Hủy liên kết khóa ngoại với bảng orders để có thể xóa
  await supabaseAdmin.from('orders').update({ user_id: null }).eq('user_id', userId);

  // Xóa user khỏi auth.users (Thường sẽ tự động cascade xóa profiles)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    return { success: false, error: authError.message };
  }

  // Chắc chắn xóa luôn trong public.profiles nếu không có cascade
  await supabaseAdmin.from('profiles').delete().eq('id', userId);

  return { success: true };
}
