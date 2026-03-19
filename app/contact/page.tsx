'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    // Use hardcoded WhatsApp number for admin
    // Fallback to API if needed in the future
    const adminWhatsAppNumber = '08038753508';
    setWhatsappNumber(adminWhatsAppNumber);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (whatsappNumber) {
      const message = `Hi, I have a question about MealClan. ${formData.message || 'Please get in touch with me.'}`;
      // Convert Nigerian number format to WhatsApp format (234 is Nigeria's country code)
      const convertedNumber = whatsappNumber.startsWith('0') 
        ? '234' + whatsappNumber.slice(1)
        : whatsappNumber;
      const whatsappUrl = `https://wa.me/${convertedNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast.error('WhatsApp number not available. Please try the contact form instead.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-28 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 text-xs sm:text-sm md:text-base">
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Back Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Contact Us</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="text-sm md:text-base"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="text-sm md:text-base"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                  className="text-sm md:text-base"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  required
                  rows={5}
                  className="text-sm md:text-base"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full md:w-auto text-sm md:text-base">
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 flex gap-4">
                  <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">123 Food Street, Lagos, Nigeria</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex gap-4">
                  <Phone className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+234 (800) 123-4567</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex gap-4">
                  <Mail className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">hello@mealclan.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4 mb-4">
                    <MessageCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                      <p className="text-gray-600 text-sm mb-4">Chat with us directly on WhatsApp for quick responses</p>
                      <Button onClick={handleWhatsAppContact} className="w-full text-white bg-green-600 hover:bg-green-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>Monday - Friday: 9:00 AM - 10:00 PM</li>
                  <li>Saturday: 10:00 AM - 11:00 PM</li>
                  <li>Sunday: 11:00 AM - 9:00 PM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
