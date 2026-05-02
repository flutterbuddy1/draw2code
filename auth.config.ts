import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Empty array as we'll add it in auth.ts
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnProject = nextUrl.pathname.startsWith('/project');
      const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup';

      if (isOnDashboard || isOnProject) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  trustHost: true,
} satisfies NextAuthConfig;
