import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { dbConnect } from "@/lib/mongoose";
import { Branch } from "@/models";

export default async function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let branchName = "";
  if (session?.user?.branchId) {
    await dbConnect();
    const branch = await Branch.findById(session.user.branchId).lean<{
      name: string;
    } | null>();
    branchName = branch?.name ?? "";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/40 via-white to-cyan-50/30">
      <header className="border-b border-sky-100/60 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/branch" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Store className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">
                {branchName || "Branch"}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Incoming transfers
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {session?.user?.name}
              </div>
              <div className="text-[11px] text-sky-600 font-medium">Branch</div>
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
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
