'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { initializeSocket } from '@/lib/socket';
import { ItemDetailModal } from './item-detail-modal';
import { useRouter } from 'next/navigation';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  finished?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface MenuStoreProps {
  onAddToCart: (item: CartItem) => void;
}

// Define standard categories
const STANDARD_CATEGORIES = ['Rice', 'Soup', 'Pepper Soup', 'Drinks', 'Swallows', 'Sides', 'Desserts', 'Beverages'];

export function MenuStore({ onAddToCart }: MenuStoreProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchItems();

    // Initialize socket and listen for menu updates
    const socket = initializeSocket();

    // Legacy event handlers
    const handleMenuUpdate = (data: { itemId: string; changes: Record<string, any> }) => {
      setItems((prev) =>
        prev.map((item) =>
          item._id === data.itemId ? { ...item, ...data.changes } : item
        )
      );
    };

    const handleMenuDelete = (data: { itemId: string }) => {
      setItems((prev) => prev.filter((item) => item._id !== data.itemId));
    };

    const handleMenuAdd = (data: MenuItem) => {
      setItems((prev) => [data, ...prev]);
    };

    // Real-time event handlers
    const handleMenuItemAdded = (data: { item: MenuItem; timestamp: string }) => {
      setItems((prev) => [data.item, ...prev]);
    };

    const handleMenuItemUpdated = (data: { itemId: string; item: MenuItem; timestamp: string }) => {
      setItems((prev) =>
        prev.map((item) =>
          item._id === data.itemId ? data.item : item
        )
      );
    };

    const handleMenuItemDeleted = (data: { itemId: string; timestamp: string }) => {
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
        const firstCategory = menuItems[0].category;
        setSelectedCategory(firstCategory);
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
    ? items.filter((item) => item.category === selectedCategory && !item.finished)
    : items.filter((item) => !item.finished);

  const handleOpenModal = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToCart = (quantity: number) => {
    if (selectedItem) {
      onAddToCart({ ...selectedItem, quantity });
    }
  };

  const handleCheckout = (quantity: number) => {
    if (selectedItem) {
      onAddToCart({ ...selectedItem, quantity });
      router.push('/cart');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading menu...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Category Filter - Modern Chip Design */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {category}
            </Button>
          ))
        ) : null}
      </div>

      {/* Menu Items Grid - Modern Card Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-center text-sm">No items available in this category</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item._id}
              onClick={() => handleOpenModal(item)}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-300"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {item.category}
                </div>

                {/* Status Badges */}
                {!item.available && (
                  <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Unavailable
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-4 h-40">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {item.description}
                </p>

                {/* Price and Action */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 px-4 pb-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ₦{item.price.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10 w-10 p-0 flex items-center justify-center shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(item);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onAddToCart={handleAddToCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
