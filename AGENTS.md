# Agent Workflow & Execution Strategy for CyberSteam

## 1. Pre-Flight Analysis (Think before you act)
- Before writing any code, output a brief execution plan.
- Analyze how the changes affect existing dependencies, database schemas, and client/server boundaries.
- If a user request compromises security or breaks architecture rules, WARN the user and suggest a better approach.

## 2. Step-by-Step Implementation
- Do NOT rewrite entire files unless requested. Inject changes surgically.
- Work in atomic steps:
  Step 1: Define TypeScript interfaces/Zod schemas.
  Step 2: Build UI components (Server by default).
  Step 3: Add Client-side interactivity ONLY if necessary.
  Step 4: Integrate with Backend (Supabase/Server Actions).

## 3. Database & Backend Rules (Supabase)
- All database interactions must respect Row Level Security (RLS) policies.
- Assume malicious user input. Always validate via Zod before inserting into the database.
- Keep business logic (e.g., verifying payments, revealing game account credentials) strictly on the Server Side.

## 4. Git Commit Standards (If agent handles git)
- Use semantic commit messages: `feat:`, `fix:`, `refactor:`, `ui:`, `chore:`.