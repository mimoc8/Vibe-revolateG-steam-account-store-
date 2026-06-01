import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-24 text-center md:px-8 md:py-32"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,245,255,0.08) 0%, transparent 70%), var(--color-cyber-black)",
      }}
    >
      {/* Grid overlay */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      {/* Ambient glow — top cyan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-15 md:h-[700px] md:w-[700px]"
        style={{ background: "radial-gradient(circle, var(--color-neon-cyan) 0%, transparent 65%)" }}
      />

      {/* Ambient glow — bottom-right magenta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-[350px] w-[350px] rounded-full opacity-10 md:h-[500px] md:w-[500px]"
        style={{ background: "radial-gradient(circle, var(--color-neon-magenta) 0%, transparent 65%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Eyebrow badge */}
        <span
          className="inline-block rounded-full border px-4 py-1 font-mono text-xs uppercase tracking-widest"
          style={{
            borderColor: "var(--color-neon-cyan)",
            color: "var(--color-neon-cyan)",
            background: "rgba(0,245,255,0.07)",
          }}
        >
          #1 Cybernetic Marketplace
        </span>

        {/* Headline */}
        <h1
          className="max-w-4xl font-mono text-4xl font-black leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          The Ultimate{" "}
          <span
            className="flicker"
            style={{
              color: "var(--color-neon-cyan)",
              textShadow:
                "0 0 10px var(--color-neon-cyan), 0 0 40px var(--color-neon-cyan-dim), 0 0 80px rgba(0,245,255,0.3)",
            }}
          >
            Cybernetic
          </span>{" "}
          <br className="hidden sm:block" />
          Account Market
        </h1>

        {/* Subtitle */}
        <p className="max-w-md font-mono text-base sm:text-lg" style={{ color: "var(--color-text-muted)" }}>
          Secure.&nbsp; Instant.&nbsp; Dominate the game.
        </p>

        {/* ── CTA Button — pure CSS hover via Tailwind ── */}
        <Link
          href="/accounts"
          id="hero-cta"
          className="
            mt-2 inline-flex items-center gap-2 rounded-md px-8 py-3
            font-mono text-sm font-bold uppercase tracking-widest
            bg-[var(--color-neon-cyan)] text-[var(--color-cyber-black)]
            shadow-[0_0_20px_var(--color-neon-cyan),0_0_40px_rgba(0,245,255,0.35)]
            transition-all duration-200
            hover:scale-105
            hover:bg-[#1afcff]
            hover:shadow-[0_0_30px_var(--color-neon-cyan),0_0_70px_rgba(0,245,255,0.55)]
          "
        >
          Explore Accounts
        </Link>
      </div>

      {/* Bottom fade to black */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-full"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-cyber-black))" }}
      />
    </section>
  );
}
