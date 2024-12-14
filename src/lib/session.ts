import { authOptions } from "@/config/auth";
import { getServerSession as getNextAuthServerSession } from "next-auth";

export async function getServerSession() {
  const session = await getNextAuthServerSession(authOptions);
  return session;
}

