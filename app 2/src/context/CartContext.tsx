import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ecommerce } from '../components/Analytics';
import type { AppliedCoupon } from '../services/couponApi';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  minOrder: number;
  maxOrder?: number;
  stock?: number;
  options?: {
    size?: string;
    material?: string;
    color?: string;
  };
  notes?: string;
  sku?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateNotes: (id: number, notes: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemCount: () => number;
  isInCart: (id: number) => boolean;
  getItem: (id: number) => CartItem | undefined;
  lastAdded: CartItem | null;
  showMiniCart: boolean;
  setShowMiniCart: (show: boolean) => void;
  // Coupon
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cvk_cart_v2';
const COUPON_STORAGE_KEY = 'cvk_applied_coupon';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    
    const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        setAppliedCoupon(parsed);
      } catch (e) {
        console.error('Failed to parse coupon:', e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save cart and coupon to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoaded]);
  
  useEffect(() => {
    if (isLoaded) {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    }
  }, [appliedCoupon, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = item.quantity || item.minOrder || 1;
    
    // Track add to cart event
    ecommerce.addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      quantity,
    });
    
    setCart(prev => {
      const existing = prev.find(i => 
        i.id === item.id && 
        JSON.stringify(i.options) === JSON.stringify(item.options)
      );
      
      if (existing) {
        const updated = prev.map(i => 
          i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
        const updatedItem = updated.find(i => i.id === item.id);
        if (updatedItem) {
          setLastAdded(updatedItem);
          setShowMiniCart(true);
        }
        return updated;
      } else {
        const newItem: CartItem = { ...item, quantity };
        setLastAdded(newItem);
        setShowMiniCart(true);
        return [...prev, newItem];
      }
    });

    // Auto hide mini cart after 3 seconds
    setTimeout(() => {
      setShowMiniCart(false);
    }, 3000);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const minOrder = item.minOrder || 1;
    const maxOrder = item.maxOrder || 99999;
    const stock = item.stock || Infinity;
    
    // Clamp quantity between minOrder and max of maxOrder/stock
    const clampedQuantity = Math.max(minOrder, Math.min(quantity, maxOrder, stock));
    
    setCart(prev => 
      prev.map(i => i.id === id ? { ...i, quantity: clampedQuantity } : i)
    );
  };

  const updateNotes = (id: number, notes: string) => {
    setCart(prev => 
      prev.map(i => i.id === id ? { ...i, notes } : i)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartTotal();
    
    if (appliedCoupon.type === 'percentage') {
      return Number(((subtotal * appliedCoupon.value) / 100).toFixed(2));
    }
    return appliedCoupon.value;
  };

  const getFinalTotal = () => {
    const subtotal = getCartTotal();
    const discount = getDiscountAmount();
    return Number((subtotal - discount).toFixed(2));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.length;
  };

  const isInCart = (id: number) => {
    return cart.some(item => item.id === id);
  };

  const getItem = (id: number) => {
    return cart.find(item => item.id === id);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNotes,
      clearCart,
      getCartTotal,
      getCartCount,
      getItemCount,
      isInCart,
      getItem,
      lastAdded,
      showMiniCart,
      setShowMiniCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      getDiscountAmount,
      getFinalTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
