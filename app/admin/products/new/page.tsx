"use client";

import { useState } from "react";
import { createProduct } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 1. NAYA IMPORT

export default function NewProductPage() {
  const router = useRouter(); // 2. ROUTER INITIALIZE KIYA
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [galleryInputs, setGalleryInputs] = useState<number[]>([Date.now()]); 

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    const autoSlug = newName
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
    setSlug(autoSlug);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        toast.error(`File is too large (${fileSizeInMB.toFixed(1)}MB). Max size is 5MB.`);
        e.target.value = ""; // Form input ko clear kar dega
      }
    }
  };

  const addGalleryInput = () => setGalleryInputs([...galleryInputs, Date.now()]);
  const removeGalleryInput = (idToRemove: number) => {
    setGalleryInputs(galleryInputs.filter((id) => id !== idToRemove));
  };

  // 3. UPDATED SUBMIT FUNCTION
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createProduct(formData) as unknown as { success?: boolean; error?: string };
      
      if (result?.success) {
        toast.success("Product created successfully!");
        router.push("/admin/products"); // Success hone par redirect
      } else {
        toast.error(result?.error || "Failed to create product.");
        setSaving(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong while saving. Check if 'public/uploads' folder exists.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <Link href="/admin/products" className="shrink-0">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-zinc-200 hover:bg-zinc-50">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 leading-tight">Add New Product</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-[#B59461] mt-1 break-words">Create a new luxury ritual</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2rem] border border-zinc-100 shadow-sm space-y-8">
        
        <div className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50 pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-zinc-700">Product Name</Label>
              <Input 
                id="name" name="name" 
                value={name} onChange={handleNameChange} 
                placeholder="e.g. 24K Gold Serum" required 
                className="h-12 rounded-xl bg-zinc-50/50 focus:border-[#B59461] transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-bold text-zinc-700">Product Slug</Label>
              <Input 
                id="slug" name="slug" 
                value={slug} onChange={(e) => setSlug(e.target.value)} 
                required 
                className="h-12 rounded-xl bg-zinc-50/50 focus:border-[#B59461] transition-colors" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold text-zinc-700">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Serums" required className="h-12 rounded-xl bg-zinc-50/50 focus:border-[#B59461]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs font-bold text-zinc-700">Price (₹)</Label>
              <Input id="price" name="price" type="number" step="0.01" placeholder="2499.00" required className="h-12 rounded-xl bg-zinc-50/50 focus:border-[#B59461]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-xs font-bold text-zinc-700">Stock</Label>
              <Input id="stock" name="stock" type="number" placeholder="50" required className="h-12 rounded-xl bg-zinc-50/50 focus:border-[#B59461]" />
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-[#F9F6F0]/30 p-6 rounded-2xl border border-[#B59461]/20">
          <div className="flex items-center gap-2 border-b border-[#B59461]/10 pb-3">
            <ImagePlus className="h-5 w-5 text-[#B59461]" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#B59461]">Media Management (Max 5MB)</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mainImage" className="text-[10px] uppercase font-bold text-zinc-400">Main Display Image</Label>
            <div className="relative">
              <Input 
                id="mainImage" name="mainImage" type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="bg-white cursor-pointer h-12 rounded-xl file:h-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F9F6F0] file:text-[#B59461] hover:file:bg-[#B59461]/10" 
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#B59461]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <Label className="text-[10px] uppercase font-bold text-zinc-400">Gallery Images (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGalleryInput} className="h-9 rounded-lg gap-2 bg-white text-zinc-700 border-zinc-200 hover:border-[#B59461] hover:text-[#B59461] transition-colors w-full sm:w-auto font-bold text-xs">
                <Plus className="h-3 w-3" /> Add Image Box
              </Button>
            </div>
            
            <div className="space-y-3">
              {galleryInputs.map((id, index) => (
                <div key={id} className="flex flex-row items-center gap-3">
                  <Input 
                    name="galleryImages" type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="bg-white cursor-pointer h-12 rounded-xl file:h-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-zinc-50 file:text-zinc-500 hover:file:bg-zinc-100" 
                  />
                  {galleryInputs.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGalleryInput(id)} className="text-red-500 hover:bg-red-50 rounded-xl shrink-0 h-11 w-11 border border-red-100">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</Label>
          <textarea 
            id="description" name="description" rows={5} required
            className="flex w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B59461] focus-visible:border-[#B59461] resize-none transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          disabled={saving}
          className="w-full h-16 bg-zinc-900 hover:bg-[#B59461] text-white rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl mt-4 transition-all duration-500"
        >
          {saving ? (
            <span className="flex items-center gap-2">Creating Product <Loader2 className="h-4 w-4 animate-spin" /></span>
          ) : (
            <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Upload & Save Product</span>
          )}
        </Button>
      </form>
    </div>
  );
}