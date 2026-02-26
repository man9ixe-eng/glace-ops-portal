import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInButtons from "./SignInButtons";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  const discordLinked = !!session?.user?.discordId;
  const robloxLinked = !!session?.user?.robloxUserId;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <SignInButtons discordLinked={discordLinked} robloxLinked={robloxLinked} />
    </main>
  );
}