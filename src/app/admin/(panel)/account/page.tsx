import { getSession } from "@/lib/auth";
import { AccountPage } from "./account-page";

export const dynamic = "force-dynamic";

export default async function Account() {
  const session = await getSession();
  return <AccountPage name={session?.name || ""} email={session?.email || ""} />;
}
