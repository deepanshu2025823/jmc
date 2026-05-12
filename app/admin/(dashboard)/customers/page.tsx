import {
  Users,
  UserCircle,
  ShieldAlert,
  Edit,
  IndianRupee,
  Sparkles,
  ShoppingBag,
  Phone,
  Mail,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteUser } from "@/actions/user";
import { DeleteUserButton } from "@/components/delete-user-button";
import { UsersTableToolbar } from "@/components/users-table-toolbar";
import { UsersPagination } from "@/components/users-pagination";
import { getUsers, parseUsersQuery } from "@/lib/users-query";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function initialsOf(name: string | null, email: string) {
  const source = (name || email).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {label}
          </span>
          <div className={cn("rounded-md p-1.5", accent)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    role?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const query = parseUsersQuery(sp);
  const result = await getUsers(query);
  const { users, stats, total, totalPages, page, pageSize } = result;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage customer accounts, admin access, and view activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats.total.toLocaleString("en-IN")}
          icon={Users}
          accent="bg-zinc-900"
        />
        <StatCard
          label="Customers"
          value={stats.customers.toLocaleString("en-IN")}
          icon={UserCircle}
          accent="bg-blue-600"
        />
        <StatCard
          label="Admins"
          value={stats.admins.toLocaleString("en-IN")}
          icon={ShieldAlert}
          accent="bg-violet-600"
        />
        <StatCard
          label="New this month"
          value={stats.newThisMonth.toLocaleString("en-IN")}
          icon={Sparkles}
          accent="bg-emerald-600"
        />
      </div>

      <UsersTableToolbar
        q={query.q}
        role={query.role}
        sort={query.sort}
        order={query.order}
      />

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          <Users className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
          <p className="font-medium text-zinc-700">No users match your filters</p>
          <p className="text-sm mt-1">Try adjusting search or clearing filters.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-xs font-bold",
                      u.role === "ADMIN"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-zinc-100 text-zinc-700"
                    )}
                  >
                    {initialsOf(u.name, u.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-zinc-900 truncate">
                        {u.name || "Guest"}
                      </p>
                      {u.role === "ADMIN" && (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ring-violet-200 text-violet-700">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {u.email}
                    </p>
                    {u.phone && (
                      <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {u.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-zinc-100 py-2 text-center">
                  <div>
                    <p className="text-[10px] uppercase text-zinc-400 font-bold">
                      Orders
                    </p>
                    <p className="font-bold text-zinc-900">{u.ordersCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-zinc-400 font-bold">
                      Spent
                    </p>
                    <p className="font-bold text-emerald-600">
                      {inr(u.totalSpent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-zinc-400 font-bold">
                      Joined
                    </p>
                    <p className="text-xs font-bold text-zinc-700">
                      {fmtDate(u.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/customers/${u.id}/edit`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-9 border-zinc-200"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteUser(u.id);
                    }}
                  >
                    <DeleteUserButton role={u.role === "ADMIN" ? "Admin" : "Customer"} />
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Total spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-zinc-50/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold",
                            u.role === "ADMIN"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-zinc-100 text-zinc-700"
                          )}
                        >
                          {initialsOf(u.name, u.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 truncate">
                            {u.name || "Guest"}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-zinc-600">
                      {u.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                          u.role === "ADMIN"
                            ? "bg-violet-50 text-violet-700 ring-violet-200"
                            : "bg-blue-50 text-blue-700 ring-blue-200"
                        )}
                      >
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-zinc-500">
                      {fmtDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-900">
                        <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
                        {u.ordersCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {u.totalSpent.toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/customers/${u.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-600 hover:text-zinc-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteUser(u.id);
                          }}
                        >
                          <DeleteUserButton
                            role={u.role === "ADMIN" ? "Admin" : "Customer"}
                          />
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <UsersPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
}
