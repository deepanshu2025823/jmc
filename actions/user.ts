"use server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as Role;

  await prisma.user.update({
    where: { id },
    data: { name, email, role: role }
  });

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}