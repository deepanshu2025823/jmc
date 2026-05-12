"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { slugify } from "@/lib/csv";

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true };
}

export interface BundleItemInput {
  productId: string;
  quantity: number;
}

export interface BundleInput {
  name: string;
  slug?: string;
  description: string;
  imageUrl?: string | null;
  bundlePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  items: BundleItemInput[];
}

function validateInput(
  input: BundleInput
): { ok: true; cleanSlug: string } | { ok: false; error: string } {
  if (!input.name.trim()) return { ok: false, error: "Bundle name is required" };
  if (!input.description.trim())
    return { ok: false, error: "Description is required" };
  if (!Number.isFinite(input.bundlePrice) || input.bundlePrice <= 0)
    return { ok: false, error: "Bundle price must be greater than 0" };

  const validItems = input.items.filter(
    (it) => it.productId && Number(it.quantity) > 0
  );
  if (validItems.length < 2)
    return {
      ok: false,
      error: "A bundle needs at least 2 products",
    };
  const seen = new Set<string>();
  for (const it of validItems) {
    if (seen.has(it.productId)) {
      return { ok: false, error: "Duplicate products are not allowed" };
    }
    seen.add(it.productId);
  }

  const cleanSlug = (input.slug || slugify(input.name)).trim();
  if (!cleanSlug) return { ok: false, error: "Could not derive slug" };

  return { ok: true, cleanSlug };
}

export async function createBundle(
  input: BundleInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const v = validateInput(input);
  if (!v.ok) return { success: false, error: v.error };

  try {
    const created = await prisma.bundle.create({
      data: {
        name: input.name.trim(),
        slug: v.cleanSlug,
        description: input.description.trim(),
        imageUrl: input.imageUrl?.trim() || null,
        bundlePrice: input.bundlePrice,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        items: {
          create: input.items
            .filter((it) => it.productId && Number(it.quantity) > 0)
            .map((it) => ({
              productId: it.productId,
              quantity: Math.max(1, Math.floor(Number(it.quantity))),
            })),
        },
      },
    });

    revalidatePath("/admin/bundles");
    revalidatePath("/bundles");
    return { success: true, id: created.id };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return { success: false, error: `Slug "${v.cleanSlug}" already exists` };
    }
    console.error("createBundle error:", err);
    return { success: false, error: "Failed to create bundle" };
  }
}

export async function updateBundle(
  id: string,
  input: BundleInput
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const v = validateInput(input);
  if (!v.ok) return { success: false, error: v.error };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.bundle.update({
        where: { id },
        data: {
          name: input.name.trim(),
          slug: v.cleanSlug,
          description: input.description.trim(),
          imageUrl: input.imageUrl?.trim() || null,
          bundlePrice: input.bundlePrice,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
        },
      });
      await tx.bundleItem.deleteMany({ where: { bundleId: id } });
      await tx.bundleItem.createMany({
        data: input.items
          .filter((it) => it.productId && Number(it.quantity) > 0)
          .map((it) => ({
            bundleId: id,
            productId: it.productId,
            quantity: Math.max(1, Math.floor(Number(it.quantity))),
          })),
      });
    });

    revalidatePath("/admin/bundles");
    revalidatePath(`/admin/bundles/${id}/edit`);
    revalidatePath("/bundles");
    return { success: true };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return { success: false, error: `Slug "${v.cleanSlug}" already exists` };
    }
    console.error("updateBundle error:", err);
    return { success: false, error: "Failed to update bundle" };
  }
}

export async function deleteBundle(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await prisma.bundle.delete({ where: { id } });
    revalidatePath("/admin/bundles");
    revalidatePath("/bundles");
    return { success: true };
  } catch (err) {
    console.error("deleteBundle error:", err);
    return { success: false, error: "Failed to delete bundle" };
  }
}

export async function toggleBundleActive(
  id: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const current = await prisma.bundle.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!current) return { success: false, error: "Bundle not found" };

    const updated = await prisma.bundle.update({
      where: { id },
      data: { isActive: !current.isActive },
      select: { isActive: true },
    });
    revalidatePath("/admin/bundles");
    revalidatePath("/bundles");
    return { success: true, isActive: updated.isActive };
  } catch (err) {
    console.error("toggleBundleActive error:", err);
    return { success: false, error: "Failed to toggle bundle" };
  }
}
