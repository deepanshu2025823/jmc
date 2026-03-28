import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartStore {
  removeFromWishlist: any;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  cart: Product[];
  appliedCoupon: { code: string; discount: number; type: string } | null;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, type: 'plus' | 'minus') => void;
  setCoupon: (coupon: { code: string; discount: number; type: string } | null) => void;
  clearCart: () => void; 
  
  isWishlistOpen: boolean;
  setWishlistOpen: (isOpen: boolean) => void;
  
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  wishlist: [],
  appliedCoupon: null,
  
  isWishlistOpen: false, 
  isCartOpen: false, // Default cart state bandh rahegi

  addToWishlist: (product: any) => set((state) => ({ wishlist: [...state.wishlist, product] })),
  
  removeFromWishlist: (id: string) => set((state) => ({
    wishlist: state.wishlist.filter((item: any) => item.id !== id)
  })),
  
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(item => item.id !== id)
  })),

  updateQuantity: (id, type) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.id === id) {
        const newQty = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    })
  })),

  setCoupon: (coupon) => set({ appliedCoupon: coupon }),
  
  clearCart: () => set({ cart: [], appliedCoupon: null }), 

  setWishlistOpen: (isOpen) => set({ isWishlistOpen: isOpen }),
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }), 
}));