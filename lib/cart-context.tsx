'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  category?: string;
  soupOptions?: string[]; // For soup items: 'Garri', 'Fufu', 'Semo'
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mealclan-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mealclan-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // For soup items with options, treat each combination as unique
      const existingIndex = prev.findIndex((c) => {
        if (c._id === item._id) {
          // If both have soup options, compare them
          if (item.soupOptions && c.soupOptions) {
            const itemOptions = [...(item.soupOptions || [])].sort();
            const cartOptions = [...(c.soupOptions || [])].sort();
            return JSON.stringify(itemOptions) === JSON.stringify(cartOptions);
          }
          // If neither has soup options or both don't match
          return !item.soupOptions && !c.soupOptions;
        }
        return false;
      });

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string, soupOptions?: string[]) => {
    setCart((prev) => 
      prev.filter((c) => {
        if (c._id !== itemId) return true;
        
        // If soup options provided, only remove exact match
        if (soupOptions) {
          const cartOptions = c.soupOptions ? [...c.soupOptions].sort() : [];
          const removeOptions = [...soupOptions].sort();
          return JSON.stringify(cartOptions) !== JSON.stringify(removeOptions);
        }
        
        return false;
      })
    );
  };

  const updateQuantity = (itemId: string, quantity: number, soupOptions?: string[]) => {
    if (quantity <= 0) {
      removeFromCart(itemId, soupOptions);
    } else {
      setCart((prev) =>
        prev.map((c) => {
          if (c._id === itemId) {
            // If soup options provided, only update exact match
            if (soupOptions) {
              const cartOptions = c.soupOptions ? [...c.soupOptions].sort() : [];
              const updateOptions = [...soupOptions].sort();
              if (JSON.stringify(cartOptions) === JSON.stringify(updateOptions)) {
                return { ...c, quantity };
              }
            } else if (!soupOptions && !c.soupOptions) {
              return { ...c, quantity };
            }
          }
          return c;
        })
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
