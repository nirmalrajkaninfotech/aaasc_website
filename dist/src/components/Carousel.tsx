'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
// Uncomment and use FontAwesome if properly configured
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { CarouselItem } from '@/types';

interface CarouselProps {
  isTamil: boolean;
  items: CarouselItem[];
}

export default function Carousel({ isTamil, items = [] }: CarouselProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageStates, setImageStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  // Filter and sort slides
  const slides = (Array.isArray(items) ? items : [])
    .filter((item: CarouselItem) => item?.published !== false)
    .sort((a: CarouselItem, b: CarouselItem) => (a.order || 0) - (b.order || 0));

  const totalSlides = slides.length;

  // Initialize image states
  useEffect(() => {
    const newImageStates: Record<string, 'loading' | 'loaded' | 'error'> = {};
    slides.forEach(slide => {
      if (imageStates[slide.image] === undefined) {
        newImageStates[slide.image] = 'loading';
      }
    });

    if (Object.keys(newImageStates).length > 0) {
      setImageStates(prev => ({ ...prev, ...newImageStates }));
    }
    // Dependency on stringified slide images for proper re-init  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.map(s => s.image).join(',')]);

  const handleImageLoad = (src: string) => {
    setImageStates(prev => ({ ...prev, [src]: 'loaded' }));
  };

  const handleImageError = (src: string) => {
    setImageStates(prev => ({ ...prev, [src]: 'error' }));
  };

  const nextSlide = useCallback(() => {
    if (totalSlides > 0) {
      setIsTransitioning(true);
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides > 0) {
      setIsTransitioning(true);
      setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
    }
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    if (totalSlides > 0) {
      setIsTransitioning(true);
      setCurrentIndex(index);
    }
  }, [totalSlides]);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalSlides > 0) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
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

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  if (totalSlides === 0) {
    return (
      <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-light">No carousel items available</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
      aria-roledescription="carousel"
      aria-label="Image Carousel"
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const imageState = imageStates[slide.image] || 'loading';
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + totalSlides) % totalSlides;
          const isNext = index === (currentIndex + 1) % totalSlides;

          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                isActive ? 'opacity-100 scale-100 z-10' :
                isPrev ? 'opacity-0 scale-95 -translate-x-full z-0' :
                isNext ? 'opacity-0 scale-95 translate-x-full z-0' :
                'opacity-0 scale-90 z-0'
              }`}
              aria-hidden={!isActive}
            >
              {/* Image Container */}
              <div className="relative w-full h-full">
                {imageState === 'loading' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
                )}
                {imageState === 'error' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span className="text-white text-sm">Image failed to load</span>
                    </div>
                  </div>
                )}

                {/* Proper fallback path for images */}
                {imageState !== 'error' && (
                  <Image
                    src={slide.image.startsWith('/') ? slide.image : `/${slide.image}`}
                    alt={slide.title || 'Carousel image'}
                    fill
                    className="object-cover"
                    onLoadingComplete={() => handleImageLoad(slide.image)}
                    onError={() => handleImageError(slide.image)}
                    priority={index === 0}
                    sizes="100vw"
                  />
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end items-center text-white p-8 sm:p-12 md:p-16">
                <div className="text-center max-w-4xl transform transition-all duration-700 delay-300"
                     style={{
                       opacity: isActive ? 1 : 0,
                       transform: isActive ? 'translateY(0)' : 'translateY(20px)'
                     }}>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                
                  </h2>
                  {slide.description && (
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light opacity-90">
                   
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Left Arrow (fallback to Unicode if FontAwesome fails) */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center focus:outline-none hover:bg-black/75 transition-all duration-300 z-50"
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{ fontSize: '1.75rem', border: '2px solid white' }} // Makes it always visible
      >
        {/* <FontAwesomeIcon icon={faChevronLeft} /> */}
        <span aria-hidden="true">&#x2039;</span>
      </button>

      {/* Right Arrow */}
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center focus:outline-none hover:bg-black/75 transition-all duration-300 z-50"
        onClick={nextSlide}
        aria-label="Next slide"
        style={{ fontSize: '1.75rem', border: '2px solid white' }}
      >
        {/* <FontAwesomeIcon icon={faChevronRight} /> */}
        <span aria-hidden="true">&#x203A;</span>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full focus:outline-none transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125 border border-black' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-white/80 transition-all duration-4000 ease-linear"
          style={{ width: totalSlides > 0 ? `${((currentIndex + 1) / totalSlides) * 100}%` : '0%' }}
        />
      </div>
    </section>
  );
}
