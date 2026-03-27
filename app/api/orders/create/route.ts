import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please login to place an order" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { shippingDetails, items, totalAmount } = await req.json();

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: totalAmount,
        status: "PENDING", 
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity || 1,
            price: Number(item.price)
          }))
        }
      }
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { 
          stock: { decrement: item.quantity || 1 } 
        }
      });
    }

    return NextResponse.json({ success: true, id: order.id });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}