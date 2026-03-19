'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Lightbulb, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-600 transition-colors text-xs sm:text-sm md:text-base font-medium">
            <ArrowLeft className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900">About MealClan</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-16">
        {/* Hero Section */}
        <div className="mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">About MealClan</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl leading-relaxed">
            We're a passionate team dedicated to delivering delicious, freshly prepared meals right to your doorstep. 
            At MealClan, quality and customer satisfaction are at the heart of everything we do.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Story</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
            <div className="order-2 md:order-1">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-4 leading-relaxed">
                MealClan was founded with a simple mission: to make delicious, home-cooked meals accessible to everyone. 
                We started as a small operation and have grown into a trusted name in food delivery and catering services.
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-4 leading-relaxed">
                Every meal we prepare is crafted with care, using the finest ingredients sourced locally whenever possible. 
                Our team of skilled chefs ensures that every order meets our high standards of quality and taste.
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">
                Today, we're proud to serve hundreds of satisfied customers daily, bringing comfort and convenience to your table with exceptional service.
              </p>
            </div>
            <div className="order-1 md:order-2 relative h-56 sm:h-64 md:h-80 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/mealclan.jpeg"
                alt="MealClan Restaurant Storefront"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-12 md:mb-16">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-10">Our Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-base sm:text-lg">Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-xs sm:text-sm text-gray-600">
                Every meal is prepared with the finest ingredients and careful attention to detail.
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-base sm:text-lg">Innovation</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-xs sm:text-sm text-gray-600">
                We constantly innovate to improve our service and bring new, exciting options to our customers.
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-base sm:text-lg">Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-xs sm:text-sm text-gray-600">
                We're committed to supporting our local community and building lasting relationships with customers.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-10 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">Ready to Order?</h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-6 max-w-2xl mx-auto px-4">
            Discover our delicious menu and experience the MealClan difference today.
          </p>
          <Link href="/store">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
              Browse Menu
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
