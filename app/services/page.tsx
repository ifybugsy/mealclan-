'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Utensils, TrendingUp, MapPin, Menu, X, Home } from 'lucide-react';

interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

const services: Service[] = [
  {
    id: 1,
    title: 'Restaurants',
    description: 'Experience fine dining at our partner restaurants. Fresh, delicious meals prepared by professional chefs with premium ingredients.',
    image: '/services-restaurant.jpg',
    icon: <Utensils className="w-8 h-8" />,
  },
  {
    id: 2,
    title: 'Food Trays',
    description: 'Perfect for office meetings, gatherings, and small events. Customizable food trays with a variety of dishes to suit all tastes.',
    image: '/services-food-trays.jpg',
    icon: <TrendingUp className="w-8 h-8" />,
  },
  {
    id: 3,
    title: 'Outdoor Catering',
    description: 'Full-service outdoor catering for weddings, birthdays, corporate events, and celebrations. Professional setup and service included.',
    image: '/services-catering.jpg',
    icon: <MapPin className="w-8 h-8" />,
  },
];

export default function ServicesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-28 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="MealClan Logo" width={150} height={150} className="w-auto h-auto max-w-[50px] sm:max-w-[70px] md:max-w-[100px] lg:max-w-[150px]" priority />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2 lg:gap-3 items-center">
            <Link href="/gallery">
              <Button variant="ghost" size="sm" className="text-xs lg:text-sm text-slate-100 hover:text-white hover:bg-slate-800">Gallery</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="text-xs lg:text-sm text-slate-100 hover:text-white hover:bg-slate-800">About</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className="text-xs lg:text-sm text-slate-100 hover:text-white hover:bg-slate-800">Contact</Button>
            </Link>
            <Link href="/services">
              <Button variant="ghost" size="sm" className="text-xs lg:text-sm text-orange-400 hover:text-orange-300 hover:bg-slate-800">Services</Button>
            </Link>
            <Link href="/" className="ml-2">
              <Button size="sm" className="text-xs lg:text-sm bg-slate-700 hover:bg-slate-600 flex items-center gap-2">
                <Home className="w-3 h-3 lg:w-4 lg:h-4" />
                Home
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur border-t border-slate-700">
            <div className="px-2 sm:px-4 py-3 space-y-2 flex flex-col">
              <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-left text-sm text-slate-100 hover:text-white hover:bg-slate-700">Gallery</Button>
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-left text-sm text-slate-100 hover:text-white hover:bg-slate-700">About</Button>
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-left text-sm text-slate-100 hover:text-white hover:bg-slate-700">Contact</Button>
              </Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-left text-sm text-orange-400 hover:text-orange-300 hover:bg-slate-700">Services</Button>
              </Link>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full text-left text-sm bg-slate-700 hover:bg-slate-600 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
        <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 mb-12 md:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Our <span className="text-orange-500">Services</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto">
            From fine dining to catering, we offer comprehensive food services tailored to your needs.
          </p>
        </div>

        {/* Carousel Section */}
        <div className="mb-12 md:mb-20">
          <div className="relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
            {/* Carousel Container */}
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full overflow-hidden">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                    priority={index === currentSlide}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                </div>
              ))}

              {/* Carousel Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur text-white rounded-full p-2 sm:p-3 transition-all duration-200"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur text-white rounded-full p-2 sm:p-3 transition-all duration-200"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'bg-orange-500 w-3 h-3 sm:w-4 sm:h-4'
                        : 'bg-white/40 w-2 h-2 sm:w-3 sm:h-3 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Carousel Content */}
            <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-orange-500 flex-shrink-0">{services[currentSlide].icon}</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                    {services[currentSlide].title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-300">
                    {services[currentSlide].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`bg-slate-800/50 backdrop-blur border rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:border-orange-500 ${
                index === currentSlide ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-700'
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-orange-500 flex-shrink-0">{service.icon}</div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">{service.title}</h3>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 line-clamp-2">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Book Service Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-6 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Ready to Order?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-orange-50 max-w-2xl mx-auto">
            Book your service today and let us take care of your food needs. Contact us for customized packages and special requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-orange-600 hover:bg-orange-50 text-sm sm:text-base">
                Book a Service
              </Button>
            </Link>
            <Link href="/store" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-orange text-sm sm:text-base">
                Order Meals Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
