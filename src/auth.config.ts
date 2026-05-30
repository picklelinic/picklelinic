import type { NextAuthConfig } from "next-auth";

/*
 * Edge-safe auth config (no DB / bcrypt imports here).
 * Used by middleware for route protection. The Credentials provider with
 * `authorize` (which needs Node APIs) is added in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId ?? null;
        token.teamId = user.teamId ?? null;
        token.isSecretary = user.isSecretary ?? false;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "manager" | "user";
        session.user.departmentId = (token.departmentId as number | null) ?? null;
        session.user.teamId = (token.teamId as number | null) ?? null;
        session.user.isSecretary = (token.isSecretary as boolean) ?? false;
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts
} satisfies NextAuthConfig;
