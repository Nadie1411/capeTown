import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#233283_0%,_#0f172a_70%)] p-4">
      <LoginForm next={next || "/admin"} />
    </div>
  );
}
