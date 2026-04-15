"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation"; // <-- NAYA IMPORT BOTTOM NAV KE LIYE
import { 
  Search, ShoppingBag, User, Heart, Menu, Sparkles, 
  Trash2, ShoppingCart, Loader2, LogOut, LayoutDashboard,
  Home, LayoutGrid 
} from "lucide-react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useCartStore } from "@/hooks/use-cart-store"; 
import { toast } from "sonner"; 

interface ProductItem {
  id: string;
  name: string;
  price: number | string;
  imageUrl: string;
  quantity?: number;
}

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname(); // <-- CURRENT PATH CHECK KARNE KE LIYE

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false); 
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const store = useCartStore() as any;
  const cart = store?.cart || [];
  const wishlist = store?.wishlist || [];
  
  const isCartOpen = store?.isCartOpen || false;
  const setCartOpen = store?.setCartOpen;
  
  const isWishlistOpen = store?.isWishlistOpen || false;
  const setWishlistOpen = store?.setWishlistOpen;

  const addToCart = store?.addToCart;
  const removeFromCart = store?.removeFromCart;
  const removeFromWishlist = store?.removeFromWishlist;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products/search?q=${searchQuery}`);
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (!mounted) return null;

  const subtotal = cart.reduce((acc: number, item: any) => 
    acc + (Number(item.price) * (item.quantity || 1)), 0);

  const moveWishlistToCart = (item: ProductItem) => {
    if (addToCart && removeFromWishlist) {
      addToCart(item);
      removeFromWishlist(item.id);
      toast.success("Moved to Shopping Bag");
    }
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 md:px-12",
        isScrolled ? "bg-white/90 backdrop-blur-xl border-b border-zinc-100 py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          
          <div className="md:hidden flex-1">
            <Menu 
              className="h-6 w-6 text-zinc-800 cursor-pointer hover:text-black transition-colors" 
              onClick={() => setIsMobileMenuOpen(true)} 
            />
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="w-full sm:max-w-sm flex flex-col p-6 z-[110] border-none shadow-2xl">
              <VisuallyHidden.Root>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Main navigation links</SheetDescription>
              </VisuallyHidden.Root>
              
              <SheetHeader className="pb-6 border-b border-zinc-100 mt-4 text-left">
                <Link href="/" className="group flex items-center gap-2 relative z-[101]">
                  <img src="/logo.png" className="h-20 w-20" alt="JMC" />
                </Link>
              </SheetHeader>

              <nav className="flex flex-col gap-8 mt-8 flex-1">
                <Link 
                  href="/shop" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-xl font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
                >
                  Shop
                </Link>
                <Link 
                  href="/about" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-xl font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
                >
                  About Us
                </Link>
                <Link 
                  href="/bestsellers" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-xl font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
                >
                  Bestsellers
                </Link>
                <Link 
                  href="/new-arrivals" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-xl font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
                >
                  New Arrivals
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <nav className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex-1">
            <Link href="/shop" className="hover:text-black transition-colors font-bold">Shop</Link>
            <Link href="/about" className="hover:text-black transition-colors font-bold">About Us</Link>
            <Link href="/bestsellers" className="hover:text-black transition-colors font-bold">Bestsellers</Link>
            <Link href="/new-arrivals" className="hover:text-black transition-colors font-bold">New Arrivals</Link>
          </nav>

          <Link href="/" className="group flex items-center gap-2 relative z-[101]">
            <img src="/logo.png" className="h-12 w-12 md:h-20 md:w-20" alt="JMC" />
          </Link>

          <div className="flex items-center justify-end gap-2 md:gap-5 flex-1">
            <div className="hidden lg:block relative group">
              <div className="flex items-center bg-zinc-100/50 backdrop-blur-md rounded-full px-4 py-2 focus-within:bg-white transition-all w-48 focus-within:w-64 border border-transparent focus-within:border-zinc-200">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="SEARCH..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-[10px] uppercase font-bold tracking-widest px-3 outline-none w-full"
                />
                {isSearching && <Loader2 className="h-3 w-3 animate-spin text-[#50540b]" />}
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <p className="p-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b">Suggested Rituals</p>
                  {searchResults.map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/product/${product.id}`}
                      onClick={() => setSearchQuery("")}
                      className="flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors"
                    >
                      <img src={product.imageUrl} className="h-12 w-12 rounded-lg object-cover" alt="" />
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                        <p className="text-[10px] text-[#50540b] font-bold">₹{Number(product.price).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              
              {session ? (
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-zinc-100 rounded-full transition-all"
                  >
                    <div className="h-7 w-7 rounded-full bg-[#50540b] text-white flex items-center justify-center text-xs font-serif font-bold shadow-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || "J"}
                    </div>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-[110]">
                      <div className="px-4 py-3 border-b border-zinc-50 mb-1 bg-[#F9F6F0]/50">
                        <p className="text-sm font-bold text-zinc-900 truncate font-serif">{session.user?.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate font-medium">{session.user?.email}</p>
                      </div>
                      
                      <Link 
                        href={(session.user as any)?.role === "ADMIN" ? "/admin" : "/profile"} 
                        onClick={() => setIsProfileOpen(false)} 
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {(session.user as any)?.role === "ADMIN" ? "Command Center" : "My Account"}
                      </Link>
                      
                      <button 
                        onClick={() => { setIsProfileOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login?callbackUrl=/profile" className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <User className="h-5 w-5 text-zinc-700" />
                </Link>
              )}
              
              <button onClick={() => setWishlistOpen(true)} className="p-2 relative group transition-all">
                <Heart className={cn("h-5 w-5 transition-colors", wishlist.length > 0 ? "fill-[#50540b] text-[#50540b]" : "text-zinc-700")} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-[#50540b] text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center font-bold shadow-lg">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button onClick={() => setCartOpen(true)} className="p-2 relative group transition-all">
                <ShoppingBag className="h-5 w-5 text-zinc-900" />
                <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold shadow-lg">
                  {cart.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
          <SheetContent className="w-full sm:max-w-md flex flex-col p-0 z-[110] border-none shadow-2xl">
            <VisuallyHidden.Root>
              <SheetTitle>Cart</SheetTitle>
              <SheetDescription>Cart items list</SheetDescription>
            </VisuallyHidden.Root>
            <SheetHeader className="p-6 border-b bg-white flex flex-row items-center justify-between">
              <SheetTitle className="font-serif text-2xl italic text-zinc-900">Shopping Bag ({cart.length})</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <ShoppingBag className="h-12 w-12 text-zinc-200" />
                  <p className="font-serif text-zinc-400">Your bag is empty</p>
                </div>
              ) : (
                cart.map((item: ProductItem) => (
                  <div key={item.id} className="flex gap-4 border-b pb-6 group relative">
                    <img src={item.imageUrl} alt={item.name} className="h-24 w-20 rounded-xl object-cover bg-zinc-50 border border-zinc-100" />
                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start">
                        <p className="font-serif text-md font-bold text-zinc-900 leading-tight">{item.name}</p>
                        <button 
                          onClick={() => removeFromCart && removeFromCart(item.id)} 
                          className="text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2">Qty: {item.quantity || 1}</p>
                      <p className="font-bold text-[#50540b] mt-1">₹{(Number(item.price) * (item.quantity || 1)).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t bg-zinc-50/80 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Subtotal</span>
                <span className="text-2xl font-serif text-zinc-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" className="w-full">
                  <Button onClick={() => setCartOpen(false)} variant="outline" className="w-full rounded-full h-14 uppercase text-[10px] font-bold border-zinc-300">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" className="w-full">
                  <Button onClick={() => setCartOpen(false)} className="w-full rounded-full h-14 uppercase text-[10px] font-black bg-zinc-900 text-white shadow-xl hover:bg-black transition-all">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={isWishlistOpen} onOpenChange={setWishlistOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 z-[110] border-none shadow-2xl">
            <VisuallyHidden.Root>
              <SheetTitle>Wishlist</SheetTitle>
              <SheetDescription>Wishlist items</SheetDescription>
            </VisuallyHidden.Root>
            <SheetHeader className="p-6 border-b bg-white">
              <SheetTitle className="font-serif text-2xl italic text-[#50540b]">Saved Rituals</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {wishlist.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-4 text-zinc-300 italic">No saved items yet.</div>
              ) : (
                wishlist.map((item: ProductItem) => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-6 animate-in fade-in duration-300">
                    <img src={item.imageUrl} className="h-20 w-16 rounded-xl object-cover border border-zinc-100" alt={item.name} />
                    <div className="flex-1">
                      <p className="font-serif text-sm font-bold text-zinc-900 leading-tight">{item.name}</p>
                      <p className="text-[#50540b] text-xs font-bold mt-1">₹{Number(item.price).toLocaleString()}</p>
                      <button 
                        onClick={() => moveWishlistToCart(item)}
                        className="flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase text-zinc-900 border-b border-zinc-900 pb-0.5 hover:text-[#50540b] hover:border-[#50540b] transition-all"
                      >
                        <ShoppingCart className="h-3 w-3" /> Move to Bag
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromWishlist && removeFromWishlist(item.id)} 
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* MOBILE BOTTOM NAVIGATION - MOVED INSIDE HEADER COMPONENT */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 px-6 py-3 z-[100] pb-safe flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        
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
          {mounted && wishlist.length > 0 && (
            <span className="absolute top-1 right-2 bg-[#50540b] text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
              {wishlist.length}
            </span>
          )}
        </button>

        <button onClick={() => setCartOpen(true)} className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-[#50540b] relative">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Bag</span>
          {mounted && cart.length > 0 && (
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