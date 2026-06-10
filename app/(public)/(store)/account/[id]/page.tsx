export const runtime = 'edge';
import { notFound } from "next/navigation";
import { MOCK_DB } from "@/lib/data/accounts";
import AccountDetailView from "./AccountDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Next.js 15: params is a Promise — must be awaited
export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  const account = MOCK_DB[id];

  if (!account) {
    notFound();
  }

  return <AccountDetailView account={account} />;
}


