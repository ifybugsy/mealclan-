'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Lightbulb, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-28 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 text-xs sm:text-sm md:text-base">
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Back Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">About Us</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-16">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 md:mb-6">About MealClan</h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl">
            We're a passionate team dedicated to delivering delicious, freshly prepared meals right to your doorstep. 
            At MealClan, quality and customer satisfaction are at the heart of everything we do.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Story</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
            <div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                MealClan was founded with a simple mission: to make delicious, home-cooked meals accessible to everyone. 
                We started as a small operation and have grown into a trusted name in food delivery.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Every meal we prepare is crafted with care, using the finest ingredients sourced locally whenever possible. 
                Our team of skilled chefs ensures that every order meets our high standards of quality and taste.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to serve hundreds of satisfied customers daily, bringing comfort and convenience to your table.
              </p>
            </div>
            <div className="relative h-64 md:h-80 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600565193566-f889b9b6e959?w=400&h=400&fit=crop"
                alt="MealClan Kitchen"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-12 md:mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Our Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Heart className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <CardTitle>Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                Every meal is prepared with the finest ingredients and careful attention to detail.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Lightbulb className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                We constantly innovate to improve our service and bring new, exciting options to our customers.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                We're committed to supporting our local community and building lasting relationships with customers.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 md:py-16 bg-gray-50 rounded-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ready to Order?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Discover our delicious menu and experience the MealClan difference today.
          </p>
          <Link href="/store">
            <Button size="lg">Browse Menu</Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
