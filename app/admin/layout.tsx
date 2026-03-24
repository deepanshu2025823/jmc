import { AdminSidebar } from "@/components/admin-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA]">
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 border-r bg-white pt-5 pb-5 overflow-y-auto">
        <AdminSidebar />
      </aside>

      <div className="flex flex-1 flex-col md:pl-72">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 md:px-10">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <MobileSidebar />
            </div>
            <h2 className="hidden md:block text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
              Management Dashboard
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <ProfileDropdown user={session?.user} />
          </div>
        </header>
        
        <main className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}