"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

async function saveFile(file: File | null | any): Promise<string | null> {
  try {
    if (!file || typeof file === "string" || file.size === 0 || !file.name || file.name === "undefined") {
      return null;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "jmc_luxury" }, 
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || null); 
          }
        }
      ).end(buffer);
    });

  } catch (error: any) {
    console.error("Error saving file to Cloudinary:", error);
    throw new Error(`Cloud Upload Failed: ${error.message}`);
  }
}

async function deleteFileFromDisk(imageUrl: string | null) {
  if (!imageUrl) return;
  console.log("Image reference removed:", imageUrl);
}

export async function createProduct(formData: FormData) {
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

    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete image:", error);
    return { success: false, error: error.message || "Failed to remove image reference from database." };
  }
}