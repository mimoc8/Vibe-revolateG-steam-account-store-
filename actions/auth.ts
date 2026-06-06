'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logoutUser() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('[auth.ts] logoutUser error:', error);
    return { error: 'Lỗi đăng xuất' };
  }
}
