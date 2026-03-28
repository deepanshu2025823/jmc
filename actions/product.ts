"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises"; 
import { join } from "path";

async function saveFile(file: File | null | any): Promise<string | null> {
  try {
    if (!file || typeof file === "string" || file.size === 0 || !file.name || file.name === "undefined") {
      return null;
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const uniqueName = `${Date.now()}-${safeFileName}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
    }

    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);
    
    return `/uploads/${uniqueName}`;
  } catch (error: any) {
    console.error("Error saving file:", error);
    throw new Error(`File save failed: ${error.message}`);
  }
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
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    
    // Strict Validation
    if (!name || !slug || isNaN(price) || isNaN(stock)) {
      return { success: false, error: "Validation Failed: Please fill all required fields correctly." };
    }

    const mainImageFile = formData.get("mainImage");
    const imageUrl = await saveFile(mainImageFile);

    const galleryFiles = formData.getAll("galleryImages");
    const galleryUrls: string[] = [];
    
    for (const file of galleryFiles) {
      const url = await saveFile(file);
      if (url) galleryUrls.push(url);
    }

    await prisma.product.create({
      data: { 
        name, 
        slug, 
        description, 
        price, 
        stock, 
        category, 
        imageUrl, 
        images: galleryUrls 
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    
    return { success: true };

  } catch (error: any) {
    console.error("Create Product Fatal Error:", error);
    
    if (error.code === 'P2002') {
      return { success: false, error: "This Product Slug is already in use. Please try a different one." };
    }
    
    // Return EXACT error message to frontend
    return { success: false, error: error.message || "An unexpected database error occurred." };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    
    if (!name || !slug || isNaN(price) || isNaN(stock)) {
      return { success: false, error: "Validation Failed: Please fill all required fields correctly." };
    }

    const mainImageFile = formData.get("mainImage");
    const newImageUrl = await saveFile(mainImageFile);

    const galleryFiles = formData.getAll("galleryImages");
    const newGalleryUrls: string[] = [];
    
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
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath("/admin");
    
    return { success: true };

  } catch (error: any) {
    console.error("Product Update Fatal Error:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "This Product Slug is already in use. Please enter a unique slug." };
    }
    return { success: false, error: error.message || "Something went wrong while updating." };
  }
}

export async function deleteProduct(id: string) {
  try {
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
  } catch (error) {
    console.error("Delete Product Error:", error);
  }
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
  } catch (error: any) {
    console.error("Failed to delete image:", error);
    return { success: false, error: error.message || "Failed to delete image file from database." };
  }
}