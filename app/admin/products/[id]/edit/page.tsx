"use client";
import { useEffect, useState } from "react";
import { updateProduct, deleteProductImage } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, ImagePlus, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { use } from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [galleryInputs, setGalleryInputs] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const addGalleryInput = () => setGalleryInputs([...galleryInputs, Date.now()]);
  const removeGalleryInput = (idToRemove: number) => {
    setGalleryInputs(galleryInputs.filter((id) => id !== idToRemove));
  };

  const handleDeleteImage = async (imageUrl: string, isMainImage: boolean) => {
    if (!confirm("Are you sure you want to delete this image? It will be removed permanently.")) return;
    
    setIsDeleting(imageUrl);
    const result = await deleteProductImage(productId, imageUrl, isMainImage);
    
    if (result.success) {
      if (isMainImage) {
        setProduct({ ...product, imageUrl: null });
      } else {
        const newImages = product.images.filter((img: string) => img !== imageUrl);
        setProduct({ ...product, images: newImages });
      }
    }
    setIsDeleting(null);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>;
  if (!product) return <div className="text-center p-12">Product not found</div>;

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start sm:items-center gap-4">
        <Link href="/admin/products" className="shrink-0">
          <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 border-zinc-200 mt-1 sm:mt-0">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight">Edit Product</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1 break-words">Update details for {product.name}</p>
        </div>
      </div>

      <form action={updateProductWithId} className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6 sm:space-y-8">
        
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-semibold border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" defaultValue={product.name} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Product Slug</Label>
              <Input id="slug" name="slug" defaultValue={product.slug} required className="h-11" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={product.category || ""} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={Number(product.price)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" defaultValue={product.stock} required className="h-11" />
            </div>
          </div>
        </div>

        {/* Media Management */}
        <div className="space-y-4 sm:space-y-6 bg-zinc-50 p-4 sm:p-6 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <ImagePlus className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-600" />
            <h2 className="text-base sm:text-lg font-semibold">Media Management</h2>
          </div>
          
          <div className="space-y-4">
            <Label className="font-semibold text-zinc-800">Main Display Image</Label>
            {product.imageUrl ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-zinc-200 rounded-md bg-white">
                <Image src={product.imageUrl} alt="Main" width={80} height={80} className="rounded-md object-cover border border-zinc-200 h-16 w-16 sm:h-20 sm:w-20" />
                <div className="flex-1 w-full">
                  <p className="text-xs sm:text-sm font-medium">Current Main Image</p>
                  <Button type="button" variant="destructive" size="sm" className="mt-2 h-7 w-full sm:w-auto" onClick={() => handleDeleteImage(product.imageUrl, true)} disabled={isDeleting === product.imageUrl}>
                    {isDeleting === product.imageUrl ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Trash2 className="h-3 w-3 mr-1" />} Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Input id="mainImage" name="mainImage" type="file" accept="image/png, image/jpeg, image/webp" className="bg-white cursor-pointer file:h-full" />
            )}
            
            {product.imageUrl && (
              <div className="pt-2">
                <Label htmlFor="mainImage" className="text-xs text-zinc-500">Upload to replace main image:</Label>
                <Input id="mainImage" name="mainImage" type="file" accept="image/png, image/jpeg, image/webp" className="bg-white cursor-pointer mt-1 h-10 sm:h-9 text-xs" />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 sm:pt-6 border-t border-zinc-200">
            <Label className="font-semibold text-zinc-800">Gallery Images</Label>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {product.images.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative group border border-zinc-200 rounded-md bg-white p-1.5 sm:p-2">
                    <Image src={imgUrl} alt={`Gallery ${idx}`} width={150} height={150} className="rounded-md object-cover aspect-square w-full" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 sm:top-2 right-1 sm:right-2 h-6 w-6 sm:h-7 sm:w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
                      onClick={() => handleDeleteImage(imgUrl, false)}
                      disabled={isDeleting === imgUrl}
                    >
                      {isDeleting === imgUrl ? <Loader2 className="h-3 w-3 animate-spin"/> : <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mt-4">
              <Label className="text-xs sm:text-sm text-zinc-500">Upload additional gallery images</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGalleryInput} className="h-9 sm:h-8 gap-1 bg-white w-full sm:w-auto">
                <Plus className="h-3 w-3" /> Add Image Box
              </Button>
            </div>
            
            <div className="space-y-3">
              {galleryInputs.map((id) => (
                <div key={id} className="flex flex-row items-center gap-2">
                  <Input name="galleryImages" type="file" accept="image/png, image/jpeg, image/webp" className="bg-white cursor-pointer h-10" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeGalleryInput(id)} className="text-red-500 hover:bg-red-50 shrink-0 h-10 w-10">
                    <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea 
            id="description" name="description" rows={5} defaultValue={product.description} required
            className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
          />
        </div>

        <Button type="submit" className="w-full h-12 sm:h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium gap-2 text-sm sm:text-base">
          <Save className="h-4 w-4" /> Update Product
        </Button>
      </form>
    </div>
  );
}