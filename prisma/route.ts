import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const userEmail = session.user.email;

    if (action === "update_profile") {
      const updatedUser = await prisma.user.update({
        where: { email: userEmail },
        data: { name: body.name },
      });
      return NextResponse.json(updatedUser);
    } 
    
    if (action === "update_notifications") {
      const updatedUser = await prisma.user.update({
        where: { email: userEmail },
        data: { emailNotif: body.emailNotif, smsNotif: body.smsNotif },
      });
      return NextResponse.json(updatedUser);
    } 
    
    if (action === "add_address") {
      const user = await prisma.user.findUnique({ where: { email: userEmail }});
      const newAddress = await prisma.address.create({
        data: {
          userId: user!.id,
          street: body.street,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
          isDefault: body.isDefault || false
        }
      });
      return NextResponse.json(newAddress);
    }

    if (action === "delete_address") {
      await prisma.address.delete({
        where: { id: body.addressId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}