import { Zap, ShieldCheck, Lock, type LucideIcon } from "lucide-react";

// All hover classes are written out in full so Tailwind JIT can detect them statically.
interface TrustCard {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Tailwind classes applied to the outer card div */
  cardHover: string;
  /** Tailwind classes applied to the icon wrapper div */
  iconBox: string;
  /** Tailwind classes for the icon itself */
  iconClass: string;
  /** Tailwind classes for the top-right corner accent */
  accentClass: string;
}

const TRUST_CARDS: TrustCard[] = [
  {
    id: "trust-delivery",
    icon: Zap,
    title: "Instant Delivery",
    subtitle: "Auto-sent to your email within seconds",
    cardHover:
      "hover:border-[#f5e642] hover:-translate-y-[3px] hover:shadow-[0_0_24px_rgba(245,230,66,0.35)]",
    iconBox:
      "border-[#f5e642] shadow-[0_0_12px_rgba(245,230,66,0.35)]",
    iconClass:
      "text-[#f5e642] drop-shadow-[0_0_6px_#f5e642]",
    accentClass:
      "bg-gradient-to-br from-transparent to-[rgba(245,230,66,0.13)]",
  },
  {
    id: "trust-warranty",
    icon: ShieldCheck,
    title: "Lifetime Warranty",
    subtitle: "100% anti-reclaim guarantee on every account",
    cardHover:
      "hover:border-[var(--color-neon-cyan)] hover:-translate-y-[3px] hover:shadow-[0_0_24px_rgba(0,245,255,0.35)]",
    iconBox:
      "border-[var(--color-neon-cyan)] shadow-[0_0_12px_rgba(0,245,255,0.35)]",
    iconClass:
      "text-[var(--color-neon-cyan)] drop-shadow-[0_0_6px_var(--color-neon-cyan)]",
    accentClass:
      "bg-gradient-to-br from-transparent to-[rgba(0,245,255,0.13)]",
  },
  {
    id: "trust-escrow",
    icon: Lock,
    title: "Secure Escrow",
    subtitle: "Safe and encrypted payments, always",
    cardHover:
      "hover:border-[var(--color-neon-magenta)] hover:-translate-y-[3px] hover:shadow-[0_0_24px_rgba(255,0,255,0.35)]",
    iconBox:
      "border-[var(--color-neon-magenta)] shadow-[0_0_12px_rgba(255,0,255,0.35)]",
    iconClass:
      "text-[var(--color-neon-magenta)] drop-shadow-[0_0_6px_var(--color-neon-magenta)]",
    accentClass:
      "bg-gradient-to-br from-transparent to-[rgba(255,0,255,0.13)]",
  },
];

export default function TrustIndicators() {
  return (
    <section className="mx-auto w-full max-w-7xl mt-32 px-4 pb-16 md:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TRUST_CARDS.map(({ id, icon: Icon, title, subtitle, cardHover, iconBox, iconClass, accentClass }) => (
          <div
            key={id}
            id={id}
            className={`
              group relative flex flex-col items-center gap-4 rounded-xl border
              border-white/[0.08] p-6 text-center
              bg-black/40 backdrop-blur-md
              transition-all duration-300
              md:items-start md:text-left
              ${cardHover}
            `}
          >
            {/* Icon wrapper */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-black/50 ${iconBox}`}
            >
              <Icon size={22} className={iconClass} aria-hidden="true" />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1">
              <h3
                className="font-mono text-base font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {title}
              </h3>
              <p
                className="font-mono text-sm leading-relaxed"
                style={{ color: "var(--color-text-muted)" }}
              >
                {subtitle}
              </p>
            </div>

            {/* Corner accent — fades in on group-hover */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute right-0 top-0 h-8 w-8 rounded-tr-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accentClass}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
