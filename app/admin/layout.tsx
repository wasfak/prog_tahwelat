import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-bold text-lg">
              Admin
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/branches"
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Branches
              </Link>
              <Link
                href="/admin/users"
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Users
              </Link>
              <Link
                href="/admin/upload"
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Upload
              </Link>
              <Link
                href="/admin/batches"
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Batches
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirect: true,redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}