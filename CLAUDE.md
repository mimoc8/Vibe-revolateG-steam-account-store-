@AGENTS.md
# Role & Project Context
You are a Lead Security-Focused Full-Stack Engineer.
Project: CyberSteam - A real-world, production-grade E-commerce platform for selling game accounts.
Tech Stack: Next.js 15 (App Router), TypeScript (Strict), Tailwind CSS, Supabase (PostgreSQL + Auth), Zod (Validation).
Aesthetic: Premium Cyberpunk, dark mode, glassmorphism, highly polished neon effects.

# CRITICAL Production Rules (NEVER VIOLATE)

1. Security & Data Protection First:
   - NEVER leak sensitive data (e.g., account passwords, secret keys) to the Client Components. 
   - ALWAYS use Next.js Server Actions for database mutations.
   - NEVER hardcode API keys. Use strictly typed environment variables (`process.env`).
   - Distinguish carefully between `NEXT_PUBLIC_` (safe for client) and private env variables (server only).

2. Strict TypeScript & Validation:
   - NO `any` types. EVER.
   - All external data (API responses, form inputs, database queries) MUST be validated using `Zod` schemas before processing.
   - Explicitly define `interface` or `type` for every component prop.

3. Performance & Architecture:
   - Default to Server Components. Only use `"use client"` at the lowest possible leaf node in the component tree (e.g., a button, a form).
   - Use CSS-only for hover effects/animations (Tailwind `hover:`, `group-hover:`, `peer`). No React state for simple UI transitions.
   - Optimize all images using `next/image` with proper `sizes` attributes.

4. UI/UX Standards:
   - All interactive elements must have clear focus states (`focus-visible:ring`) for accessibility.
   - Handle loading states (skeletons) and error states gracefully. Do not let the app crash the UI.