import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShoppingCart, Package, ArrowLeft, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import RemoveCartButton from '@/components/cart/RemoveCartButton';
import ProductImage from '@/components/ui/ProductImage';
import CheckoutButton from './_components/CheckoutButton';

export const metadata: Metadata = {
  title: 'Giỏ Hàng · RevolateG',
  description: 'Xem và quản lý giỏ hàng của bạn.',
};

/* ── Types ──────────────────────────────────────────────────────── */
type CartItemRow = {
  id: string;
  item_id: string;
  market_items: {
    title: string;
    price: number;
    image_url: string | null;
  } | null;
};

/* ── Helpers ─────────────────────────────────────────────────────── */
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatVND = (n: number) => vnd.format(n);

const FALLBACK_IMG =
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg';

/* ════════════════════════════════════════════════════════════════════
   CartPage — Server Component
   Fetches cart_items joined with market_items for the authenticated user.
════════════════════════════════════════════════════════════════════ */
export default async function CartPage() {
  const supabase = await createClient();

  /* ── Auth (server-validated — never getSession) ── */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  /* ── Fetch cart items with joined product data ── */
  const { data: rawItems, error: cartError } = await supabase
    .from('cart_items')
    .select('id, item_id, market_items(title, price, image_url)')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  if (cartError) {
    console.error('[CartPage] fetch error:', cartError.message);
  }

  const items = (rawItems ?? []) as unknown as CartItemRow[];
  const isEmpty = items.length === 0;

  /* ── Totals ── */
  const subtotal   = items.reduce((sum, i) => sum + (i.market_items?.price ?? 0), 0);
  const totalPrice = subtotal; // alias — single source of truth
  const itemCount  = items.length;

  /* ══════════════════════════════════════════
     EMPTY STATE
  ══════════════════════════════════════════ */
  if (isEmpty) {
    return (
      <div className="grid-bg flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-24">
        {/* Neon icon */}
        <div
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5"
          style={{ boxShadow: '0 0 60px rgba(0,245,255,0.06)' }}
        >
          <ShoppingCart
            size={52}
            className="text-cyan-500/40"
            aria-hidden="true"
          />
        </div>

        <h1 className="mb-3 font-mono text-2xl font-black uppercase tracking-widest text-white/70">
          Giỏ hàng trống
        </h1>
        <p className="mb-10 max-w-sm text-center font-mono text-sm text-[var(--color-text-muted)]">
          Bạn chưa thêm sản phẩm nào vào giỏ hàng. Khám phá cửa hàng và chọn tài khoản game yêu thích!
        </p>

        <Link
          href="/"
          className="
            flex items-center gap-2.5 rounded-xl border px-6 py-3
            font-mono text-sm font-bold uppercase tracking-wider
            border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)] text-black
            transition-all duration-200
            hover:bg-[#1afcff]
            hover:shadow-[0_0_20px_var(--color-neon-cyan),0_0_40px_rgba(0,245,255,0.25)]
            hover:-translate-y-0.5 active:scale-95
          "
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Khám phá cửa hàng
        </Link>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MAIN CART LAYOUT
  ══════════════════════════════════════════ */
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 font-mono text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-neon-cyan)]"
              >
                <ArrowLeft size={12} aria-hidden="true" />
                Trang chủ
              </Link>
            </div>
            <h1 className="flex items-center gap-3 font-mono text-2xl font-black uppercase tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
              <ShoppingCart
                size={26}
                className="text-[var(--color-neon-cyan)]"
                style={{ filter: 'drop-shadow(0 0 8px var(--color-neon-cyan))' }}
                aria-hidden="true"
              />
              Giỏ hàng của tôi
            </h1>
            <p className="mt-1 font-mono text-sm text-[var(--color-text-muted)]">
              {itemCount} sản phẩm trong giỏ
            </p>
          </div>
        </div>

        {/* ── Two-column grid: items (left) + summary (right) ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">

          {/* ══════════════════════════════════════════
              LEFT — Item list
          ══════════════════════════════════════════ */}
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const product = item.market_items;
              const imgSrc  = product?.image_url ?? FALLBACK_IMG;
              const title   = product?.title   ?? 'Sản phẩm không xác định';
              const price   = product?.price   ?? 0;

              return (
                <article
                  key={item.id}
                  className="
                    group flex items-center gap-4 rounded-xl border p-4
                    border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60
                    backdrop-blur-md
                    transition-all duration-200
                    hover:border-cyan-500/30
                    hover:shadow-[0_0_24px_rgba(0,245,255,0.05)]
                  "
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/game/${item.item_id}`}
                    className="shrink-0 overflow-hidden rounded-lg"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <ProductImage
                      src={imgSrc}
                      alt={title}
                      className="h-[72px] w-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      href={`/game/${item.item_id}`}
                      className="
                        line-clamp-2 font-mono text-sm font-bold
                        text-[var(--color-text-primary)]
                        transition-colors duration-150
                        hover:text-[var(--color-neon-cyan)]
                      "
                    >
                      {title}
                    </Link>

                    {/* Price badge */}
                    <span
                      className="
                        self-start rounded-md border px-2 py-0.5
                        font-mono text-xs font-bold
                        border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/[0.07]
                        text-[var(--color-neon-cyan)]
                      "
                      style={{ textShadow: '0 0 8px rgba(0,245,255,0.4)' }}
                    >
                      {formatVND(price)}
                    </span>
                  </div>

                  {/* Remove button */}
                  <div className="shrink-0">
                    <RemoveCartButton cartItemId={item.id} />
                  </div>
                </article>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════
              RIGHT — Order Summary (sticky)
          ══════════════════════════════════════════ */}
          <aside>
            <div
              className="sticky top-24 flex flex-col gap-5 rounded-2xl border p-6 backdrop-blur-md"
              style={{
                borderColor:  'rgba(0,245,255,0.15)',
                background:   'rgba(13,13,20,0.85)',
                boxShadow:    '0 0 40px rgba(0,245,255,0.06), inset 0 1px 0 rgba(0,245,255,0.07)',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5">
                <Package size={16} className="text-[var(--color-neon-cyan)]" aria-hidden="true" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Tóm tắt đơn hàng
                </h2>
              </div>

              {/* Item count */}
              <div className="flex items-center justify-between font-mono text-sm">
                <span className="text-[var(--color-text-muted)]">
                  Số lượng sản phẩm
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {itemCount}
                </span>
              </div>

              {/* Divider */}
              <div
                className="h-px w-full"
                style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.3), transparent)' }}
              />

              {/* Total */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                  Tổng tiền
                </span>
                <span
                  className="font-mono text-3xl font-black tracking-tight text-[var(--color-neon-cyan)]"
                  style={{ textShadow: '0 0 20px rgba(0,245,255,0.45)' }}
                >
                  {formatVND(totalPrice)}
                </span>
              </div>

              {/* Divider */}
              <div
                className="h-px w-full"
                style={{ background: 'linear-gradient(90deg, var(--color-cyber-border), transparent)' }}
              />

              {/* Checkout button — only rendered when cart is non-empty */}
              {items.length > 0 && <CheckoutButton />}

              {/* Trust note */}
              <p className="text-center font-mono text-[10px] text-[var(--color-text-muted)]">
                🔒 Thanh toán bảo mật SSL · Giao hàng tức thì
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

