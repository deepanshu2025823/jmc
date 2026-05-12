import prisma from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";

export type RoleFilter = "ALL" | "USER" | "ADMIN";
export type SortKey = "joined" | "name" | "orders" | "spent";
export type SortOrder = "asc" | "desc";

export const PAGE_SIZE = 15;

export interface UsersQuery {
  q: string;
  role: RoleFilter;
  sort: SortKey;
  order: SortOrder;
  page: number;
}

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export interface UsersStats {
  total: number;
  customers: number;
  admins: number;
  newThisMonth: number;
}

export interface UsersResult {
  users: UserRow[];
  stats: UsersStats;
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const VALID_ROLES: RoleFilter[] = ["ALL", "USER", "ADMIN"];
const VALID_SORTS: SortKey[] = ["joined", "name", "orders", "spent"];
const VALID_ORDERS: SortOrder[] = ["asc", "desc"];

export function parseUsersQuery(sp: {
  q?: string;
  role?: string;
  sort?: string;
  order?: string;
  page?: string;
}): UsersQuery {
  const role = (
    VALID_ROLES.includes(sp.role as RoleFilter) ? sp.role : "ALL"
  ) as RoleFilter;
  const sort = (
    VALID_SORTS.includes(sp.sort as SortKey) ? sp.sort : "joined"
  ) as SortKey;
  const order = (
    VALID_ORDERS.includes(sp.order as SortOrder) ? sp.order : "desc"
  ) as SortOrder;
  const pageNum = Number(sp.page);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;
  return { q: (sp.q ?? "").trim(), role, sort, order, page };
}

export async function getUsersStats(): Promise<UsersStats> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [total, customers, admins, newThisMonth] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.USER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);
  return { total, customers, admins, newThisMonth };
}

export async function getUsers(q: UsersQuery): Promise<UsersResult> {
  const where: Prisma.UserWhereInput = {};
  if (q.role !== "ALL") where.role = q.role;
  if (q.q) {
    where.OR = [
      { name: { contains: q.q } },
      { email: { contains: q.q } },
      { phone: { contains: q.q } },
    ];
  }

  const stats = await getUsersStats();

  // For DB-sortable fields we paginate at the DB layer.
  // For computed fields (orders/spent) we fetch matching set then sort in memory.
  const dbSortable = q.sort === "joined" || q.sort === "name";

  if (dbSortable) {
    const orderBy: Prisma.UserOrderByWithRelationInput =
      q.sort === "name"
        ? { name: q.order }
        : { createdAt: q.order };

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip: (q.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        orders: {
          select: { totalAmount: true, createdAt: true },
        },
      },
    });

    const rows = users.map((u): UserRow => {
      const totalSpent = u.orders.reduce(
        (s, o) => s + Number(o.totalAmount),
        0
      );
      const lastOrder = u.orders.reduce<Date | null>((acc, o) => {
        const d = new Date(o.createdAt);
        return !acc || d > acc ? d : acc;
      }, null);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        createdAt: u.createdAt.toISOString(),
        ordersCount: u.orders.length,
        totalSpent,
        lastOrderAt: lastOrder ? lastOrder.toISOString() : null,
      };
    });

    return {
      users: rows,
      stats,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      page: q.page,
      pageSize: PAGE_SIZE,
    };
  }

  // Computed sort path: load filtered set (with order aggregates), sort, paginate.
  const matched = await prisma.user.findMany({
    where,
    include: {
      orders: { select: { totalAmount: true, createdAt: true } },
    },
  });

  const enriched = matched.map((u): UserRow => {
    const totalSpent = u.orders.reduce(
      (s, o) => s + Number(o.totalAmount),
      0
    );
    const lastOrder = u.orders.reduce<Date | null>((acc, o) => {
      const d = new Date(o.createdAt);
      return !acc || d > acc ? d : acc;
    }, null);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt.toISOString(),
      ordersCount: u.orders.length,
      totalSpent,
      lastOrderAt: lastOrder ? lastOrder.toISOString() : null,
    };
  });

  const dir = q.order === "asc" ? 1 : -1;
  enriched.sort((a, b) => {
    if (q.sort === "orders") return (a.ordersCount - b.ordersCount) * dir;
    return (a.totalSpent - b.totalSpent) * dir;
  });

  const total = enriched.length;
  const start = (q.page - 1) * PAGE_SIZE;
  const users = enriched.slice(start, start + PAGE_SIZE);

  return {
    users,
    stats,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    page: q.page,
    pageSize: PAGE_SIZE,
  };
}
