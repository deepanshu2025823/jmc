import { Users, Mail, Calendar, ShoppingBag, UserCircle, ShieldAlert, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { deleteUser } from "@/actions/user";
import { DeleteUserButton } from "@/components/delete-user-button";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: true,
    }
  });

  const customers = allUsers.filter((u: any) => u.role === "USER");
  const admins = allUsers.filter((u: any) => u.role === "ADMIN");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">User Management</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1">Manage accounts, roles and view customer activity.</p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          {customers.length === 0 ? (
            <div className="border border-dashed border-zinc-300 rounded-xl bg-white p-12 text-center text-zinc-500">
              <Users className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
              <p>No customers found.</p>
            </div>
          ) : (
            <>
              <div className="md:hidden flex flex-col gap-4">
                {customers.map((user: any) => {
                  const totalSpent = user.orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);
                  return (
                    <div key={user.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-10 w-10 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate">{user.name || "Guest"}</p>
                          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center py-2 border-y border-zinc-100">
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400 font-bold">Orders</p>
                          <p className="font-bold text-zinc-900">{user.orders.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400 font-bold">Spent</p>
                          <p className="font-bold text-green-600">₹{totalSpent.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Link href={`/admin/customers/${user.id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full h-9 border-zinc-200 text-blue-600">
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteUser(user.id);
                        }} className="flex-1">
                          <DeleteUserButton role="Customer" />
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50">
                    <TableRow>
                      <TableHead>Customer Info</TableHead>
                      <TableHead className="text-center">Orders</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((user: any) => (
                      <TableRow key={user.id} className="hover:bg-zinc-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserCircle className="h-9 w-9 text-zinc-400" />
                            <div>
                              <p className="font-medium text-zinc-900">{user.name || "Guest"}</p>
                              <p className="text-xs text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold">{user.orders.length}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          ₹{user.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/customers/${user.id}/edit`}>
                              <Button variant="ghost" size="icon" className="text-blue-600 h-8 w-8"><Edit className="h-4 w-4" /></Button>
                            </Link>
                            <form action={async () => {
                              "use server";
                              await deleteUser(user.id);
                            }}>
                              <DeleteUserButton role="Customer" />
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="admins">
          <div className="border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead>Admin Info</TableHead>
                  <TableHead className="hidden sm:table-cell">Access Level</TableHead>
                  <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-zinc-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                          <ShieldAlert className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{user.name || "Administrator"}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/customers/${user.id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-blue-600 h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}