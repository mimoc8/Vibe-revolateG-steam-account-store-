<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Behavior Guidelines for CyberSteam

## Workflow & Execution
1. Think Before You Code: Before writing or modifying any file, briefly output a 1-2 sentence plan of what you are going to do and which files you will touch.
2. Step-by-Step Focus: Do not attempt to build the entire app in one prompt. Focus ONLY on the specific component or section the user requests.
3. Non-Destructive Editing: When adding new sections to a page (like `page.tsx`), strictly preserve existing functional components (e.g., `<Navbar />`, `<Footer />`, `<HeroSection />`) unless explicitly told to modify or remove them.
4. Mock Data: Use highly realistic mock data (e.g., official Steam game cover URLs, real game genres) to populate UI components during the frontend phase.

## Directory Structure Rules
- `app/(store)/`: Client-facing storefront pages (Homepage, Product Details, Cart).
- `app/admin/`: Admin dashboard pages (do not parallel route with store).
- `components/layout/`: Global UI like Navbar and Footer.
- `components/home/`, `components/store/`: Feature-specific reusable UI blocks.
- `lib/`: Utility functions and upcoming Supabase database configurations.