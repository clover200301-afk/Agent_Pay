import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";

export const oauthAvailability = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  apple: Boolean(process.env.APPLE_ID && process.env.APPLE_SECRET),
};

function userIdFor(provider: string, identifier: string) {
  // Stable, namespaced id without pulling crypto into the client bundle.
  // Good enough for client-side localStorage namespacing in a hackathon demo.
  let h = 5381;
  const seed = `${provider}::${identifier}`;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return `u_${(h >>> 0).toString(36)}`;
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "credentials",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize(credentials) {
      const email = String(credentials?.email ?? "").trim();
      const password = String(credentials?.password ?? "");
      if (!email.includes("@") || password.length < 4) return null;
      return {
        id: userIdFor("credentials", email),
        name: email.split("@")[0],
        email,
        image: null,
      };
    },
  }),
];

if (oauthAvailability.google) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

if (oauthAvailability.apple) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    })
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id ?? userIdFor(account?.provider ?? "unknown", user.email ?? "");
        token.provider = account?.provider ?? "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        (session.user as { provider?: string }).provider =
          (token.provider as string) ?? "credentials";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
