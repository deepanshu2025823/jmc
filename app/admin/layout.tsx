import { AdminSidebar } from "@/components/admin-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-50/50">
      <div className="hidden md:block w-64 fixed inset-y-0 z-50">
        <AdminSidebar />
      </div>

      <main className="md:pl-64 flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm md:justify-end sticky top-0 z-40">
          <div className="md:hidden">
            <MobileSidebar />
          </div>
          
          <div className="flex items-center gap-4">
            <ProfileDropdown user={session?.user} />
          </div>
        </header>
        
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}