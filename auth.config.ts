import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [], // providers added in auth.ts only
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (
          user as { id?: string; role?: string; branchId?: string }
        ).id!;
        token.role = (user as { id?: string; role?: string; branchId?: string })
          .role as "admin" | "auditor" | "branch" | "purchase";
        token.branchId =
          (user as { id?: string; role?: string; branchId?: string })
            .branchId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as
        | "admin"
        | "auditor"
        | "branch"
        | "purchase";
      session.user.branchId = token.branchId as string | null;
      return session;
    },
  },
} satisfies NextAuthConfig;
