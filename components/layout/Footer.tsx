import Link from "next/link";

const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "About CyberSteam",
    links: [
      { label: "How It Works", href: "/about" },
      { label: "Verified Sellers", href: "/verified" },
      { label: "Security Promise", href: "/security" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Report an Issue", href: "/report" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Refund Policy", href: "/refunds" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-cyber-dark)" }}>

      {/* Neon top glow line */}
      <div
        aria-hidden="true"
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-neon-cyan-dim), transparent)",
          boxShadow: "0 0 12px var(--color-neon-cyan-dim)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">

        {/* ── Link columns ── */}
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <h3
                className="mb-4 font-mono text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--color-neon-cyan)" }}
              >
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="
                        font-mono text-sm
                        text-[var(--color-text-muted)]
                        transition-all duration-150
                        hover:text-[var(--color-neon-cyan)]
                        hover:drop-shadow-[0_0_8px_var(--color-neon-cyan-dim)]
                      "
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row"
          style={{ borderColor: "var(--color-cyber-border)" }}
        >
          {/* Logo */}
          <span
            className="font-mono text-base font-black tracking-tighter"
            style={{
              color: "var(--color-neon-cyan)",
              textShadow: "0 0 8px var(--color-neon-cyan-dim)",
            }}
          >
            CyberSteam
          </span>

          {/* Copyright */}
          <p
            className="text-center font-mono text-xs md:text-right"
            style={{ color: "var(--color-text-muted)" }}
          >
            &copy; 2026 CyberSteam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
