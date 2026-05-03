import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export type ProductInput = Omit<Product, 'quantity'>;

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: string;
}

interface CartStore {
  removeFromWishlist: (id: string) => void;
  wishlist: Product[];
  addToWishlist: (product: ProductInput) => void;
  cart: Product[];
  appliedCoupon: AppliedCoupon | null;
  addToCart: (product: ProductInput) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, type: 'plus' | 'minus') => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
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
  isCartOpen: false,

  addToWishlist: (product) => set((state) => ({
    wishlist: [...state.wishlist, { ...product, quantity: 1 }],
  })),

  removeFromWishlist: (id) => set((state) => ({
    wishlist: state.wishlist.filter((item) => item.id !== id),
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
    cart: state.cart.filter(item => item.id !== id),
  })),

  updateQuantity: (id, type) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.id === id) {
        const newQty = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }),
  })),

  setCoupon: (coupon) => set({ appliedCoupon: coupon }),

  clearCart: () => set({ cart: [], appliedCoupon: null }),

  setWishlistOpen: (isOpen) => set({ isWishlistOpen: isOpen }),
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
}));
