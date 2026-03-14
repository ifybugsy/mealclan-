'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, Plus, Minus, Copy, MessageCircle } from 'lucide-react';

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
  const [paymentDetails, setPaymentDetails] = useState<{ accountNumber?: string; accountName?: string; whatsappNumber?: string }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/settings`);
        const settings = await response.json();
        setPaymentDetails({
          accountNumber: settings.bankAccountNumber || '',
          accountName: settings.bankAccountName || '',
          whatsappNumber: settings.whatsappNumber || '',
        });
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
      }
    };

    fetchPaymentDetails();
  }, []);

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
        deliveryAddress: selectedDelivery === 'delivery' ? formData.deliveryAddress : null,
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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-28 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 text-xs sm:text-sm md:text-base">
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Back to Menu</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="MealClan Logo" width={80} height={80} className="w-auto h-auto max-w-[45px] sm:max-w-[60px] md:max-w-[80px]" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3 md:space-y-4">
            {cart.length === 0 ? (
              <Card>
                <CardContent className="text-center py-6 sm:py-8">
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Your cart is empty</p>
                  <Link href="/store">
                    <Button size="sm" className="text-xs sm:text-sm">Browse Menu</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              cart.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base line-clamp-2">{item.name}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600">₦{item.price} each</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-0.5">
                        Subtotal: ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4 w-full sm:w-auto">
                      <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item._id, Math.max(1, item.quantity - 1))
                          }
                          className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 p-0"
                        >
                          <Minus className="w-2.5 sm:w-3 md:w-4 h-2.5 sm:h-3 md:h-4" />
                        </Button>
                        <span className="font-semibold w-4 sm:w-5 md:w-6 text-center text-xs sm:text-sm md:text-base">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 p-0"
                        >
                          <Plus className="w-2.5 sm:w-3 md:w-4 h-2.5 sm:h-3 md:h-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 p-0"
                      >
                        <Trash2 className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
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
                          setFormData({ ...formData, customerPhone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, customerEmail: e.target.value })
                        }
                        required
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
                        onChange={(e) => setSelectedDelivery(e.target.value)}
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
                            setFormData({ ...formData, deliveryAddress: e.target.value })
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
                      <div className="space-y-2 sm:space-y-3 bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                        {paymentDetails.accountNumber && (
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">Account Number</p>
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white p-1.5 sm:p-2 rounded">
                              <span className="text-xs sm:text-sm font-mono font-bold flex-1">{paymentDetails.accountNumber}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(paymentDetails.accountNumber || '');
                                  setCopiedField('account');
                                  setTimeout(() => setCopiedField(null), 2000);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Copy account number"
                              >
                                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                              </button>
                            </div>
                            {copiedField === 'account' && <p className="text-[10px] text-green-600">Copied!</p>}
                          </div>
                        )}
                        
                        {paymentDetails.accountName && (
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">Account Name</p>
                            <p className="text-xs sm:text-sm bg-white p-1.5 sm:p-2 rounded font-semibold">{paymentDetails.accountName}</p>
                          </div>
                        )}

                        {paymentDetails.whatsappNumber && (
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">Send Payment Proof</p>
                            <a
                              href={`https://wa.me/${paymentDetails.whatsappNumber.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 sm:gap-2 bg-green-500 hover:bg-green-600 text-white p-1.5 sm:p-2 rounded text-xs sm:text-sm font-medium transition-colors"
                            >
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>WhatsApp: {paymentDetails.whatsappNumber}</span>
                            </a>
                          </div>
                        )}
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
