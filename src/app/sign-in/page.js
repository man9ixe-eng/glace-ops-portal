import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInClient from "./sign-in.client";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  const discordLinked = !!session?.user?.discordId;
  const robloxLinked = !!session?.user?.robloxUserId;

  return <SignInClient discordLinked={discordLinked} robloxLinked={robloxLinked} />;
}