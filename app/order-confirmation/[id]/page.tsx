'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, MessageCircle } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number; soupOptions?: string[] }>;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  deliveryType: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  createdAt: string;
}

interface Settings {
  whatsappNumber?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const orderRes = await fetch(`${apiUrl}/orders/${orderId}`);
        const orderData = await orderRes.json();

        setOrder(orderData);
        // Set default settings with hardcoded WhatsApp number
        setSettings({
          whatsappNumber: '08038753508',
        });
      } catch (error) {
        console.error('Failed to fetch order data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleCopyWhatsApp = () => {
    if (settings?.whatsappNumber) {
      navigator.clipboard.writeText(settings.whatsappNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppMessage = () => {
    const adminWhatsAppNumber = '08038753508';
    
    // Build detailed order message
    const itemsList = order?.items
      .map((item) => {
        let itemText = `${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`;
        if (item.soupOptions && item.soupOptions.length > 0) {
          itemText += ` (with ${item.soupOptions.join(', ')})`;
        }
        return itemText;
      })
      .join('\n');

    let message = `*Order Confirmation*\n\n`;
    message += `Order #: ${order?.orderNumber}\n`;
    message += `Customer: ${order?.customerName}\n`;
    message += `Phone: ${order?.customerPhone}\n\n`;
    message += `*Items:*\n${itemsList}\n\n`;
    
    if (order?.deliveryAddress) {
      message += `*Delivery Address:*\n${order.deliveryAddress}\n\n`;
    }
    
    message += `*Delivery Type:* ${order?.deliveryType}\n`;
    message += `*Total Amount:* ₦${order?.totalPrice.toLocaleString()}\n`;
    message += `*Payment Method:* ${order?.paymentMethod}\n\n`;
    
    if (order?.specialInstructions) {
      message += `*Special Instructions:*\n${order.specialInstructions}\n\n`;
    }
    
    message += `Please confirm receipt of this order.`;
    
    // Convert Nigerian number format to WhatsApp format (234 is Nigeria's country code)
    const whatsappNumber = adminWhatsAppNumber.startsWith('0') 
      ? '234' + adminWhatsAppNumber.slice(1)
      : adminWhatsAppNumber;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">Order not found</p>
            <Link href="/">
              <Button className="mt-4">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        {/* Success Header */}
        <Card className="mb-4 sm:mb-6 bg-green-50 border-green-200">
          <CardContent className="py-4 sm:py-6 md:py-8 text-center space-y-2 sm:space-y-4">
            <CheckCircle className="w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 text-green-600 mx-auto" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              Your order has been successfully placed and sent to the restaurant.
            </p>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base md:text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Order Number</p>
                <p className="font-semibold text-sm sm:text-base md:text-lg">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Total Amount</p>
                <p className="font-semibold text-sm sm:text-base md:text-lg">₦{order.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Delivery Type</p>
                <p className="font-semibold capitalize text-xs sm:text-sm">{order.deliveryType}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Status</p>
                <p className="font-semibold capitalize text-xs sm:text-sm">{order.status}</p>
              </div>
            </div>

            <div className="border-t pt-2 sm:pt-4">
              <p className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">Items Ordered:</p>
              <ul className="space-y-2 sm:space-y-3">
                {order.items.map((item, idx) => (
                  <li key={idx} className="bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                    <div className="flex justify-between text-[10px] sm:text-xs md:text-sm mb-1">
                      <span className="font-semibold">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    {item.soupOptions && item.soupOptions.length > 0 && (
                      <div className="text-[9px] sm:text-[10px] text-gray-600 mt-1 flex flex-wrap gap-1">
                        <span className="font-medium">Soup Options:</span>
                        <span className="text-green-700 font-semibold">{item.soupOptions.join(', ')}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {order.deliveryAddress && (
              <div className="border-t pt-2 sm:pt-4 mt-2 sm:mt-4">
                <p className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                  <span>📍 Delivery Address</span>
                  <span className="text-[10px] text-gray-500">({order.deliveryType})</span>
                </p>
                <div className="bg-blue-50 p-2 sm:p-3 rounded border border-blue-200">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-800 break-words">{order.deliveryAddress}</p>
                </div>
              </div>
            )}

            {order.specialInstructions && (
              <div className="border-t pt-2 sm:pt-4 mt-2 sm:mt-4">
                <p className="text-xs sm:text-sm font-semibold mb-2">Special Instructions:</p>
                <div className="bg-amber-50 p-2 sm:p-3 rounded border border-amber-200">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-800 break-words">{order.specialInstructions}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base md:text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-4 text-xs sm:text-sm">
            {order.paymentMethod === 'transfer' && (settings?.bankAccountNumber || settings?.bankAccountName) && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 sm:p-4">
                <p className="font-semibold text-blue-900 mb-1 sm:mb-2 text-xs sm:text-sm">Bank Transfer Payment</p>
                <p className="text-[10px] sm:text-xs text-blue-800 mb-2 sm:mb-3">
                  Please transfer ₦{order.totalPrice} to:
                </p>
                <div className="space-y-2">
                  {settings?.bankAccountName && (
                    <div className="bg-white p-2 sm:p-3 rounded border border-blue-200">
                      <p className="text-[8px] sm:text-xs text-gray-600">Account Holder</p>
                      <p className="text-[10px] sm:text-sm font-semibold">{settings.bankAccountName}</p>
                    </div>
                  )}
                  {settings?.bankAccountNumber && (
                    <div className="bg-white p-2 sm:p-3 rounded border border-blue-200 flex items-center gap-2">
                      <p className="text-[9px] sm:text-xs font-mono font-bold flex-1">{settings.bankAccountNumber}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(settings.bankAccountNumber || '');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-blue-600" />
                      </button>
                    </div>
                  )}
                  {copied && <p className="text-[8px] text-green-600">Copied!</p>}
                </div>
                <p className="text-[8px] sm:text-xs text-blue-700 mt-2">
                  Send a screenshot of the receipt to the WhatsApp number below to confirm payment.
                </p>
              </div>
            )}

            {order.paymentMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 sm:p-4">
                <p className="font-semibold text-yellow-900 mb-1 sm:mb-2 text-xs sm:text-sm">Cash on Delivery</p>
                <p className="text-[10px] sm:text-xs text-yellow-800">
                  Please have ₦{order.totalPrice} ready when your order arrives.
                </p>
              </div>
            )}

            <div className="bg-purple-50 border border-purple-200 rounded p-2 sm:p-4 space-y-3">
              <div>
                <p className="font-semibold text-purple-900 mb-1 sm:mb-2 text-xs sm:text-sm">Important: Screenshots Required</p>
                <p className="text-[10px] sm:text-xs text-purple-800">
                  Please take a screenshot of this order confirmation and payment receipt (if applicable), then send both to WhatsApp to confirm your order.
                </p>
              </div>

              <div className="bg-white p-2 sm:p-3 rounded border border-purple-200">
                <p className="font-semibold text-purple-900 mb-1 text-[10px] sm:text-xs">Steps to Confirm:</p>
                <ol className="text-[9px] sm:text-[10px] text-purple-800 space-y-1 list-decimal list-inside">
                  <li>Screenshot this confirmation page</li>
                  <li>Screenshot your payment receipt (if bank transfer)</li>
                  <li>Send both screenshots to our WhatsApp number below</li>
                </ol>
              </div>

              <div>
                <p className="font-semibold text-purple-900 mb-2 text-xs sm:text-sm">Contact Restaurant</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-[10px] sm:text-xs md:text-sm h-9 sm:h-9 md:h-10 w-full"
                    onClick={handleWhatsAppMessage}
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>Send via WhatsApp</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-[10px] sm:text-xs md:text-sm h-9 sm:h-9 md:h-10 w-full"
                    onClick={handleCopyWhatsApp}
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy Number'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
          <Link href="/store" className="w-full">
            <Button variant="outline" className="w-full text-xs sm:text-sm md:text-base h-9 sm:h-10">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button className="w-full text-xs sm:text-sm md:text-base h-9 sm:h-10">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
