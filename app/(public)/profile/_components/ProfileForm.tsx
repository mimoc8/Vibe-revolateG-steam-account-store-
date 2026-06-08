'use client';

import { useActionState, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { DISPLAY_NAME_REGEX } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/client';
import { createBrowserClient } from '@supabase/ssr';
import {
  User,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ClipboardList,
  Settings2,
  ShoppingBag,
  CalendarDays,
  Tag,
  BadgeCheck,
  AlertTriangle,
  Upload,
  ImagePlus,
  Trash2,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';

// ── Avatar upload constants & helpers ─────────────────────────────────────────

// Strict allowlist — SVG intentionally absent (Stored XSS vector)
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_EXT  = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_BYTES    = 2 * 1024 * 1024; // 2 MB

type UploadState =
  | { phase: 'idle' }
  | { phase: 'validating' }          // reading magic bytes
  | { phase: 'stripping' }           // canvas EXIF strip
  | { phase: 'uploading'; progress: number }
  | { phase: 'done'; publicUrl: string }
  | { phase: 'error'; message: string };

/**
 * Stage 1 — synchronous pre-screen (MIME type, extension, size).
 * Fast path: rejects obvious garbage before any ArrayBuffer allocation.
 */
function validateFile(file: File): string | null {
  // Block SVG explicitly — it is an XML format that executes <script> tags
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return 'SVG không được phép (nguy cơ bảo mật XSS).';
  }
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  if (!ALLOWED_MIME.includes(file.type as typeof ALLOWED_MIME[number]) || !ALLOWED_EXT.includes(ext)) {
    return 'Chỉ chấp nhận file JPEG, PNG, hoặc WEBP.';
  }
  if (file.size > MAX_BYTES) {
    return `File quá lớn (${(file.size / 1024 / 1024).toFixed(1)} MB). Giới hạn 2 MB.`;
  }
  return null;
}

/**
 * Stage 2 — async magic byte (file signature) verification.
 *
 * Reads only the FIRST 12 bytes via ArrayBuffer slice — no full file load.
 * Returns null on success, or an error string on failure.
 *
 * Signatures checked:
 *   JPEG : FF D8 FF
 *   PNG  : 89 50 4E 47 0D 0A 1A 0A
 *   WEBP : 52 49 46 46 ?? ?? ?? ?? 57 45 42 50  (RIFF....WEBP)
 *
 * SVG is NEVER in ALLOWED_MIME so it never reaches this function.
 */
async function checkMagicBytes(file: File): Promise<string | null> {
  // Read only the first 12 bytes — sufficient for all three signatures
  const slice = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: starts with FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return null; // ✅ valid JPEG
  }

  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 &&
    bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A &&
    bytes[6] === 0x1A && bytes[7] === 0x0A
  ) {
    return null; // ✅ valid PNG
  }

  // WEBP: bytes 0–3 = "RIFF" (52 49 46 46), bytes 8–11 = "WEBP" (57 45 42 50)
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 &&
    bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 &&
    bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return null; // ✅ valid WEBP
  }

  // Signature mismatch — file content does not match a safe image format.
  // Could be a polyglot, renamed script, or a webshell.
  return '⚠️ Chữ ký file không hợp lệ. File có thể đã bị giả mạo — tải lên bị từ chối.';
}

/**
 * Stage 3 — Canvas-based EXIF stripping (anti-forensics).
 *
 * Draws the original image onto an in-memory HTMLCanvasElement and re-exports
 * it as a pristine Blob. The Canvas API only emits raw pixel data, so every
 * EXIF segment (APP1), GPS coordinates, camera model, timestamps, and
 * embedded thumbnails are permanently discarded.
 *
 * Why canvas and not a library?
 *  - Zero dependencies, available in every modern browser.
 *  - The re-encoded pixel data is identical to the original.
 *  - Works for JPEG, PNG, and WEBP.
 *
 * @param file   The validated File (already passed magic byte check).
 * @param mime   The VALIDATED MIME type (‘image/jpeg’ | ‘image/png’ | ‘image/webp’).
 * @returns      A clean Blob with no metadata, ready for Supabase Storage upload.
 */
async function stripExif(file: File, mime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = document.createElement('img');

    img.onload = () => {
      // Create an off-screen canvas exactly the size of the source image.
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas context unavailable'));
        return;
      }

      // Draw pixel data only — EXIF is NOT part of the rendered pixel stream.
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);

      // Export as the VALIDATED mime type.
      // JPEG quality 0.92 is visually lossless at dramatically reduced file size.
      const quality = mime === 'image/jpeg' ? 0.92 : undefined;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('canvas.toBlob() returned null'));
          }
        },
        mime,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image failed to load for EXIF stripping'));
    };

    img.src = objectUrl;
  });
}

// ── Display Name validation (mirrors server-side Zod schema exactly) ─────────

const NAME_MIN = 3;
const NAME_MAX = 30;

type NameValidationResult =
  | { valid: true }
  | { valid: false; message: string };

function validateName(value: string): NameValidationResult {
  if (value.length === 0) {
    return { valid: false, message: 'Tên hiển thị không được để trống.' };
  }
  if (value.trim().length === 0) {
    return { valid: false, message: 'Tên hiển thị không được chỉ chứa khoảng trắng.' };
  }
  if (value.length < NAME_MIN) {
    return { valid: false, message: `Tên phải có ít nhất ${NAME_MIN} ký tự (hiện tại: ${value.length}/${NAME_MIN}).` };
  }
  if (value.length > NAME_MAX) {
    return { valid: false, message: `Tên không được vượt quá ${NAME_MAX} ký tự.` };
  }
  if (!DISPLAY_NAME_REGEX.test(value)) {
    return { valid: false, message: 'Tên chỉ được chứa chữ cái (kể cả tiếng Việt), số, dấu gạch dưới và khoảng trắng.' };
  }
  return { valid: true };
}

// ── Types ────────────────────────────────────────────────────────────────────

/** A single purchase row joined with its market_items data. */
export interface PurchaseItem {
  id: string;
  purchased_at: string;
  item: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
  } | null;
}

interface ProfileFormProps {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  /** Real purchase history from the server — empty array when none. */
  purchases: PurchaseItem[];
}

type TabId = 'settings' | 'orders';

// ── Helpers ──────────────────────────────────────────────────────────────────

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatVND = (n: number) => vnd.format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

// ── Shared field styles ──────────────────────────────────────────────────────

const INPUT_BASE =
  'w-full rounded-lg border border-cyber-border bg-cyber-dark px-4 py-3 text-sm text-text-primary ' +
  'placeholder:text-text-muted/40 outline-none transition-all duration-200 ' +
  'focus:border-neon-cyan/60 focus:ring-1 focus:ring-neon-cyan/30 ' +
  'hover:border-neon-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed';

const LABEL_BASE =
  'flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-widest';

// ── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className={LABEL_BASE}>
      {icon}
      {children}
    </label>
  );
}

function AvatarPreview({
  url,
  fallback,
}: {
  url: string | null;
  fallback: string;
}) {
  // If the external URL (Google, Supabase CDN) fails to load, show the
  // initial-letter fallback so the profile hero never shows a broken image.
  const [imgError, setImgError] = useState(false);
  const showImage = url && !imgError;

  return (
    <div className="relative group shrink-0">
      <div
        className="w-24 h-24 rounded-full ring-2 ring-neon-cyan/30 ring-offset-2 ring-offset-cyber-surface overflow-hidden flex items-center justify-center bg-cyber-dark transition-all duration-300 group-hover:ring-neon-cyan/60"
        style={{ boxShadow: '0 0 24px rgba(0,245,255,0.12)' }}
      >
        {showImage ? (
          <Image
            src={url}
            alt="Profile avatar"
            width={96}
            height={96}
            className="w-full h-full object-cover"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-3xl font-bold text-neon-cyan font-mono">{fallback}</span>
        )}
      </div>
      <span
        className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-cyber-surface"
        title="Active"
      />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ProfileForm({ profile, purchases }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>('settings');
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Avatar state ─────────────────────────────────────────────────────────
  // `avatarPreview` drives the hero ring and the upload zone preview.
  // It can be an object URL (local file) or a remote CDN URL (saved).
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  // The resolved CDN URL injected into the hidden field submitted to the Server Action.
  const [uploadedUrl, setUploadedUrl] = useState<string>(profile.avatar_url ?? '');
  const [uploadState, setUploadState] = useState<UploadState>({ phase: 'idle' });
  // True when the user has explicitly clicked the trash icon to remove their avatar.
  // This flag is sent as a hidden field so the Server Action can write NULL to the DB.
  const [avatarDeleted, setAvatarDeleted] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Display Name state ───────────────────────────────────────────────────
  const [nameValue, setNameValue] = useState<string>(profile.full_name ?? '');
  const nameValidation = validateName(nameValue);
  const [nameDirty, setNameDirty] = useState(false);
  const showNameError = nameDirty && !nameValidation.valid;

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const showToast = (type: 'success'|'error', text: string) => {
      setToastMsg({ type, text });
      setTimeout(() => setToastMsg(null), 3000); // Auto dismiss in 3 seconds
  };

  const handleSaveChanges = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("[TRACE] Bước 1: Đã bấm nút lưu");

    if (!nameValidation.valid) {
      console.log("[TRACE] Validation failed, aborting.");
      return;
    }
    
    setIsSaving(true);
    try {
      const userId = profile.id;
      if (!userId) throw new Error("Không tìm thấy ID người dùng.");
      console.log("[TRACE] User hợp lệ:", userId);
      
      let targetAvatarUrl = avatarDeleted ? null : profile.avatar_url;

      // STEP 1: UPLOAD AVATAR (IF NEW FILE SELECTED)
      if (pendingFile && !avatarDeleted) {
        console.log("[TRACE] Bước 3: Tải file nguyên bản lên Storage...");
        setUploadState({ phase: 'uploading', progress: 50 });
        
        const fileExt = pendingFile.name.split('.').pop() || 'jpg';
        const filePath = `${userId}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, pendingFile, {
                cacheControl: '3600',
                contentType: pendingFile.type
            });
            
        console.log("[TRACE] Phản hồi từ Storage:", uploadData, uploadError);
        
        if (uploadError) throw new Error("Lỗi tải ảnh: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        console.log("[TRACE] Bước 4: Tải ảnh thành công, URL:", publicUrl);
        targetAvatarUrl = publicUrl;
      }

      console.log("[TRACE] Bước 5: Bắt đầu cập nhật Auth Metadata...");
      // STEP 2: UPDATE AUTH METADATA
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: nameValue,
          avatar_url: targetAvatarUrl,
        }
      });
      if (authError) throw new Error('Lỗi cập nhật hồ sơ: ' + authError.message);
      console.log("[TRACE] Cập nhật Auth Metadata thành công.");

      console.log("[TRACE] Bước 6: Bắt đầu đồng bộ vào public profiles...");
      // Đồng bộ vào public profiles
      const { error: dbError } = await supabase.from('profiles').upsert({
        id: profile.id,
        full_name: nameValue,
        avatar_url: targetAvatarUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (dbError) throw new Error('Lỗi đồng bộ CSDL: ' + dbError.message);
      console.log("[TRACE] Đồng bộ CSDL thành công.");

      console.log("[TRACE] Bước 7: Gọi router.refresh() và dispatch event...");
      // STEP 3: SYNC DATA & REFRESH
      showToast('success', 'CẬP NHẬT THÀNH CÔNG');
      router.refresh();
      window.dispatchEvent(new CustomEvent('profile-updated'));
      setAvatarDeleted(false);
      setPendingFile(null);
      if (targetAvatarUrl) setUploadedUrl(targetAvatarUrl);
      setUploadState({ phase: 'idle' });
      
      console.log("[TRACE] HOÀN TẤT: Lưu thành công!");

    } catch (error: any) {
      console.error("🔥 [TRACE] LỖI BẮT ĐƯỢC:", error);
      showToast('error', error?.message || 'LỖI HỆ THỐNG');
      setUploadState({ phase: 'error', message: error?.message || "Lỗi không xác định" });
    } finally {
      console.log("[TRACE] Bước Cuối: Tắt trạng thái Loading");
      setIsSaving(false);
      setIsUploading(false); // Failsafe
    }
  };



  const avatarFallback =
    profile.full_name?.charAt(0).toUpperCase() ??
    profile.email.charAt(0).toUpperCase() ??
    '?';

  // Revoke object URLs when the component unmounts to avoid memory leaks.
  const objectUrlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const [isUploading, setIsUploading] = useState(false);

  // ── File selection handler ────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    setIsUploading(true);
    // Stage 1: Synchronous pre-screen (MIME type, extension, size)
    const quickError = validateFile(file);
    if (quickError) {
      setUploadState({ phase: 'error', message: quickError });
      setIsUploading(false);
      return;
    }

    // Stage 2: Async magic byte validation — show 'validating' spinner
    setUploadState({ phase: 'validating' });
    const magicError = await checkMagicBytes(file);
    if (magicError) {
      // Security rejection — file content does not match a safe image signature
      console.warn('[Avatar] Magic byte mismatch — upload aborted.', file.name, file.type);
      setUploadState({ phase: 'error', message: magicError });
      setIsUploading(false);
      return;
    }

    // Stage 3: Show local object-URL preview
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setAvatarPreview(objectUrl);
    
    // Defer actual upload to handleSaveChanges
    setPendingFile(file);
    setUploadState({ phase: 'done', publicUrl: objectUrl });
    setIsUploading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset so the same file can be re-selected after an error
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveAvatar = () => {
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    setAvatarPreview(null);
    setUploadedUrl('');
    setPendingFile(null); // Clear deferred file
    setAvatarDeleted(true);   // signal to write NULL to DB on save
    setUploadState({ phase: 'idle' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSave = !isSaving && !isUploading && nameValidation.valid;

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'settings', label: 'Cài Đặt Tài Khoản', icon: <Settings2 size={14} /> },
    { id: 'orders', label: 'Lịch Sử Mua Hàng', icon: <ClipboardList size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-cyber-black grid-bg px-4 py-16">
      <div className="mx-auto w-full max-w-3xl">

        {/* ── Top breadcrumb badge ──────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8 text-xs font-mono text-neon-cyan uppercase tracking-widest">
          <ShieldCheck size={14} />
          <span>CyberSteam</span>
          <span className="text-text-muted/40">/</span>
          <span className="text-text-muted">Hồ Sơ Của Tôi</span>
        </div>

        {/* ── Profile hero row ─────────────────────────────────── */}
        <div
          className="relative flex items-center gap-6 rounded-2xl border border-cyber-border bg-cyber-surface px-8 py-6 mb-6 overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(0,245,255,0.05), 0 16px 40px -10px rgba(0,0,0,0.6)' }}
        >
          {/* Neon top bar */}
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #00f5ff 40%, #bf5fff 60%, transparent)' }}
          />
          {/* Background grid glow */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #00f5ff 0%, transparent 60%)' }}
          />

          <AvatarPreview url={avatarPreview} fallback={avatarFallback} />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {profile.full_name ?? 'Anonymous Operator'}
            </h1>
            <p className="text-sm text-text-muted font-mono mt-1 truncate">{profile.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5">
                <BadgeCheck size={10} /> Khách Hàng Xác Thực
              </span>
              <span className="text-[11px] text-text-muted/50 font-mono">
                UID: {profile.id.slice(0, 8)}…
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <p className="text-xs text-text-muted/50 font-mono uppercase tracking-widest">Đơn Hàng</p>
            <p className="text-3xl font-bold text-neon-cyan font-mono">{purchases.length}</p>
          </div>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 rounded-xl border border-cyber-border bg-cyber-surface p-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              role="tab"
              className={`
                flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5
                text-sm font-semibold transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60
                ${activeTab === tab.id
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/25 shadow-[0_0_12px_rgba(0,245,255,0.08)]'
                  : 'text-text-muted hover:text-text-primary hover:bg-cyber-dark/60'}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab panels ──────────────────────────────────────── */}

        {/* ── Tab 1: Account Settings ──────────────────────────── */}
        {activeTab === 'settings' && (
          <div
            className="relative rounded-2xl border border-cyber-border bg-cyber-surface overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(0,245,255,0.05), 0 20px 40px -10px rgba(0,0,0,0.5)' }}
            role="tabpanel"
            aria-labelledby="tab-settings"
          >
            <div className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #00f5ff 50%, transparent)' }}
            />

            <form onSubmit={(e) => e.preventDefault()} className="p-8 flex flex-col gap-7">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-neon-cyan" />
                <h2 className="text-base font-bold text-text-primary">Cài Đặt Tài Khoản</h2>
              </div>

              <div className="border-t border-cyber-border" />

              {/* ── Email (read-only) ────────────────── */}
              <div className="flex flex-col gap-2">
                <FieldLabel icon={<Mail size={12} />}>Địa Chỉ Email</FieldLabel>
                <div className="relative">
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    disabled
                    readOnly
                    aria-label="Địa chỉ email (chỉ đọc)"
                    className={`${INPUT_BASE} pr-24 cursor-not-allowed opacity-60`}
                    style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-text-muted/50 font-mono bg-cyber-surface border border-cyber-border px-1.5 py-0.5 rounded tracking-widest">
                    CHỈ ĐỌC
                  </span>
                </div>
                <p className="text-[11px] text-text-muted/60">
                  Email được liên kết với tài khoản đăng nhập và không thể thay đổi tại đây.
                </p>
              </div>

              {/* ── Display Name ──────────────────── */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <FieldLabel icon={<User size={12} />}>Tên Hiển Thị</FieldLabel>
                  {/* Character counter — amber warning zone at ≥25, red at max */}
                  <span
                    className={`text-[11px] font-mono tabular-nums transition-colors duration-150 ${
                      nameValue.length >= NAME_MAX
                        ? 'text-red-400'
                        : nameValue.length >= 25
                        ? 'text-amber-400'
                        : 'text-text-muted/50'
                    }`}
                    aria-live="polite"
                  >
                    {nameValue.length}/{NAME_MAX}
                  </span>
                </div>
                <input
                  id="profile-full-name"
                  name="full_name"
                  type="text"
                  value={nameValue}
                  maxLength={NAME_MAX}
                  placeholder="e.g. cyber_hunter_99"
                  required
                  disabled={isSaving}
                  aria-label="Display name"
                  aria-describedby="full-name-hint"
                  aria-invalid={showNameError}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    setNameDirty(true);
                  }}
                  onBlur={() => setNameDirty(true)}
                  className={`${INPUT_BASE} transition-all duration-200 ${
                    showNameError
                      ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                      : nameValidation.valid && nameDirty
                      ? 'border-emerald-500/50 focus:border-emerald-500/70 focus:ring-emerald-500/15'
                      : ''
                  }`}
                  style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
                />
                {/* Live validation feedback */}
                {showNameError ? (
                  <p
                    id="full-name-hint"
                    role="alert"
                    className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono"
                  >
                    <AlertTriangle size={11} className="shrink-0" />
                    {nameValidation.valid ? '' : nameValidation.message}
                  </p>
                ) : nameValidation.valid && nameDirty ? (
                  <p
                    id="full-name-hint"
                    className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono"
                  >
                    <CheckCircle2 size={11} className="shrink-0" />
                    Hợp lệ!
                  </p>
                ) : (
                  <p id="full-name-hint" className="text-[11px] text-text-muted/60">
                    3–30 ký tự · chỉ chữ cái, số, dấu gạch dưới và khoảng trắng.
                  </p>
                )}
              </div>


              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className={`${LABEL_BASE}`}>
                    <ImagePlus size={12} />
                    Ảnh đại diện
                  </span>
                  {uploadState.phase === 'done' && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Đã tải lên
                    </span>
                  )}
                  {uploadState.phase === 'validating' && (
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" /> Đang kiểm tra…
                    </span>
                  )}
                  {uploadState.phase === 'stripping' && (
                    <span className="text-[11px] font-mono text-violet-400 flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" /> Đang xóa EXIF…
                    </span>
                  )}
                  {uploadState.phase === 'uploading' && (
                    <span className="text-[11px] font-mono text-neon-cyan flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" /> Đang tải lên…
                    </span>
                  )}
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`
                    relative flex items-center gap-4 rounded-xl border-2 border-dashed p-4
                    transition-all duration-200 cursor-pointer group
                    ${
                      isUploading
                        ? 'border-neon-cyan/40 bg-neon-cyan/5 cursor-wait'
                        : uploadState.phase === 'error'
                        ? 'border-red-500/50 bg-red-950/20'
                        : uploadState.phase === 'done'
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-cyber-border hover:border-neon-cyan/40 hover:bg-neon-cyan/5'
                    }
                  `}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  role="button"
                  aria-label="Chọn ảnh đại diện"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  {/* Avatar preview thumbnail */}
                  <div className="w-16 h-16 rounded-full ring-2 ring-cyber-border overflow-hidden flex items-center justify-center bg-cyber-dark shrink-0">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={(e) => {
                          // Hide the broken image and reveal the fallback letter.
                          e.currentTarget.style.display = 'none';
                          const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (sibling) sibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      className="text-xl font-bold text-neon-cyan font-mono"
                      style={{ display: avatarPreview ? 'none' : 'flex' }}
                    >
                      {avatarFallback}
                    </span>
                  </div>

                  {/* Upload prompt text */}
                  <div className="flex-1 min-w-0">
                    {isUploading ? (
                      <div className="flex flex-col gap-1.5">
                        <p className={`text-xs font-mono ${
                          uploadState.phase === 'validating' ? 'text-amber-400' :
                          uploadState.phase === 'stripping'  ? 'text-violet-400' :
                          'text-neon-cyan'
                        }`}>
                          {uploadState.phase === 'validating' ? 'Đang kiểm tra chữ ký file…' :
                           uploadState.phase === 'stripping'  ? 'Đang xóa dữ liệu EXIF / GPS…' :
                           'Đang tải lên…'}
                        </p>
                        {/* 3-color progress bar: amber=validating, violet=stripping, cyan=uploading */}
                        <div className="h-1 w-full rounded-full bg-cyber-border overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              uploadState.phase === 'validating' ? 'bg-amber-400  w-full animate-pulse' :
                              uploadState.phase === 'stripping'  ? 'bg-violet-400 w-full animate-pulse' :
                              'bg-neon-cyan'
                            }`}
                            style={uploadState.phase === 'uploading' ? { width: `${uploadState.progress}%` } : undefined}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-text-primary font-medium">
                          {uploadState.phase === 'done'
                            ? 'Ảnh đã sẵn sàng — nhấn Lưu để áp dụng'
                            : 'Nhấn để chọn hoặc kéo thả ảnh vào đây'}
                        </p>
                        <p className="text-[11px] text-text-muted/60 mt-0.5">
                          JPEG, PNG, WEBP · Tối đa 2 MB
                        </p>
                      </>
                    )}
                  </div>

                  {/* Upload icon / action */}
                  {!isUploading && (
                    <div className="shrink-0 flex gap-1.5">
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-xs font-mono font-semibold
                          group-hover:bg-neon-cyan/20 transition-colors duration-150"
                      >
                        <Upload size={12} />
                        {uploadState.phase === 'done' ? 'Đổi' : 'Chọn'}
                      </div>
                      {(avatarPreview || uploadState.phase === 'done') && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                          className="flex items-center px-2 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-950/40 transition-colors duration-150"
                          aria-label="Xóa ảnh đại diện"
                          title="Xóa ảnh"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  id="profile-avatar-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleInputChange}
                  disabled={isUploading || isSaving}
                  aria-label="Tải ảnh đại diện lên"
                />

                {/* Hidden field carrying the resolved CDN URL to the Server Action */}
                <input type="hidden" name="avatar_url" value={uploadedUrl} />

                {/* Signal to Server Action that the user explicitly deleted their avatar.
                    Only present in the FormData when delete was requested. */}
                {avatarDeleted && (
                  <input type="hidden" name="delete_avatar" value="1" />
                )}

                {/* Upload error message */}
                {uploadState.phase === 'error' && (
                  <p role="alert" className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono">
                    <AlertTriangle size={11} className="shrink-0" />
                    {uploadState.message}
                  </p>
                )}
              </div>

              {/* Removed state toast, using alert instead */}

              {/* ── Save button ──────────────────────────────── */}
              <button
                id="profile-save-btn"
                type="button"
                onClick={handleSaveChanges}
                disabled={!canSave}
                aria-disabled={!canSave}
                className="relative w-full rounded-lg px-6 py-3 font-bold text-sm bg-neon-cyan text-cyber-black hover:bg-neon-cyan-dim disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-surface overflow-hidden group"
                style={{ boxShadow: canSave ? '0 0 20px rgba(0,245,255,0.20)' : 'none' }}
              >
                <span
                  className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12 pointer-events-none"
                  aria-hidden="true"
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isSaving ? (
                    <><Loader2 size={15} className="animate-spin" />Đang lưu…</>
                  ) : isUploading ? (
                    <><Loader2 size={15} className="animate-spin" />Đang tải ảnh…</>
                  ) : !nameValidation.valid ? (
                    <><AlertTriangle size={15} />Sửa lỗi để tiếp tục</>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* ── Tab 2: Lịch Sử Mua Hàng ─────────────────────────── */}
        {activeTab === 'orders' && (
          <div
            className="relative rounded-2xl border border-cyber-border bg-cyber-surface overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(191,95,255,0.06), 0 20px 40px -10px rgba(0,0,0,0.5)' }}
            role="tabpanel"
            aria-labelledby="tab-orders"
          >
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #bf5fff 50%, transparent)' }}
            />

            <div className="p-8 flex flex-col gap-6">

              {/* ── Header ── */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-neon-purple" />
                  <h2 className="text-base font-bold text-text-primary">Lịch Sử Mua Hàng</h2>
                </div>
                <span className="text-xs font-mono text-text-muted/60 border border-cyber-border rounded px-2 py-0.5">
                  {purchases.length} đơn
                </span>
              </div>

              <div className="border-t border-cyber-border" />

              {/* ── Empty state ── */}
              {purchases.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <ShoppingBag size={40} className="text-cyber-border" />
                  <div>
                    <p className="font-mono text-sm text-text-muted">
                      Bạn chưa mua sản phẩm nào.
                    </p>
                    <p className="font-mono text-xs text-text-muted/50 mt-1">
                      Khám phá cửa hàng để tìm tài khoản game phù hợp!
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="
                      mt-2 inline-flex items-center gap-2 rounded-lg border px-4 py-2
                      font-mono text-xs uppercase tracking-wider
                      border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5
                      hover:bg-neon-cyan/10 hover:border-neon-cyan/60
                      transition-all duration-200
                    "
                  >
                    <ShoppingBag size={13} />
                    Đi mua sắm ngay
                  </Link>
                </div>
              ) : (
                /* ── Orders table ── */
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm border-collapse min-w-[540px]">
                    <thead>
                      <tr className="text-left">
                        {['Mã Đơn', 'Ngày Mua', 'Sản Phẩm', 'Tổng Tiền', 'Trạng Thái'].map((h) => (
                          <th
                            key={h}
                            className="px-3 pb-3 text-[11px] font-semibold text-text-muted/70 uppercase tracking-widest whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border/50">
                      {purchases.map((purchase) => (
                        <tr
                          key={purchase.id}
                          className="group transition-colors hover:bg-cyber-dark/40"
                        >
                          {/* Mã đơn — first 8 chars of UUID */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className="font-mono text-neon-cyan text-xs">
                              #{purchase.id.slice(0, 8).toUpperCase()}
                            </span>
                          </td>

                          {/* Ngày mua */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
                              <CalendarDays size={11} className="opacity-60" />
                              {formatDate(purchase.purchased_at)}
                            </span>
                          </td>

                          {/* Sản phẩm — link to game detail */}
                          <td className="px-3 py-4">
                            {purchase.item ? (
                              <Link
                                href={`/game/${purchase.item.id}`}
                                className="group/link flex flex-col"
                              >
                                <span className="flex items-center gap-1.5 text-text-primary font-medium leading-snug group-hover/link:text-neon-cyan transition-colors duration-150">
                                  {purchase.item.title}
                                  <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-60 transition-opacity" />
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-text-muted/70 mt-0.5">
                                  <Tag size={10} className="opacity-60" />
                                  Tài khoản game
                                </span>
                              </Link>
                            ) : (
                              <span className="text-text-muted/50 italic text-xs">
                                Sản phẩm không còn tồn tại
                              </span>
                            )}
                          </td>

                          {/* Tổng tiền — VND */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className="font-mono font-semibold text-text-primary">
                              {purchase.item ? formatVND(purchase.item.price) : '—'}
                            </span>
                          </td>

                          {/* Trạng thái — always "Đã giao" for completed purchases */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold font-mono bg-emerald-950/70 text-emerald-400 border-emerald-500/30">
                              <PackageCheck size={11} />
                              Đã giao
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Summary row ── */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-cyber-border/60 bg-cyber-dark/60 px-5 py-4 mt-2">
                <div className="flex items-center gap-2 text-xs text-text-muted/70 font-mono">
                  <ShieldCheck size={13} className="text-neon-cyan/60" />
                  Mọi giao dịch đều được mã hóa và lưu trữ an toàn.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-muted/60 font-mono">Tổng tiền đã tiêu:</span>
                  <span className="font-bold font-mono text-neon-cyan">
                    {formatVND(purchases.reduce((sum, p) => sum + (p.item?.price ?? 0), 0))}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* ── Footer note ──────────────────────────────────────── */}
        <p className="mt-6 text-center text-[11px] text-text-muted/40 font-mono">
          Mọi thay đổi hồ sơ được xác thực phía server · Liên kết phiên · Không bao giờ tin tưởng client
        </p>
      </div>

      {/* Cyberpunk Toast Notification */}
      {toastMsg && (
          <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-md border backdrop-blur-md transition-all duration-300 z-50 flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${toastMsg.type === 'success' ? 'bg-black/80 border-cyan-500 text-cyan-400' : 'bg-black/80 border-red-500 text-red-400'}`}>
              <span className="font-mono text-sm tracking-wider">{toastMsg.text}</span>
          </div>
      )}
    </div>
  );
}
