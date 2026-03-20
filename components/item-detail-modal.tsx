'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, ShoppingCart, Zap } from 'lucide-react';

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

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (quantity: number, soupOptions?: string[]) => void;
  onCheckout: (quantity: number, soupOptions?: string[]) => void;
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  onCheckout,
}: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [soupOptions, setSoupOptions] = useState<string[]>([]);
  const SOUP_OPTIONS = ['Garri', 'Fufu', 'Semo'];

  if (!item) return null;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  const handleSoupOptionChange = (option: string) => {
    setSoupOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleAddToCart = () => {
    const options = item.category === 'Soup' && soupOptions.length > 0 ? soupOptions : undefined;
    onAddToCart(quantity, options);
    setQuantity(1);
    setSoupOptions([]);
    onClose();
  };

  const handleCheckout = () => {
    const options = item.category === 'Soup' && soupOptions.length > 0 ? soupOptions : undefined;
    onCheckout(quantity, options);
    setQuantity(1);
    setSoupOptions([]);
    onClose();
  };

  const isUnavailable = item.finished || !item.available;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
          {/* Image Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full h-64 sm:h-80 bg-gray-100 rounded-xl overflow-hidden mb-4">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                {item.category}
              </span>
              {item.finished && (
                <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Finished
                </span>
              )}
              {!item.available && (
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Unavailable
                </span>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {item.name}
              </h2>

              <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">
                ₦{item.price.toLocaleString()}
              </p>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Availability Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 font-medium">
                  {isUnavailable
                    ? 'Currently unavailable - check back soon!'
                    : 'Available - Fresh and ready to serve'}
                </p>
              </div>

              {/* Soup Options */}
              {item.category === 'Soup' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-amber-900 mb-3">What would you like with your soup?</p>
                  <div className="space-y-2">
                    {SOUP_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center gap-3">
                        <Checkbox
                          id={`soup-${option}`}
                          checked={soupOptions.includes(option)}
                          onCheckedChange={() => handleSoupOptionChange(option)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor={`soup-${option}`} className="text-sm font-medium text-amber-900 cursor-pointer flex-1">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Section */}
            <div className="space-y-4">
              {!isUnavailable && (
                <>
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Quantity:
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-16 text-center h-10 text-lg font-semibold"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleAddToCart}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Cart</span>
                    </Button>

                    <Button
                      onClick={handleCheckout}
                      className="bg-green-600 hover:bg-green-700 text-white h-12 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      <span className="hidden sm:inline">Buy Now</span>
                      <span className="sm:hidden">Buy</span>
                    </Button>
                  </div>
                </>
              )}

              {isUnavailable && (
                <Button
                  disabled
                  className="w-full h-12 rounded-lg font-semibold bg-gray-300 text-gray-600 cursor-not-allowed"
                >
                  Currently Unavailable
                </Button>
              )}

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-10 rounded-lg font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
