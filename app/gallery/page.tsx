'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventDate: string;
}

// Static gallery data with example images
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Professional Event Presentation',
    description: 'Elegant catering presentation with beautifully styled serving platters and professional staff.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1698.JPG-ik8xjIod3vJpGPrLVtUBeAzI5QVPJV.jpeg',
    eventDate: '2024-03-20',
  },
  {
    id: '2',
    title: 'Professional Food Service',
    description: 'MealClan staff serving delicious food with professionalism and care at a corporate event.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1696.JPG-NW4vRdbJwjknjyLKqHxGPs5Rd5eBJC.jpeg',
    eventDate: '2024-03-18',
  },
  {
    id: '3',
    title: 'Event Staff Excellence',
    description: 'Our dedicated team in branded uniforms ensuring excellent service at MealClan events.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1697.JPG-mhySDCQiqDGFJWUONDhyLNWX9e3w0B.jpeg',
    eventDate: '2024-03-19',
  },
  {
    id: '4',
    title: 'Guest Experience Highlight',
    description: 'Satisfied guests enjoying premium catering and beautifully presented dishes at our event.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1700.JPG-jv0VwMTBkZ8qQDH2LrryO8Ktj1zwV7.jpeg',
    eventDate: '2024-03-17',
  },
  {
    id: '5',
    title: 'Full Event Setup',
    description: 'A grand catering event with elegantly decorated tables, premium lighting, and professional service.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1694.JPG-eVzKkxUQpXPyBvqjK9v05BD8lTAuS4.jpeg',
    eventDate: '2024-03-16',
  },
  {
    id: '6',
    title: 'Evening Reception',
    description: 'Guests enjoying a vibrant catering event with beautiful ambiance and quality food service.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1664.JPG-VI4xXGeHO81Jks3eJm2MidGpgZHYaQ.jpeg',
    eventDate: '2024-03-15',
  },
  {
    id: '7',
    title: 'Elegant Venue Decoration',
    description: 'Professional event setup with stunning decorations, perfect lighting, and premium table arrangements.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1689.JPG-ROl9xb4MPOu4SjyB5cqpORS5uqrba0.jpeg',
    eventDate: '2024-03-14',
  },
  {
    id: '8',
    title: 'Staff Team Showcase',
    description: 'Our professional catering team in action, delivering exceptional service with style and elegance.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1716.JPG-S28gMBL2HOIcRURfpWy4jnPJ4PksQa.jpeg',
    eventDate: '2024-03-13',
  },
  {
    id: '9',
    title: 'Grand Event Atmosphere',
    description: 'An impressive venue setup with guests enjoying premium catering services at a sophisticated event.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1692.JPG-DsnSnXwMnsjF5b5W5AtQE93g3LR6TC.jpeg',
    eventDate: '2024-03-12',
  },
  {
    id: '10',
    title: 'Guest Celebration Moment',
    description: 'Happy guests capturing memories while enjoying our premium catering experience at the event.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_E1713.JPG-FiTk88V6CmDricQFE5a0oMGlGqkHex.jpeg',
    eventDate: '2024-03-11',
  },
];

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

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
          <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">Gallery</h1>
        </div>
      </nav>

      {/* Modal for selected item */}
      {selectedItem && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <div className="relative w-full h-48 sm:h-64 md:h-96 lg:h-[500px]">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white rounded-full w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center hover:bg-opacity-75 text-xs sm:text-base"
              >
                ✕
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{selectedItem.title}</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-4">{selectedItem.description}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                Event Date: {new Date(selectedItem.eventDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">MealClan Events</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Explore our past events, celebrations, and memorable moments from our community</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {galleryItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-gray-200">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-2 sm:p-3 md:p-4">
                <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">{item.description}</p>
                <p className="text-[9px] sm:text-xs text-gray-500">
                  {new Date(item.eventDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
