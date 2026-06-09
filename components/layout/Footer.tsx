import Link from "next/link";

const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Về CyberSteam",
    links: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Hướng dẫn mua hàng", href: "/how-to-buy" },
      { label: "Chính sách bảo hành", href: "/warranty" },
    ],
  },
  {
    heading: "Hỗ trợ khách hàng",
    links: [
      { label: "Liên hệ hỗ trợ", href: "/contact" },
      { label: "Câu hỏi thường gặp", href: "/faq" },
    ],
  },
  {
    heading: "Pháp lý",
    links: [
      { label: "Điều khoản dịch vụ", href: "/terms" },
      { label: "Chính sách bảo mật", href: "/privacy" },
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
            className="font-sans text-base font-black tracking-tight text-white flex items-baseline"
          >
            Revolate<span className="text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-pink-500 font-serif italic text-lg ml-[1px]">G</span>
          </span>

          {/* Copyright */}
          <p
            className="text-center font-mono text-xs md:text-right"
            style={{ color: "var(--color-text-muted)" }}
          >
            &copy; 2026 RevolateG. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
