import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package2 } from "lucide-react";

export default async function PurchaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30">
      <header className="border-b border-emerald-100/60 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/purchase" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package2 className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Purchase</div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Upload & submit batches
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {session?.user?.name}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">
                Purchase
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirect: true, redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}