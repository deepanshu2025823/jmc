"use client";

import { useEffect, useState, use } from "react"; 
import { updateProduct, deleteProductImage } from "@/actions/product"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, ImagePlus, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryInputs, setGalleryInputs] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setName(data.name); // Setup initial name
          setSlug(data.slug); // Setup initial slug
        } else {
          toast.error("Failed to load product details.");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Convert to lowercase, replace spaces/special chars with hyphens
    const generatedSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const manualSlug = e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
    setSlug(manualSlug);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        toast.error(`File is too large (${fileSizeInMB.toFixed(1)}MB). Max size is 5MB.`);
        e.target.value = ""; // Clear the selected file
      }
    }
  };

  const addGalleryInput = () => setGalleryInputs([...galleryInputs, Date.now()]);
  const removeGalleryInput = (idToRemove: number) => {
    setGalleryInputs(galleryInputs.filter((id) => id !== idToRemove));
  };

  const handleDeleteImage = async (imageUrl: string, isMainImage: boolean) => {
    if (!confirm("Are you sure you want to delete this image? It will be removed permanently.")) return;
    
    setIsDeleting(imageUrl);
    try {
      const result = await deleteProductImage(productId, imageUrl, isMainImage);
      
      if (result.success) {
        toast.success("Image deleted successfully");
        if (isMainImage) {
          setProduct({ ...product, imageUrl: null });
        } else {
          const newImages = product.images.filter((img: string) => img !== imageUrl);
          setProduct({ ...product, images: newImages });
        }
      } else {
        toast.error("Failed to delete image.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await updateProduct(productId, formData) as unknown as { success?: boolean; error?: string };
      
      if (result?.success) { 
        toast.success("Product updated successfully!");
        setGalleryInputs([]); 
      } else {
        toast.error(result?.error || "Failed to update product.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#B59461]" /></div>;
  if (!product) return <div className="text-center p-12 font-serif text-xl">Product not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <Link href="/admin/products" className="shrink-0">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-zinc-200 hover:bg-zinc-50">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 leading-tight">Edit Product</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-[#B59461] mt-1 break-words">{product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2rem] border border-zinc-100 shadow-sm space-y-8">
        
        <div className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50 pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-zinc-700">Product Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={name} 
                onChange={handleNameChange} 
                required 
                className="h-12 rounded-xl bg-zinc-50/50" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-bold text-zinc-700">Product Slug</Label>
              <Input 
                id="slug" 
                name="slug" 
                value={slug} 
                onChange={handleSlugChange} 
                required 
                className="h-12 rounded-xl bg-zinc-50/50" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold text-zinc-700">Category</Label>
              <Input id="category" name="category" defaultValue={product.category || ""} required className="h-12 rounded-xl bg-zinc-50/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs font-bold text-zinc-700">Price (₹)</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={Number(product.price)} required className="h-12 rounded-xl bg-zinc-50/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-xs font-bold text-zinc-700">Stock</Label>
              <Input id="stock" name="stock" type="number" defaultValue={product.stock} required className="h-12 rounded-xl bg-zinc-50/50" />
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-[#F9F6F0]/30 p-6 rounded-2xl border border-[#B59461]/20">
          <div className="flex items-center gap-2 border-b border-[#B59461]/10 pb-3">
            <ImagePlus className="h-5 w-5 text-[#B59461]" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#B59461]">Media Management (Max 5MB)</h2>
          </div>
          
          <div className="space-y-4">
            <Label className="text-xs font-bold text-zinc-700">Main Display Image</Label>
            {product.imageUrl ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-zinc-200 rounded-xl bg-white shadow-sm">
                <Image src={product.imageUrl} alt="Main" width={80} height={80} className="rounded-lg object-cover h-20 w-20 bg-zinc-50" />
                <div className="flex-1 w-full text-center sm:text-left">
                  <p className="text-xs font-bold text-zinc-900">Current Main Image</p>
                  <Button type="button" variant="destructive" size="sm" className="mt-3 h-8 w-full sm:w-auto rounded-lg text-xs" onClick={() => handleDeleteImage(product.imageUrl, true)} disabled={isDeleting === product.imageUrl}>
                    {isDeleting === product.imageUrl ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Trash2 className="h-3 w-3 mr-1" />} Delete Image
                  </Button>
                </div>
              </div>
            ) : (
              <Input id="mainImage" name="mainImage" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="bg-white cursor-pointer file:h-full rounded-xl" />
            )}
            
            {product.imageUrl && (
              <div className="pt-2">
                <Label htmlFor="mainImage" className="text-[10px] uppercase font-bold text-zinc-400">Upload to replace main image:</Label>
                <Input id="mainImage" name="mainImage" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="bg-white cursor-pointer mt-2 h-11 text-xs rounded-xl" />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-[#B59461]/10">
            <Label className="text-xs font-bold text-zinc-700">Gallery Images</Label>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {product.images.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative group border border-zinc-200 rounded-xl bg-white p-2 shadow-sm">
                    <Image src={imgUrl} alt={`Gallery ${idx}`} width={150} height={150} className="rounded-lg object-cover aspect-square w-full bg-zinc-50" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-3 right-3 h-7 w-7 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-md"
                      onClick={() => handleDeleteImage(imgUrl, false)}
                      disabled={isDeleting === imgUrl}
                    >
                      {isDeleting === imgUrl ? <Loader2 className="h-3 w-3 animate-spin"/> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <Label className="text-[10px] uppercase font-bold text-zinc-400">Upload additional gallery images</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGalleryInput} className="h-9 rounded-lg gap-2 bg-white text-zinc-700 border-zinc-200 hover:border-[#B59461] hover:text-[#B59461] transition-colors w-full sm:w-auto font-bold text-xs">
                <Plus className="h-3 w-3" /> Add Image Box
              </Button>
            </div>
            
            <div className="space-y-3">
              {galleryInputs.map((id) => (
                <div key={id} className="flex flex-row items-center gap-3">
                  <Input name="galleryImages" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="bg-white cursor-pointer h-11 rounded-xl" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeGalleryInput(id)} className="text-red-500 hover:bg-red-50 rounded-xl shrink-0 h-11 w-11 border border-red-100">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</Label>
          <textarea 
            id="description" name="description" rows={5} defaultValue={product.description} required
            className="flex w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B59461] focus-visible:border-[#B59461] resize-none transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          disabled={saving}
          className="w-full h-16 bg-zinc-900 hover:bg-[#B59461] text-white rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl mt-4 transition-all duration-500"
        >
          {saving ? (
            <span className="flex items-center gap-2">Saving Changes <Loader2 className="h-4 w-4 animate-spin" /></span>
          ) : (
            <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Update Product</span>
          )}
        </Button>
      </form>
    </div>
  );
}