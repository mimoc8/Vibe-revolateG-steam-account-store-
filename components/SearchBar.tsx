'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, Gamepad2, X } from 'lucide-react';
import { searchGames, type SearchResult } from '@/actions/search';

/* ── VND formatter ── */
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatVND = (n: number) => vnd.format(n);

const FALLBACK_IMG =
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg';

interface SearchBarProps {
  /** Extra className applied to the outermost wrapper */
  className?: string;
  placeholder?: string;
}

/* ════════════════════════════════════════════════════════════════
   SearchBar — real-time autocomplete with debounce + click-outside
════════════════════════════════════════════════════════════════ */
export default function SearchBar({
  className = '',
  placeholder = 'Tìm kiếm tài khoản, game, thể loại...',
}: SearchBarProps) {
  const router = useRouter();
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen,    setIsOpen]    = useState(false);
  // Track which result is keyboard-focused (-1 = none)
  const [activeIdx, setActiveIdx] = useState(-1);

  /* ── Click-outside: close dropdown ──────────────────────── */
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  /* ── Debounced search ────────────────────────────────────── */
  useEffect(() => {
    const trimmed = query.trim();

    // Immediately hide dropdown for short queries
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      const data = await searchGames(trimmed);
      setResults(data);
      setIsLoading(false);
      setActiveIdx(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  /* ── Keyboard navigation ─────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && results[activeIdx]) {
          router.push(`/game/${results[activeIdx].id}`);
          closeDropdown();
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
        inputRef.current?.blur();
      }
    },
    [isOpen, results, activeIdx, router],
  );

  function closeDropdown() {
    setIsOpen(false);
    setActiveIdx(-1);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  }

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>

      {/* ── Input field ─────────────────────────────────────── */}
      <div className="relative">
        {/* Search icon */}
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
          style={{
            color: showDropdown
              ? 'var(--color-neon-cyan)'
              : 'var(--color-text-muted)',
          }}
          size={15}
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          id="nav-search"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          aria-label="Tìm kiếm sản phẩm"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          aria-controls="search-listbox"
          aria-activedescendant={
            activeIdx >= 0 ? `search-result-${activeIdx}` : undefined
          }
          className="
            w-full rounded-md border py-2 pl-9 pr-8
            font-mono text-sm outline-none
            bg-[var(--color-cyber-surface)]
            border-[var(--color-cyber-border)]
            text-[var(--color-text-primary)]
            placeholder:font-mono placeholder:text-[var(--color-text-muted)]
            transition-all duration-200
            focus:border-[var(--color-neon-cyan)]
            focus:shadow-[0_0_0_2px_rgba(0,245,255,0.12),0_0_16px_rgba(0,245,255,0.15)]
          "
        />

        {/* Clear button — visible when query is non-empty */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Xóa tìm kiếm"
            className="
              absolute right-2.5 top-1/2 -translate-y-1/2
              rounded-sm p-0.5
              text-[var(--color-text-muted)]
              transition-colors duration-150
              hover:text-[var(--color-neon-cyan)]
            "
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          DROPDOWN
      ══════════════════════════════════════════════════════ */}
      {showDropdown && (
        <div
          id="search-listbox"
          role="listbox"
          aria-label="Kết quả tìm kiếm"
          className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden"
          style={{
            borderRadius: '6px',
            border: '1px solid rgba(0,245,255,0.2)',
            background: 'rgba(8,11,18,0.97)',
            boxShadow: `
              0 0 0 1px rgba(0,245,255,0.05),
              0 0 20px rgba(0,245,255,0.08),
              0 16px 40px rgba(0,0,0,0.7)
            `,
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Top scan line */}
          <div
            className="h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,245,255,0.6) 50%, transparent)',
            }}
          />

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center gap-2.5 px-4 py-3.5">
              <Loader2
                size={14}
                className="animate-spin shrink-0"
                style={{ color: 'var(--color-neon-cyan)' }}
                aria-hidden="true"
              />
              <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Đang tìm kiếm...
              </span>
            </div>
          )}

          {/* ── Empty state ── */}
          {!isLoading && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
              <Gamepad2
                size={24}
                aria-hidden="true"
                style={{ color: 'var(--color-cyber-border)' }}
              />
              <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Không tìm thấy sản phẩm nào
              </p>
              <p
                className="font-mono text-[10px]"
                style={{ color: 'rgba(107,107,138,0.6)' }}
              >
                Thử tìm với từ khóa khác
              </p>
            </div>
          )}

          {/* ── Results ── */}
          {!isLoading && results.length > 0 && (
            <ul className="py-1">
              {results.map((item, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <li
                    key={item.id}
                    id={`search-result-${idx}`}
                    role="option"
                    aria-selected={isActive}
                  >
                    <Link
                      href={`/game/${item.id}`}
                      onClick={closeDropdown}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className="flex items-center gap-3 px-3 py-2.5 transition-all duration-100"
                      style={{
                        background: isActive
                          ? 'rgba(0,245,255,0.07)'
                          : 'transparent',
                        borderLeft: isActive
                          ? '2px solid var(--color-neon-cyan)'
                          : '2px solid transparent',
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="shrink-0 overflow-hidden"
                        style={{
                          width: 48,
                          height: 32,
                          borderRadius: '3px',
                          border: '1px solid rgba(0,245,255,0.1)',
                          background: 'rgba(0,245,255,0.04)',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url ?? FALLBACK_IMG}
                          alt=""
                          aria-hidden="true"
                          width={48}
                          height={32}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                          }}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span
                          className="truncate font-mono text-xs font-semibold leading-snug transition-colors duration-100"
                          style={{
                            color: isActive
                              ? 'var(--color-neon-cyan)'
                              : 'var(--color-text-primary)',
                          }}
                        >
                          {item.title}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <span
                            className="truncate font-mono text-[10px]"
                            style={{ color: 'rgba(107,107,138,0.8)' }}
                          >
                            {item.tags.slice(0, 2).join(' · ')}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <span
                        className="shrink-0 font-mono text-xs font-bold"
                        style={{
                          color: isActive
                            ? 'var(--color-neon-cyan)'
                            : 'rgba(0,245,255,0.7)',
                          textShadow: isActive
                            ? '0 0 10px rgba(0,245,255,0.5)'
                            : 'none',
                        }}
                      >
                        {formatVND(item.price)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer hint */}
          {!isLoading && results.length > 0 && (
            <div
              className="flex items-center justify-between border-t px-3 py-2"
              style={{ borderColor: 'rgba(0,245,255,0.08)' }}
            >
              <span
                className="font-mono text-[10px]"
                style={{ color: 'rgba(107,107,138,0.5)' }}
              >
                {results.length} kết quả
              </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: 'rgba(107,107,138,0.5)' }}
              >
                ↑↓ để chọn · Enter để mở · Esc để đóng
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
