import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise, {
  DB_NAME,
  fetchFullUserRole,
  updateLastLogin,
  USERS_COLLECTION,
} from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, { databaseName: DB_NAME }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        const defaultRoleNames = ["USER"];

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date().toString(),
          lastLoginAt: new Date().toString(),
          roles: defaultRoleNames,
          status: "ACTIVE",
          isEmailVerified: true,
          provider: "google",
        };
      },
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "e-mail" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid input");
        }

        const client = await clientPromise;
        const usersCollection = client.db(DB_NAME).collection(USERS_COLLECTION);

        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account is not active");
        }
        const fullRoles = await fetchFullUserRole(user.roles);
        await updateLastLogin(user._id.toString());

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(), // Update last login time
          provider: "credentials",
          roles: fullRoles,
          image: user.image,
          isEmailVerified: user.isEmailVerified || false,
          status: user.status,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /* async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await findUserWithEmail(user.email!);

        if (!existingUser) {
          user.role = "user";
          user.roles = ["USER"];
          user.status = "ACTIVE";
          user.isEmailVerified = true;
        } else {
          user.role = existingUser.role;
          user.roles = [existingUser.role];
          user.status = existingUser.status;
          user.isEmailVerified = existingUser.isEmailVerified;
        }
      }
      return true;
    }, */
    async jwt({ token, user }) {
      // console.log("jwt callback ---------> ", token, user);
      if (user) {
        // Spread all user fields, ensuring only full Role objects are used
        return {
          ...token,
          ...user,
        };
      }

      // For existing sessions, ensure roles are up to date
      if (
        token.roles &&
        token.roles.length > 0 &&
        token.roles.some((r) => typeof r === "string")
      ) {
        const updatedRoles = await fetchFullUserRole(token.roles);

        return {
          ...token,
          roles: updatedRoles.filter((role) => role !== null),
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Spread token properties, ensuring only full Role objects are used
        session.user = {
          ...session.user,
          id: token.id,
          name: token.name,
          email: token.email,
          createdAt: token.createdAt,
          lastLoginAt: token.lastLoginAt,
          provider: token.provider,
          roles: token.roles,
          image: token.image,
          isEmailVerified: token.isEmailVerified,
          status: token.status,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect URLs
      if (url.startsWith("/")) {
        // For relative URLs, prefix with base URL
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        // Allow redirects to same origin
        return url;
      }
      // Default to base URL
      return baseUrl;
    },
  },
  events: {
    async signIn(message) {
      await updateLastLogin(message.user.id!);
      console.log("evens ----> Sign in successful", message);
    },
    async signOut(message) {
      console.log("evens ----> Sign out successful", message);
    },
    async createUser(message) {
      await updateLastLogin(message.user.id!);
      console.log("evens ----> User created", message);
    },
  },
  pages: {
    signIn: "/auth/signIn",
    signOut: "/auth/signOut",
    error: "/auth/error",
    verifyRequest: "/auth/verifyRequest",
    newUser: "/auth/newUser",
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth Debug:", code, metadata);
    },
  },
};
