import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { db } from "@/server/db";

export const isGoogleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

// While Google sign-in is not configured, the entry buttons sign in as fixed test accounts.
// Never available in production, whatever the environment variable says.
export const isTestLoginEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.ENABLE_TEST_LOGIN === "true";

export const TEST_LOGIN_PROVIDER = "test-login";

export type TestAccountKind = "participant" | "admin";

const testAccounts: Record<TestAccountKind, { email: string; name: string }> = {
  participant: { email: "participante@teste.local", name: "Rider de Teste" },
  admin: { email: "admin@teste.local", name: "Admin de Teste" },
};

const providers: Provider[] = [];

if (isGoogleConfigured) providers.push(Google);

if (isTestLoginEnabled) {
  providers.push(
    Credentials({
      id: TEST_LOGIN_PROVIDER,
      name: "Login de teste",
      credentials: { kind: {} },
      async authorize(credentials) {
        const isKnownKind = credentials.kind === "participant" || credentials.kind === "admin";

        if (!isKnownKind) return null;

        const account = testAccounts[credentials.kind as TestAccountKind];
        const user = await db.user.upsert({
          where: { email: account.email },
          update: {},
          create: account,
        });

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  );
}

export const canSignIn = isGoogleConfigured || isTestLoginEnabled;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // The credentials provider used by the test login only works with JWT sessions.
  // Access state is read from the database on every request, never from the token.
  session: { strategy: "jwt" },
  providers,
  pages: { signIn: "/" },
  trustHost: true,
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;

      return session;
    },
  },
});
