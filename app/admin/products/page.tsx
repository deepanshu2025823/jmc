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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Products Inventory</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your luxury skincare products.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white gap-2 shadow-md">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="border border-zinc-200 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center p-12 gap-2 text-zinc-500">
          <PackageOpen className="h-8 w-8 text-zinc-300" />
          <p>No products found in your inventory.</p>
        </div>
      ) : (
        <>
          <div className="md:hidden flex flex-col gap-4">
            {products.map((product: any) => (
              <div key={product.id} className="border border-zinc-200 bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {product.imageUrl ? (
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border border-zinc-200 bg-zinc-50">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-md border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 truncate">{product.name}</p>
                    <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-medium mt-1">
                      {product.category || "Uncategorized"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-y border-zinc-100 py-3">
                  <div>
                    <p className="text-xs text-zinc-500">Price</p>
                    <p className="font-semibold text-zinc-900">₹{Number(product.price).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Stock</p>
                    <p className={`font-semibold ${product.stock <= 5 ? "text-red-600" : "text-zinc-900"}`}>
                      {product.stock} {product.stock <= 5 && "(!)"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 h-9">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  <form action={deleteProduct.bind(null, product.id)} className="flex-1">
                    <div className="w-full h-full [&>button]:w-full [&>button]:border [&>button]:border-red-200 [&>button]:h-9">
                      <DeleteProductButton />
                    </div>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/80">
                <TableRow>
                  <TableHead className="w-[80px] text-center font-semibold text-zinc-600">Image</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Product Info</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Category</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Price</TableHead>
                  <TableHead className="font-semibold text-zinc-600">In Stock</TableHead>
                  <TableHead className="text-right font-semibold text-zinc-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                    
                    <TableCell className="text-center">
                      {product.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-md overflow-hidden border border-zinc-200 mx-auto bg-zinc-50">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-md border border-zinc-200 bg-zinc-100 flex items-center justify-center mx-auto">
                          <ImageIcon className="h-5 w-5 text-zinc-400" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">/{product.slug}</p>
                    </TableCell>

                    <TableCell>
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium">
                        {product.category || "Uncategorized"}
                      </span>
                    </TableCell>
                    
                    <TableCell className="font-medium">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </TableCell>
                    
                    <TableCell>
                      <span className={`font-medium ${product.stock <= 5 ? "text-red-600" : "text-zinc-600"}`}>
                        {product.stock} {product.stock <= 5 && "(!)"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteProduct.bind(null, product.id)}>
                          <DeleteProductButton />
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