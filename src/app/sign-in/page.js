import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInClient from "./SignInClient";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  const discordLinked = Boolean(session?.user?.discordId);
  const robloxLinked = Boolean(session?.user?.robloxUserId);

  return (
    <SignInClient
      discordLinked={discordLinked}
      robloxLinked={robloxLinked}
    />
  );
}