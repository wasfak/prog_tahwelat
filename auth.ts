import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await dbConnect();

        const user = await User.findOne({
          username: credentials.username as string,
        }).lean<{
          _id: Types.ObjectId;
          username: string;
          passwordHash: string;
          role: "admin" | "auditor" | "branch" | "purchase";
          branchId: Types.ObjectId | null;
        }>();

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          role: user.role,
          branchId: user.branchId ? user.branchId.toString() : null,
        };
      },
    }),
  ],
});
