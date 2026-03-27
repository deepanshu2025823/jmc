"use client";

import Link from "next/link";
import { Sparkles, Facebook, Instagram, Twitter, Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const { 
    cart, 
    wishlist, 
    setCartOpen, 
    setWishlistOpen 
  } = useCartStore() as any;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <footer className="bg-zinc-950 text-zinc-400 pt-20 pb-32 md:pb-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
            <div className="space-y-6 md:col-span-1 flex flex-col items-center md:items-start">
              <Link href="/" className="flex items-center gap-2">
                <img src="/footerlogo.png" className="h-20 w-20" alt="JMC" />
              </Link>
              <p className="text-sm leading-relaxed max-w-xs">
                Elevating your daily skincare routine into a luxurious, transformative ritual with nature's purest elements.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">The Boutique</h3>
              <ul className="space-y-4 text-sm">
                <li><Link href="/shop" className="hover:text-[#50540b] transition-colors">All Rituals</Link></li>
                <li><Link href="/shop" className="hover:text-[#50540b] transition-colors">Bestsellers</Link></li>
                <li><Link href="/shop" className="hover:text-[#50540b] transition-colors">New Arrivals</Link></li>
                <li><Link href="/about" className="hover:text-[#50540b] transition-colors">Our Story</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Client Care</h3>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-[#50540b] transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-[#50540b] transition-colors">Shipping & Returns</Link></li>
                <li><Link href="#" className="hover:text-[#50540b] transition-colors">FAQ</Link></li>
                <li><Link href="/profile" className="hover:text-[#50540b] transition-colors">My Account</Link></li>
              </ul>
            </div>

            <div className="space-y-6 flex flex-col items-center md:items-start">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Connect</h3>
              <div className="flex items-center gap-4">
                <a href="#" className="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#50540b] hover:text-white hover:border-[#50540b] transition-all"><Instagram className="h-4 w-4" /></a>
                <a href="#" className="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#50540b] hover:text-white hover:border-[#50540b] transition-all"><Facebook className="h-4 w-4" /></a>
                <a href="#" className="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#50540b] hover:text-white hover:border-[#50540b] transition-all"><Twitter className="h-4 w-4" /></a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} JMC Luxury Skincare. All rights reserved | <a href="https://royalfinitytechnologies.com/" target="_blank" rel="noopener noreferrer">Design & Developed By Royalfinity Technologies</a> </p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 px-6 py-3 z-[90] pb-safe flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        
        <Link href="/" className={cn("flex flex-col items-center gap-1 p-2", pathname === "/" ? "text-[#50540b]" : "text-zinc-400")}>
          <Home className="h-5 w-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Home</span>
        </Link>

        <Link href="/shop" className={cn("flex flex-col items-center gap-1 p-2", pathname === "/shop" ? "text-[#50540b]" : "text-zinc-400")}>
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Shop</span>
        </Link>

        <button onClick={() => setWishlistOpen(true)} className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-[#50540b] relative">
          <Heart className="h-5 w-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Wishlist</span>
          {mounted && (wishlist?.length || 0) > 0 && (
            <span className="absolute top-1 right-2 bg-[#50540b] text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
              {wishlist.length}
            </span>
          )}
        </button>

        <button onClick={() => setCartOpen(true)} className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-[#50540b] relative">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Bag</span>
          {mounted && (cart?.length || 0) > 0 && (
            <span className="absolute top-1 right-1 bg-zinc-900 text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </button>

        <Link href="/profile" className={cn("flex flex-col items-center gap-1 p-2", pathname === "/profile" ? "text-[#50540b]" : "text-zinc-400")}>
          <User className="h-5 w-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Profile</span>
        </Link>

      </nav>
    </>
  );
}