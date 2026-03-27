import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, PackageOpen, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/actions/product";
import { DeleteProductButton } from "@/components/delete-product-button"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900">Products Inventory</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your luxury skincare products catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="w-full sm:w-auto bg-zinc-900 hover:bg-[#B59461] text-white gap-2 shadow-md rounded-full px-6 font-bold text-xs uppercase tracking-widest transition-colors duration-300">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="border border-zinc-200 rounded-[2rem] bg-white shadow-sm flex flex-col items-center justify-center p-16 gap-4 text-zinc-500">
          <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center">
            <PackageOpen className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="font-serif text-xl font-bold text-zinc-900">Inventory is Empty</h3>
          <p className="text-sm">Start by adding your first luxury product to the store.</p>
          <Link href="/admin/products/new" className="mt-2">
            <Button variant="outline" className="rounded-full border-zinc-200 font-bold uppercase text-[10px] tracking-widest">
              Add Product
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="md:hidden flex flex-col gap-4">
            {products.map((product: any) => (
              <div key={product.id} className="border border-zinc-200 bg-white rounded-[2rem] p-5 shadow-sm flex flex-col gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {product.imageUrl ? (
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-zinc-100 bg-[#F9F6F0]">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="64px" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-xl border border-zinc-100 bg-zinc-50 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base font-bold text-zinc-900 truncate">{product.name}</p>
                    <span className="inline-block px-2 py-1 bg-[#F9F6F0] text-[#B59461] rounded border border-[#B59461]/10 text-[9px] font-black uppercase tracking-widest mt-1">
                      {product.category || "Uncategorized"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-y border-zinc-50 py-4">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="font-bold text-zinc-900">₹{Number(product.price).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Stock</p>
                    <p className={`font-bold ${product.stock <= 5 ? "text-red-500" : "text-zinc-900"}`}>
                      {product.stock} {product.stock <= 5 && <span className="text-[10px] uppercase font-black ml-1">(Low)</span>}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-[#B59461] rounded-xl h-10 font-bold text-xs">
                      <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                    </Button>
                  </Link>
                  <form action={deleteProduct.bind(null, product.id)} className="flex-1">
                    <div className="w-full h-full [&>button]:w-full [&>button]:border [&>button]:border-red-100 [&>button]:bg-red-50 [&>button]:text-red-600 [&>button]:hover:bg-red-100 [&>button]:rounded-xl [&>button]:h-10">
                      <DeleteProductButton />
                    </div>
                  </form>
                </div>

              </div>
            ))}
          </div>

          <div className="hidden md:block border border-zinc-200 rounded-[2rem] bg-white shadow-sm overflow-hidden p-2">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-b border-zinc-100">
                  <TableHead className="w-[80px] text-center font-bold text-zinc-400 uppercase tracking-widest text-[10px] h-12">Image</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Product Details</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Category</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Price</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">In Stock</TableHead>
                  <TableHead className="text-right font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-zinc-50/30 transition-colors border-b border-zinc-50 last:border-0 h-20">
                    
                    <TableCell className="text-center">
                      {product.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-zinc-100 mx-auto bg-[#F9F6F0]">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl border border-zinc-100 bg-zinc-50 flex items-center justify-center mx-auto">
                          <ImageIcon className="h-5 w-5 text-zinc-300" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-zinc-900 text-sm">{product.name}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">/{product.slug}</p>
                    </TableCell>

                    <TableCell>
                      <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {product.category || "Uncategorized"}
                      </span>
                    </TableCell>
                    
                    <TableCell className="font-bold text-zinc-900">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </TableCell>
                    
                    <TableCell>
                      <span className={`font-bold text-sm ${product.stock <= 5 ? "text-red-500 bg-red-50 px-3 py-1 rounded-full" : "text-zinc-600"}`}>
                        {product.stock} {product.stock <= 5 && <span className="text-[9px] uppercase font-black">Low</span>}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-[#B59461] hover:bg-[#F9F6F0] transition-colors rounded-full">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteProduct.bind(null, product.id)}>
                           <div className="[&>button]:h-9 [&>button]:w-9 [&>button]:rounded-full [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button:hover]:bg-red-50 [&>button:hover]:text-red-500 [&>button]:transition-colors [&>button>span]:hidden [&>button>svg]:h-4 [&>button>svg]:w-4">
                             <DeleteProductButton />
                           </div>
                        </form>
                      </div>
                    </TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}