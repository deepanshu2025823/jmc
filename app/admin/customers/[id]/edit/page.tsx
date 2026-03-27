import { updateUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) redirect("/admin/customers");

  const updateUserWithId = updateUser.bind(null, user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit {user.role === 'ADMIN' ? 'Admin' : 'Customer'}</h1>
      </div>

      <form action={updateUserWithId} className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input name="name" defaultValue={user.name || ""} required />
        </div>
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input name="email" type="email" defaultValue={user.email} required />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <select name="role" defaultValue={user.role} className="w-full border rounded-md h-10 px-3">
            <option value="USER">USER (Customer)</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <Button type="submit" className="w-full bg-zinc-900 text-white">
          <Save className="h-4 w-4 mr-2" /> Update Details
        </Button>
      </form>
    </div>
  );
}