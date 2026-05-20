import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "admin" | "auditor" | "branch" | "purchase";
    branchId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "auditor" | "branch" | "purchase";
      branchId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "admin" | "auditor" | "branch" | "purchase";
    branchId: string | null;
  }
}