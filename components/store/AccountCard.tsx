import type { Account } from "@/lib/types/store";
import Image from "next/image";
import Link from "next/link";

export default function AccountCard({ account }: { account: Account }) {
  const { id, title, price, badges, thumbnail } = account;

  return (
    <article
      className="
        group relative flex flex-col overflow-hidden rounded-xl
        border border-white/[0.07]
        bg-white/5 backdrop-blur-md
        transition-all duration-300
        hover:-translate-y-1
        hover:border-[var(--color-neon-cyan)]
        hover:shadow-[0_0_24px_rgba(0,245,255,0.12),0_8px_32px_rgba(0,0,0,0.4)]
      "
    >
      {/* ── Thumbnail ── */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark overlay so UI elements stay readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Price badge — top right */}
        <span
          className="
            absolute right-3 top-3 z-10 rounded-md px-2.5 py-1
            font-mono text-sm font-bold
            bg-black/60 backdrop-blur-sm
            border border-[var(--color-neon-cyan)]
            text-[var(--color-neon-cyan)]
            shadow-[0_0_10px_rgba(0,245,255,0.3)]
          "
        >
          {price}
        </span>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Title */}
        <h3
          className="line-clamp-2 font-mono text-sm font-bold leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge}
              className="
                rounded-full border px-2 py-0.5
                font-mono text-[10px] uppercase tracking-wider
                border-white/10 bg-white/5
                text-[var(--color-text-muted)]
              "
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <Link
          href={`/account/${id}`}
          className="
            mt-1 block w-full rounded-md border py-2 text-center
            font-mono text-xs font-semibold uppercase tracking-widest
            border-[var(--color-cyber-border)]
            text-[var(--color-text-muted)]
            bg-transparent
            transition-all duration-200
            hover:border-[var(--color-neon-cyan)]
            hover:text-[var(--color-neon-cyan)]
            hover:bg-[rgba(0,245,255,0.06)]
            hover:shadow-[0_0_12px_rgba(0,245,255,0.2)]
          "
        >
          View Details
        </Link>
      </div>

      {/* Corner accent on hover */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-0 top-0 h-10 w-10 rounded-tl-xl
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
          bg-gradient-to-br from-[rgba(0,245,255,0.15)] to-transparent
        "
      />
    </article>
  );
}
