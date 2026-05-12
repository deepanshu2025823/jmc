"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { parseCsv, slugify } from "@/lib/csv";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dwqdav3kq",
  api_key: process.env.CLOUDINARY_API_KEY || "258176432323584",
  api_secret: process.env.CLOUDINARY_API_SECRET || "H1dGEr4ZebMXzfYf31Jr8RAE2Jw",
});

function isUploadableFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value !== "string" &&
    typeof (value as File).arrayBuffer === "function" &&
    (value as File).size > 0 &&
    !!(value as File).name &&
    (value as File).name !== "undefined"
  );
}

async function saveFile(file: FormDataEntryValue | null): Promise<string | null> {
  try {
    if (!isUploadableFile(file)) {
      return null;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "jmc_luxury" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error Details:", error);
            reject(error);
          } else {
            resolve(result?.secure_url || null);
          }
        }
      ).end(buffer);
    });

  } catch (error) {
    console.error("Error saving file to Cloudinary:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Cloud Upload Failed: ${message}`);
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

  } catch (error) {
    console.error("Create Product Fatal Error:", error);
    if (error instanceof Error && (error as { code?: string }).code === 'P2002') {
      return { success: false, error: "This Product Slug is already in use. Please try a different one." };
    }
    const message = error instanceof Error ? error.message : "An unexpected database error occurred.";
    return { success: false, error: message };
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
    const dataToUpdate: Prisma.ProductUpdateInput = { name, slug, description, price, stock, category };

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

  } catch (error) {
    console.error("Product Update Fatal Error:", error);
    if (error instanceof Error && (error as { code?: string }).code === 'P2002') {
      return { success: false, error: "This Product Slug is already in use. Please enter a unique slug." };
    }
    const message = error instanceof Error ? error.message : "Something went wrong while updating.";
    return { success: false, error: message };
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
  } catch (error) {
    console.error("Failed to delete image:", error);
    const message = error instanceof Error ? error.message : "Failed to remove image reference from database.";
    return { success: false, error: message };
  }
}

// ============================================================
// CSV bulk import
// ============================================================

export interface BulkImportRow {
  row: number;
  name: string;
  slug: string;
  status: "created" | "updated" | "error";
  error?: string;
}

export interface BulkImportResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  failed: number;
  rows: BulkImportRow[];
  error?: string;
}

const REQUIRED_HEADERS = ["name", "price"] as const;
const KNOWN_HEADERS = [
  "name",
  "slug",
  "description",
  "price",
  "stock",
  "category",
  "imageurl",
  "images",
] as const;

export async function bulkImportProducts(
  csvText: string,
  options: { mode: "create" | "upsert" } = { mode: "upsert" }
): Promise<BulkImportResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      success: false,
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      rows: [],
      error: "Unauthorized",
    };
  }

  let parsed;
  try {
    parsed = parseCsv(csvText);
  } catch (err) {
    return {
      success: false,
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      rows: [],
      error: err instanceof Error ? err.message : "Could not parse CSV",
    };
  }

  if (parsed.rowCount === 0) {
    return {
      success: false,
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      rows: [],
      error: "CSV has no data rows",
    };
  }

  const missing = REQUIRED_HEADERS.filter((h) => !parsed.headers.includes(h));
  if (missing.length > 0) {
    return {
      success: false,
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      rows: [],
      error: `Missing required column(s): ${missing.join(", ")}. Expected at minimum: ${REQUIRED_HEADERS.join(", ")}.`,
    };
  }

  const unknown = parsed.headers.filter(
    (h) => !KNOWN_HEADERS.includes(h as (typeof KNOWN_HEADERS)[number])
  );

  const results: BulkImportRow[] = [];
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]!;
    const rowNum = i + 2; // 1-indexed + 1 header line
    const name = (row["name"] || "").trim();
    const priceRaw = (row["price"] || "").trim();

    if (!name) {
      failed += 1;
      results.push({
        row: rowNum,
        name: "",
        slug: "",
        status: "error",
        error: "Missing name",
      });
      continue;
    }

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      failed += 1;
      results.push({
        row: rowNum,
        name,
        slug: "",
        status: "error",
        error: `Invalid price: "${priceRaw}"`,
      });
      continue;
    }

    const slug = (row["slug"] || slugify(name)).trim();
    if (!slug) {
      failed += 1;
      results.push({
        row: rowNum,
        name,
        slug: "",
        status: "error",
        error: "Could not derive slug from name",
      });
      continue;
    }

    const stockRaw = (row["stock"] || "").trim();
    const stock = stockRaw ? Math.max(0, Math.floor(Number(stockRaw))) : 0;
    if (stockRaw && !Number.isFinite(Number(stockRaw))) {
      failed += 1;
      results.push({
        row: rowNum,
        name,
        slug,
        status: "error",
        error: `Invalid stock: "${stockRaw}"`,
      });
      continue;
    }

    const imageUrl = (row["imageurl"] || "").trim() || null;
    const imagesRaw = (row["images"] || "").trim();
    const gallery = imagesRaw
      ? imagesRaw
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const data = {
      name,
      slug,
      description: (row["description"] || "").trim(),
      price,
      stock,
      category: (row["category"] || "").trim() || null,
      imageUrl,
      images: gallery,
    } satisfies Prisma.ProductUncheckedCreateInput;

    try {
      if (options.mode === "create") {
        await prisma.product.create({ data });
        created += 1;
        results.push({ row: rowNum, name, slug, status: "created" });
      } else {
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
          await prisma.product.update({
            where: { slug },
            data: {
              name: data.name,
              description: data.description,
              price: data.price,
              stock: data.stock,
              category: data.category,
              imageUrl: data.imageUrl,
              images: data.images,
            },
          });
          updated += 1;
          results.push({ row: rowNum, name, slug, status: "updated" });
        } else {
          await prisma.product.create({ data });
          created += 1;
          results.push({ row: rowNum, name, slug, status: "created" });
        }
      }
    } catch (err) {
      failed += 1;
      const message =
        err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "P2002"
          ? `Slug "${slug}" already exists`
          : err instanceof Error
          ? err.message
          : "Save failed";
      results.push({ row: rowNum, name, slug, status: "error", error: message });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/shop");

  return {
    success: failed === 0,
    total: parsed.rowCount,
    created,
    updated,
    failed,
    rows: results,
    error:
      unknown.length > 0
        ? `Note: ignored unknown column(s): ${unknown.join(", ")}`
        : undefined,
  };
}