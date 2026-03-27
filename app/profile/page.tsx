import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!user) return null;

    const safeUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      orders: user.orders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        totalAmount: Number(order.totalAmount),
        orderItems: order.orderItems.map(item => ({
          ...item,
          price: Number(item.price),
          product: {
            ...item.product,
            price: Number(item.product.price), 
            createdAt: item.product.createdAt.toISOString(),
            updatedAt: item.product.updatedAt.toISOString(),
          }
        }))
      }))
    };

    return <ProfileClient user={safeUser} />;

  } catch (error) {
    console.error("Profile DB Error:", error);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] p-6 text-center">
        <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-3">System Offline</h1>
        <p className="text-zinc-500 max-w-md">
          We couldn't connect to the secure database server (Port 3306). Please ensure your database service (e.g., XAMPP MySQL) is actively running.
        </p>
      </div>
    );
  }
}