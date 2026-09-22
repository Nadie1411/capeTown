import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/shell";
import { ForcePasswordChange } from "./force-password";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const me = session ? await prisma.user.findUnique({ where: { id: session.sub } }) : null;
  if (me?.mustChangePassword) return <ForcePasswordChange email={me.email} />;
  const unread = await prisma.lead.count({ where: { read: false } });
  return (
    <AdminShell user={{ name: session?.name || "", email: session?.email || "" }} unread={unread}>
      {children}
    </AdminShell>
  );
}
