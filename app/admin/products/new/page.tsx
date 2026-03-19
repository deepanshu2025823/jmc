"use client";

import { useState } from "react";
import { createProduct } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, ImagePlus } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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

  const addGalleryInput = () => setGalleryInputs([...galleryInputs, Date.now()]);
  const removeGalleryInput = (idToRemove: number) => {
    setGalleryInputs(galleryInputs.filter((id) => id !== idToRemove));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start sm:items-center gap-4">
        <Link href="/admin/products" className="shrink-0">
          <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 border-zinc-200 mt-1 sm:mt-0">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight">Add New Product</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1 break-words">Upload images and enter product details.</p>
        </div>
      </div>

      <form action={createProduct} className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6 sm:space-y-8">
        
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-semibold border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={name} onChange={handleNameChange} placeholder="e.g. 24K Gold Serum" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Product Slug</Label>
              <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="h-11" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="Serums" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" name="price" type="number" step="0.01" placeholder="2499.00" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" placeholder="50" required className="h-11" />
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 bg-zinc-50 p-4 sm:p-6 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <ImagePlus className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-600" />
            <h2 className="text-base sm:text-lg font-semibold">Media Upload</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mainImage" className="font-semibold text-zinc-800">Main Display Image</Label>
            <div className="relative">
              <Input 
                id="mainImage" 
                name="mainImage" 
                type="file" 
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                className="bg-white cursor-pointer h-12 file:h-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 hover:file:bg-zinc-200" 
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <Label className="font-semibold text-zinc-800">Gallery Images (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGalleryInput} className="h-9 sm:h-8 gap-1 bg-white w-full sm:w-auto">
                <Plus className="h-3 w-3" /> Add Image
              </Button>
            </div>
            
            <div className="space-y-3">
              {galleryInputs.map((id, index) => (
                <div key={id} className="flex flex-row items-center gap-2">
                  <Input 
                    name="galleryImages" 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="bg-white cursor-pointer h-11 file:h-full file:mr-4 file:py-0 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 hover:file:bg-zinc-200" 
                  />
                  {galleryInputs.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGalleryInput(id)} className="text-red-500 hover:bg-red-50 shrink-0 h-11 w-11">
                      <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea 
            id="description" name="description" rows={5} required
            className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
          />
        </div>

        <Button type="submit" className="w-full h-12 sm:h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium gap-2 text-sm sm:text-base">
          <Save className="h-4 w-4" /> Upload & Save Product
        </Button>
      </form>
    </div>
  );
}