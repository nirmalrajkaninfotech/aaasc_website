'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { CarouselItem } from '@/types';
import { getImageUrl } from '@/config';

interface CarouselProps {
  isTamil: boolean;
  items: CarouselItem[];
}

export default function Carousel({ isTamil, items = [] }: CarouselProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [localIndex, setLocalIndex] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageStates, setImageStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  // Filter published items, sort by order, and ensure proper URLs
  const slides = (Array.isArray(items) ? items : [])
    .filter((item: CarouselItem) => item?.published !== false)
    .map(item => {
      // Get the image URL, using the direct path as it's already in the public directory
      const imagePath = item.image.startsWith('/') ? item.image : `/${item.image}`;
      return {
        ...item,
        image: imagePath, // Store the path relative to public directory
        title: item.title || item.caption || '',
        description: item.description || item.link || ''
      };
    })
    .sort((a: CarouselItem, b: CarouselItem) => (a.order || 0) - (b.order || 0));

  const totalSlides = slides.length;
  const extendedSlides = totalSlides > 0 
    ? [slides[totalSlides - 1], ...slides, slides[0]]
    : [];

  // Initialize image states - only update when slides change
  useEffect(() => {
    const newImageStates: Record<string, 'loading' | 'loaded' | 'error'> = {};
    let needsUpdate = false;
    
    // Check if we have new images that aren't in our state yet
    const newImages: string[] = [];
    
    slides.forEach(slide => {
      // The image URL is already resolved in the slides mapping
      if (imageStates[slide.image] === undefined) {
        newImageStates[slide.image] = 'loading';
        newImages.push(slide.image);
        needsUpdate = true;
      } else {
        newImageStates[slide.image] = imageStates[slide.image];
      }
    });

    // Only update state if we have new images to track
    if (needsUpdate) {
      console.log('📷 New images detected:', newImages);
      console.log('🔄 Current image states:', imageStates);
      setImageStates(prev => ({
        ...prev,
        ...newImageStates
      }));
    }
  }, [slides.map(s => s.image).join()]); // Only re-run when image URLs change

  const handleImageLoad = (src: string) => {
    console.log('✅ Image loaded successfully:', src);
    setImageStates(prev => {
      console.log('🔄 Updating state: image', src, 'loaded');
      return { ...prev, [src]: 'loaded' };
    });
  };

  const handleImageError = (src: string) => {
    console.error('❌ Failed to load image:', src);
    setImageStates(prev => {
      console.log('🔄 Updating state: image', src, 'error');
      return { ...prev, [src]: 'error' };
    });
  };

  const nextSlide = useCallback(() => {
    if (!transitioning && totalSlides > 0) {
      setTransitioning(true);
      setLocalIndex((prev) => prev + 1);
    }
  }, [transitioning, totalSlides]);

  const prevSlide = useCallback(() => {
    if (!transitioning && totalSlides > 0) {
      setTransitioning(true);
      setLocalIndex((prev) => prev - 1);
    }
  }, [transitioning, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    if (totalSlides > 0) {
      setTransitioning(true);
      setLocalIndex(index + 1); // Because of the cloned first slide
    }
  }, [totalSlides]);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalSlides > 0) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 5000); // 5 seconds per slide
    }
  }, [nextSlide, totalSlides]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  const handleTransitionEnd = () => {
    setTransitioning(false);
    if (localIndex === 0) {
      setLocalIndex(totalSlides);
      setActiveSlide(totalSlides - 1);
    } else if (localIndex === totalSlides + 1) {
      setLocalIndex(1);
      setActiveSlide(0);
    } else {
      setActiveSlide(localIndex - 1);
    }
  };

  useEffect(() => {
    if (localIndex > 0 && localIndex <= totalSlides) {
      setActiveSlide(localIndex - 1);
    }
  }, [localIndex, totalSlides]);

  // If no slides, show placeholder
  if (totalSlides === 0) {
    return (
      <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 flex items-center justify-center text-white">
        <p className="text-xl">No carousel items available</p>
      </section>
    );
  }

  return (
    <section
      className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 overflow-hidden shadow-2xl"
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
      aria-roledescription="carousel"
      aria-label="Image Carousel"
    >
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${localIndex * 100}%)`, transition: transitioning ? 'transform 0.7s ease' : 'none' }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, index) => {
          const imageState = imageStates[slide.image] || 'loading';
          return (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              {imageState === 'loading' && (
                <div className="absolute inset-0 bg-gray-700 animate-pulse" />
              )}
              {imageState === 'error' && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <span className="text-white">Failed to load image</span>
                </div>
              )}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  onLoadingComplete={() => handleImageLoad(slide.image)}
                  onError={() => handleImageError(slide.image)}
                  priority={index === 0} // Only preload the first image
                  unoptimized={process.env.NODE_ENV !== 'production'}
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
                  {slide.title}
                </h2>
                {slide.description && (
                  <p className="text-base sm:text-lg md:text-xl text-center max-w-3xl">
                    {slide.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center focus:outline-none hover:bg-opacity-75 transition-opacity"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center focus:outline-none hover:bg-opacity-75 transition-opacity"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full focus:outline-none ${index === activeSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeSlide ? 'true' : 'false'}
          />
        ))}
      </div>
    </section>
  );
}