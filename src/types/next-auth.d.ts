import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    createdAt?: string;
    lastLoginAt?: string;
    provider?: string;
    roles?: Role[];
    isEmailVerified?: boolean;
    status?: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    createdAt?: string;
    lastLoginAt?: string;
    provider?: string;
    roles?: Role[];
    isEmailVerified?: boolean;
    status?: string;
  }
}
