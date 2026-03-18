'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Plus, Minus } from 'lucide-react';
import { initializeSocket } from '@/lib/socket';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface MenuStoreProps {
  onAddToCart: (item: CartItem) => void;
}

export function MenuStore({ onAddToCart }: MenuStoreProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchItems();

    // Initialize socket and listen for menu updates
    const socket = initializeSocket();

    // Legacy event handlers
    const handleMenuUpdate = (data: { itemId: string; changes: Record<string, any> }) => {
      console.log('[v0] Menu update received:', data);
      setItems((prev) =>
        prev.map((item) =>
          item._id === data.itemId ? { ...item, ...data.changes } : item
        )
      );
    };

    const handleMenuDelete = (data: { itemId: string }) => {
      console.log('[v0] Menu item deleted:', data);
      setItems((prev) => prev.filter((item) => item._id !== data.itemId));
    };

    const handleMenuAdd = (data: MenuItem) => {
      console.log('[v0] Menu item added:', data);
      setItems((prev) => [data, ...prev]);
    };

    // Real-time event handlers
    const handleMenuItemAdded = (data: { item: MenuItem; timestamp: string }) => {
      console.log('[MenuStore] Real-time item added:', data.item._id);
      setItems((prev) => [data.item, ...prev]);
    };

    const handleMenuItemUpdated = (data: { itemId: string; item: MenuItem; timestamp: string }) => {
      console.log('[MenuStore] Real-time item updated:', data.itemId);
      setItems((prev) =>
        prev.map((item) =>
          item._id === data.itemId ? data.item : item
        )
      );
    };

    const handleMenuItemDeleted = (data: { itemId: string; timestamp: string }) => {
      console.log('[MenuStore] Real-time item deleted:', data.itemId);
      setItems((prev) => prev.filter((item) => item._id !== data.itemId));
    };

    socket.on('menuUpdate', handleMenuUpdate);
    socket.on('menuDelete', handleMenuDelete);
    socket.on('menuAdd', handleMenuAdd);
    socket.on('menuItemAdded', handleMenuItemAdded);
    socket.on('menuItemUpdated', handleMenuItemUpdated);
    socket.on('menuItemDeleted', handleMenuItemDeleted);

    return () => {
      socket.off('menuUpdate', handleMenuUpdate);
      socket.off('menuDelete', handleMenuDelete);
      socket.off('menuAdd', handleMenuAdd);
      socket.off('menuItemAdded', handleMenuItemAdded);
      socket.off('menuItemUpdated', handleMenuItemUpdated);
      socket.off('menuItemDeleted', handleMenuItemDeleted);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/menu`);
      const data = await response.json();
      const menuItems = Array.isArray(data) ? data : [];
      setItems(menuItems);
      if (menuItems.length > 0) {
        setSelectedCategory(menuItems[0].category);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = items && items.length > 0 
    ? [...new Set(items.map((item) => item.category))]
    : [];
  const filteredItems = selectedCategory && items && items.length > 0
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const handleAddToCart = (item: MenuItem) => {
    const newQuantity = (cartItems[item._id] || 0) + 1;
    setCartItems({ ...cartItems, [item._id]: newQuantity });
    onAddToCart({ ...item, quantity: newQuantity });
  };

  const handleRemoveFromCart = (itemId: string) => {
    const newQuantity = (cartItems[itemId] || 1) - 1;
    if (newQuantity <= 0) {
      const newCart = { ...cartItems };
      delete newCart[itemId];
      setCartItems(newCart);
    } else {
      setCartItems({ ...cartItems, [itemId]: newQuantity });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading menu...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Category Filter */}
      <div className="flex gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {filteredItems.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-8 text-sm">No items in this category</p>
        ) : (
          filteredItems.map((item) => (
            <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {item.image && (
                <div className="relative h-24 sm:h-32 md:h-40 lg:h-48 w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-2">{item.name}</h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2 sm:mt-3 md:mt-4">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold">₦{item.price}</span>
                  <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
                    {cartItems[item._id] > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromCart(item._id)}
                        className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 p-0"
                      >
                        <Minus className="w-2.5 sm:w-3 md:w-3" />
                      </Button>
                    )}
                    {cartItems[item._id] > 0 && (
                      <span className="font-semibold w-4 text-center text-xs sm:text-sm">
                        {cartItems[item._id]}
                      </span>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 p-0"
                    >
                      <Plus className="w-2.5 sm:w-3 md:w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
