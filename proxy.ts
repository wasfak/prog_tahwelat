import { auth } from "@/auth.edge";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isLoginPage = nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL(`/${role}`, nextUrl));
  }

  const routeRole = nextUrl.pathname.split("/")[1]; // admin, auditor, branch, purchase
  const protectedRoles = ["admin", "auditor", "branch", "purchase"];

  if (protectedRoles.includes(routeRole) && role !== routeRole) {
    return NextResponse.redirect(new URL(`/${role}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
