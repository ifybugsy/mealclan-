'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealTimeCartUpdates } from '@/hooks/use-socket';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  soupOptions?: string[];
}

interface LiveOrderPreviewProps {
  cartItems: CartItem[];
}

export function LiveOrderPreview({ cartItems }: LiveOrderPreviewProps) {
  const { cartUpdates } = useRealTimeCartUpdates();
  const [displayedItems, setDisplayedItems] = useState<CartItem[]>(cartItems);
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [soupOptions, setSoupOptions] = useState<string[]>([]);

  useEffect(() => {
    setDisplayedItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    // Update based on real-time cart updates from socket
    if (cartUpdates) {
      if (cartUpdates.type === 'phone') {
        setPhone(cartUpdates.value);
      } else if (cartUpdates.type === 'deliveryAddress') {
        setDeliveryAddress(cartUpdates.value);
      } else if (cartUpdates.type === 'deliveryMethod') {
        setDeliveryMethod(cartUpdates.value);
      } else if (cartUpdates.type === 'soupOptions') {
        setSoupOptions(cartUpdates.value || []);
        
        // Update displayed items with soup options
        if (cartUpdates.itemName) {
          setDisplayedItems((prev) =>
            prev.map((item) =>
              item.name === cartUpdates.itemName
                ? { ...item, soupOptions: cartUpdates.value }
                : item
            )
          );
        }
      }
    }
  }, [cartUpdates]);

  const totalPrice = displayedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Order Items Section */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {displayedItems.length}
            </span>
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedItems.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-600">No items in order</p>
            </div>
          ) : (
            <>
              {displayedItems.map((item) => (
                <div key={item._id} className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">₦{item.price.toLocaleString()} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-600">
                        {item.quantity}x
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Soup Options Display */}
                  {item.soupOptions && item.soupOptions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-amber-200 bg-amber-50 p-2 rounded">
                      <p className="text-[10px] font-bold text-amber-700 mb-1">With:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.soupOptions.map((option) => (
                          <span key={option} className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!item.soupOptions || item.soupOptions.length === 0 ? (
                    <p className="text-[10px] text-gray-500 italic mt-2">No soup options selected</p>
                  ) : null}
                </div>
              ))}

              <div className="border-t-2 border-blue-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900 text-sm">Total:</p>
                  <p className="font-bold text-blue-600 text-lg">₦{totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer Info Section */}
      <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            👤 Customer Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Phone */}
          <div className="bg-white p-2.5 rounded border border-indigo-200">
            <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase">Phone</p>
            <p className="font-bold text-gray-900 text-sm">{phone || 'No phone provided'}</p>
          </div>

          {/* Delivery Address */}
          <div className={`p-2.5 rounded border ${deliveryAddress ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300' : 'bg-gray-50 border-gray-300'}`}>
            <p className="text-[10px] font-semibold mb-1 uppercase flex items-center gap-1">
              📍 Delivery Address
            </p>
            <p className={`text-sm font-bold ${deliveryAddress ? 'text-gray-900' : 'text-gray-500 italic'}`}>
              {deliveryAddress || 'No delivery address provided'}
            </p>
          </div>

          {/* Delivery Method */}
          {deliveryMethod === 'delivery' && (
            <div className="bg-orange-50 p-2 rounded border border-orange-200 text-xs">
              <p className="font-semibold text-orange-900">🚗 Delivery to address</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
