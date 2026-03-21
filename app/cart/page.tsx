'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, Plus, Minus, Copy, MessageCircle } from 'lucide-react';
import { initializeSocket } from '@/lib/socket';

const DELIVERY_FEE = 1500;

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [selectedDelivery, setSelectedDelivery] = useState('pickup');
  const deliveryFee = selectedDelivery === 'delivery' ? DELIVERY_FEE : 0;
  const totalAmount = total + deliveryFee;
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    specialInstructions: '',
  });
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ accountNumber?: string; accountName?: string; bankName?: string; whatsappNumber?: string }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize socket
    const s = initializeSocket();
    setSocket(s);

    // Fetch payment details from settings
    const fetchPaymentDetails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/settings`);
        const data = await response.json();
        setPaymentDetails({
          accountNumber: data.bankAccountNumber || '',
          accountName: data.bankAccountName || 'MealClan',
          bankName: data.bankName || '',
          whatsappNumber: data.whatsappNumber || '08038753508',
        });
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
        // Fallback values
        setPaymentDetails({
          accountNumber: '',
          accountName: 'MealClan',
          bankName: '',
          whatsappNumber: '08038753508',
        });
      }
    };
    
    fetchPaymentDetails();
  }, []);

  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Emit real-time updates to admin dashboard
    if (socket) {
      const emitUpdate = () => {
        if (socket.connected) {
          console.log(`[v0] Cart page - Emitting ${field} update:`, value);
          if (field === 'customerPhone') {
            socket.emit('cartUpdate', { type: 'phone', value });
          } else if (field === 'deliveryAddress') {
            // Always emit delivery address when it changes (only shows when delivery is selected anyway)
            console.log('[v0] Emitting DELIVERY ADDRESS:', value);
            socket.emit('cartUpdate', { type: 'deliveryAddress', value });
          }
        } else {
          // Retry when connected
          console.log('[v0] Socket not connected, waiting for connection...');
          socket.once('connect', emitUpdate);
        }
      };
      emitUpdate();
    } else {
      console.log('[v0] Socket not initialized yet');
    }
  };

  const handleDeliveryChange = (value: string) => {
    setSelectedDelivery(value);
    
    // Emit delivery method change to admin
    if (socket) {
      const emitUpdate = () => {
        if (socket.connected) {
          console.log('[v0] Emitting delivery method update:', value);
          socket.emit('cartUpdate', { type: 'deliveryMethod', value });
        } else {
          socket.once('connect', emitUpdate);
        }
      };
      emitUpdate();
    }
  };

  const handleSoupOptionsChange = (soupOptions: string[]) => {
    // Emit soup options to admin dashboard
    if (socket && socket.connected) {
      socket.emit('cartUpdate', { type: 'soupOptions', value: soupOptions });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setOrderProcessing(true);

    try {
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        items: cart,
        itemsTotal: total,
        deliveryFee: deliveryFee,
        totalPrice: totalAmount,
        deliveryType: selectedDelivery,
        deliveryAddress: formData.deliveryAddress || '',
        specialInstructions: formData.specialInstructions,
        paymentMethod: selectedPayment,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderSuccess(true);
        clearCart();

        // Redirect to confirmation
        setTimeout(() => {
          window.location.href = `/order-confirmation/${order._id}`;
        }, 2000);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setOrderProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Successful!</h1>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Your order has been successfully placed. Please take a screenshot of the next page for your records.
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Redirecting in a few seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-24 flex items-center justify-between gap-4">
          <Link href="/store" className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-600 transition-colors text-xs sm:text-sm md:text-base font-medium">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Menu</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="MealClan Logo" width={80} height={80} className="w-auto h-auto max-w-[40px] sm:max-w-[50px] md:max-w-[70px]" />
          </Link>

          <div className="text-right text-xs sm:text-sm">
            <p className="font-bold text-gray-900">Your Cart</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-sm text-gray-600 mt-2">Review and complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.length === 0 ? (
              <Card className="bg-white border border-gray-200">
                <CardContent className="text-center py-12 sm:py-16">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Cart is Empty</h3>
                  <p className="text-gray-600 text-sm mb-6">Start by adding some delicious items from our menu</p>
                  <Link href="/store">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                      Browse Menu
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        {(item as any).soupOptions && (item as any).soupOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">With:</span>
                            {(item as any).soupOptions.map((option: string) => (
                              <span key={option} className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                {option}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-1">₦{item.price.toLocaleString()} each</p>
                        <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-2">
                          Subtotal: ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateQuantity(item._id, Math.max(1, item.quantity - 1), (item as any).soupOptions)
                            }
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="font-semibold w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item._id, item.quantity + 1, (item as any).soupOptions)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item._id, (item as any).soupOptions)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span className="text-xs">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Form */}
          {cart.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {/* Order Summary */}
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>Items Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                  {selectedDelivery === 'delivery' && (
                    <div className="flex justify-between text-orange-600 font-medium">
                      <span>Delivery Fee</span>
                      <span>₦{deliveryFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-1.5 sm:pt-2 flex justify-between font-bold text-sm sm:text-base">
                    <span>Total Amount</span>
                    <span>₦{totalAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-3 sm:space-y-4">
                {/* Customer Info */}
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm md:text-base">Your Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div>
                      <label className="text-xs sm:text-sm font-medium">Name</label>
                      <Input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({ ...formData, customerName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          handleFormDataChange('customerPhone', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email <span className="text-gray-400 text-xs">(Optional)</span></label>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, customerEmail: e.target.value })
                        }
                        placeholder="your@email.com (optional)"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Options */}
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm md:text-base">Delivery Option</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <label className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="radio"
                        value="pickup"
                        checked={selectedDelivery === 'pickup'}
                        onChange={(e) => setSelectedDelivery(e.target.value)}
                      />
                      <span>Pickup at Restaurant</span>
                    </label>
                    <label className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="radio"
                        value="delivery"
                        checked={selectedDelivery === 'delivery'}
                        onChange={(e) => handleDeliveryChange(e.target.value)}
                      />
                      <span>Delivery to My Address</span>
                    </label>

                    {selectedDelivery === 'delivery' && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium">Address</label>
                        <Input
                          type="text"
                          value={formData.deliveryAddress}
                          onChange={(e) =>
                            handleFormDataChange('deliveryAddress', e.target.value)
                          }
                          required
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm md:text-base">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <label className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="radio"
                        value="cash"
                        checked={selectedPayment === 'cash'}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                      />
                      <span>Cash on Delivery</span>
                    </label>
                    <label className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="radio"
                        value="transfer"
                        checked={selectedPayment === 'transfer'}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                      />
                      <span>Bank Transfer</span>
                    </label>

                    {selectedPayment === 'transfer' && (
                      <div className="space-y-3 sm:space-y-4 bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          {/* Bank Name */}
                          {paymentDetails.bankName && (
                            <div>
                              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Bank Name</p>
                              <p className="text-xs sm:text-sm bg-white p-2 sm:p-3 rounded font-bold text-gray-900">{paymentDetails.bankName}</p>
                            </div>
                          )}

                          {/* Account Number */}
                          {paymentDetails.accountNumber && (
                            <div>
                              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Account Number</p>
                              <div className="flex items-center gap-2 bg-white p-2 sm:p-3 rounded border border-gray-200">
                                <span className="text-xs sm:text-sm font-mono font-bold text-gray-900 flex-1 break-all">{paymentDetails.accountNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(paymentDetails.accountNumber || '');
                                    setCopiedField('account');
                                    setTimeout(() => setCopiedField(null), 2000);
                                  }}
                                  className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded transition-colors"
                                  title="Copy account number"
                                >
                                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                </button>
                              </div>
                              {copiedField === 'account' && <p className="text-[10px] sm:text-xs text-green-600 font-medium">✓ Copied!</p>}
                            </div>
                          )}
                          
                          {/* Account Name */}
                          {paymentDetails.accountName && (
                            <div>
                              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Account Holder Name</p>
                              <p className="text-xs sm:text-sm bg-white p-2 sm:p-3 rounded font-bold text-gray-900">{paymentDetails.accountName}</p>
                            </div>
                          )}

                          {/* WhatsApp Contact */}
                          {paymentDetails.whatsappNumber && (
                            <div>
                              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Send Payment Proof</p>
                              <a
                                href={`https://wa.me/${paymentDetails.whatsappNumber.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white p-2 sm:p-3 rounded font-medium text-xs sm:text-sm transition-colors w-full"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>WhatsApp: {paymentDetails.whatsappNumber}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Special Instructions */}
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm md:text-base">Special Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={formData.specialInstructions}
                      onChange={(e) =>
                        setFormData({ ...formData, specialInstructions: e.target.value })
                      }
                      placeholder="Any special requests or allergies?"
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md text-xs sm:text-sm"
                      rows={3}
                    />
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 text-xs sm:text-sm md:text-base"
                  disabled={orderProcessing}
                >
                  {orderProcessing ? 'Placing Order...' : 'Place Order'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
