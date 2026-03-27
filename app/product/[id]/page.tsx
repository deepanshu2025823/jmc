import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { TrustBadges } from "@/components/trust-badges";
import { Star, ShieldCheck, Sparkles } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button"; 
import { BuyNowButton } from "@/components/buy-now-button"; 
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product-gallery";
import { RecentProducts } from "@/components/recent-products";

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const session = await getServerSession(authOptions);
  const isUserLoggedIn = !!session?.user;

  const rawProduct = await prisma.product.findUnique({ where: { id: id } });
  if (!rawProduct) notFound();

  const product = {
    ...rawProduct,
    price: Number(rawProduct.price),
    images: Array.isArray(rawProduct.images) ? rawProduct.images : [rawProduct.imageUrl]
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 pt-24 lg:pt-36 pb-20">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 lg:mb-12">
          <Link href="/" className="hover:text-black">Home</Link>
          <span className="text-zinc-200">/</span>
          <Link href="/shop" className="hover:text-black">Shop</Link>
          <span className="text-zinc-200">/</span>
          <span className="text-zinc-900 truncate max-w-[100px] md:max-w-none">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
          
          <div className="lg:col-span-7">
            <ProductGallery images={product.images as string[]} productName={product.name} />
          </div>

          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#F9F6F0] px-3 py-1 rounded-full border border-[#B59461]/20">
                <Sparkles className="h-3 w-3 text-[#B59461]" />
                <span className="text-[9px] font-black uppercase text-[#B59461] tracking-widest">Ritual Approved</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-[#B59461] text-[#B59461]" />)}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">(120 REVIEWS)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-[#B59461] italic">₹{product.price.toLocaleString("en-IN")}</span>
                <span className="text-lg text-zinc-300 line-through">₹{(product.price + 599).toLocaleString("en-IN")}</span>
              </div>
              <p className="text-zinc-500 leading-relaxed text-sm md:text-md">
                {product.description || "Our signature luxury serum is crafted to provide deep hydration and a radiant golden glow."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-zinc-100 py-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100"><ShieldCheck className="h-5 w-5 text-zinc-400" /></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Derm Tested</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100"><Sparkles className="h-5 w-5 text-zinc-400" /></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Organic Pure</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <AddToCartButton product={product} />

              <BuyNowButton product={product} isUserLoggedIn={isUserLoggedIn} />
              
              <Button variant="outline" className="h-14 rounded-full border-zinc-200 font-bold uppercase text-[10px] tracking-widest hover:bg-[#F9F6F0]">
                Add to Wishlist
              </Button>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-center gap-6 text-zinc-300">
                <div className="h-[1px] flex-1 bg-zinc-100"></div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">JMC Quality Assurance</p>
                <div className="h-[1px] flex-1 bg-zinc-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecentProducts currentProductId={id} />

      <TrustBadges />
    </main>
  );
}