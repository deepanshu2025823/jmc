"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

async function saveFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0 || file.name === "undefined") return null;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
  const filePath = join(process.cwd(), "public", "uploads", uniqueName);
  
  await writeFile(filePath, buffer);
  return `/uploads/${uniqueName}`;
}

async function deleteFileFromDisk(imageUrl: string | null) {
  if (!imageUrl) return;
  try {
    const filePath = join(process.cwd(), "public", imageUrl);
    await unlink(filePath);
  } catch (error) {
    console.error("Failed to delete file from disk:", error);
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string);
  const category = formData.get("category") as string;
  
  const mainImageFile = formData.get("mainImage") as File;
  const imageUrl = await saveFile(mainImageFile);

  const galleryFiles = formData.getAll("galleryImages") as File[];
  const galleryUrls = [];
  
  for (const file of galleryFiles) {
    const url = await saveFile(file);
    if (url) galleryUrls.push(url);
  }

  await prisma.product.create({
    data: { 
      name, slug, description, price, stock, category, 
      imageUrl, images: galleryUrls 
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string);
  const category = formData.get("category") as string;
  
  const mainImageFile = formData.get("mainImage") as File;
  const newImageUrl = await saveFile(mainImageFile);

  const galleryFiles = formData.getAll("galleryImages") as File[];
  const newGalleryUrls = [];
  
  for (const file of galleryFiles) {
    const url = await saveFile(file);
    if (url) newGalleryUrls.push(url);
  }

  const existingProduct = await prisma.product.findUnique({ where: { id } });
  
  const dataToUpdate: any = { name, slug, description, price, stock, category };
  
  if (newImageUrl) {
    if (existingProduct?.imageUrl) {
      await deleteFileFromDisk(existingProduct.imageUrl);
    }
    dataToUpdate.imageUrl = newImageUrl;
  }

  if (newGalleryUrls.length > 0) {
    const currentImages = (existingProduct?.images as string[]) || [];
    dataToUpdate.images = [...currentImages, ...newGalleryUrls];
  }

  await prisma.product.update({
    where: { id },
    data: dataToUpdate
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (product) {
    await deleteFileFromDisk(product.imageUrl);
    const galleryImages = (product.images as string[]) || [];
    for (const img of galleryImages) {
      await deleteFileFromDisk(img);
    }
  }

  await prisma.product.delete({
    where: { id }
  });
  
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function deleteProductImage(productId: string, imageUrl: string, isMainImage: boolean) {
  try {
    if (isMainImage) {
      await prisma.product.update({
        where: { id: productId },
        data: { imageUrl: null },
      });
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (product && product.images) {
        const currentImages = product.images as string[];
        const updatedImages = currentImages.filter((img) => img !== imageUrl);
        
        await prisma.product.update({
          where: { id: productId },
          data: { images: updatedImages },
        });
      }
    }

    await deleteFileFromDisk(imageUrl);
    
    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false, error: "Failed to delete image file" };
  }
}