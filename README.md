# 🌌 RevolateG — Premium Game Account Marketplace

![RevolateG Banner](https://via.placeholder.com/1200x400/0d0d14/6366f1?text=RevolateG+-+Premium+Game+Account+Marketplace)

**RevolateG** is a modern, high-performance, and secure e-commerce platform built specifically for trading and managing premium game accounts (Steam, Epic Games, etc.). The platform features a highly polished user interface with an elegant Indigo theme, ensuring a professional and refined user experience.

Built entirely with the bleeding-edge Next.js 15 App Router, React 19, and Supabase.

---

## ✨ Key Features

- **Modern & Premium UI:** Sophisticated dark mode with elegant Indigo accents, powered by Tailwind CSS v4.
- **Isolated Admin Dashboard:** An independent, highly-secure admin portal protected by separate HTTP-only cookies (bypassing the standard customer auth flow) to ensure absolute security.
- **Real-time Product Grid:** Seamless, lightning-fast game browsing with built-in carousels, responsive layouts, and beautifully crafted components.
- **Robust Authentication:** Powered by Supabase Auth (OAuth & Email/Password) with real-time UI synchronization across tabs.
- **Next.js Server Actions:** 100% server-side business logic and data mutations for maximum security and zero client-side payload bloat.
- **Cart & Transaction Management:** Comprehensive user transaction history and cart persistence.
- **Optimized Performance:** Extensive use of SSR (Server-Side Rendering) and React Server Components.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **State Management:** React Hooks & Server Actions
- **Validation:** [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18 or higher) and npm/yarn/pnpm installed. You also need a [Supabase](https://supabase.com/) project.

### 1. Clone the repository

```bash
git clone https://github.com/mimoc8/Vibe-revolateG-steam-account-store-.git
cd Vibe-revolateG-steam-account-store-
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root of your project and populate it with your Supabase credentials and Admin configs:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Independent Admin Dashboard Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=revolateg2026
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the main storefront.
Open [http://localhost:3000/cyber-core-xyz/login](http://localhost:3000/cyber-core-xyz/login) to access the isolated Admin Dashboard.

---

## 🛡️ Architecture & Security

- **Client/Server Boundaries:** Strict adherence to Server Components by default. Interactivity is delegated to minimal Client Components.
- **Row Level Security (RLS):** All database interactions respect Supabase RLS policies.
- **Data Validation:** All user inputs and API responses are aggressively typed and validated through Zod before reaching the database.
- **Isolated Admin Auth:** The admin portal utilizes completely separate state management (cookies) preventing any session hijacking or privilege escalation from regular user accounts.

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Designed and engineered for maximum Vibe and performance.*
