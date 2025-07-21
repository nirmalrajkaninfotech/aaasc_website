import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface CarouselProps {
  isTamil: boolean;
  activeSlide: number;
  setActiveSlide: (index: number | ((prev: number) => number)) => void;
}

export default function Carousel({ isTamil, activeSlide, setActiveSlide }: CarouselProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [localIndex, setLocalIndex] = useState(1);

  const slides = [
    {
      id: 1,
      image: '/img/1.jpg',
      title: isTamil 
        ? 'நாடுகள் கடந்தாலும், நம்ம தையல் கலாச்சாரம் கடந்ததில்லை – திருப்பூர் வாழ்க' 
        : 'Even as the years pass, our tailoring tradition remains timeless – Long live Tiruppur.',
      description: ''
    },

  ];

  const totalSlides = slides.length;
  const extendedSlides = [slides[totalSlides - 1], ...slides, slides[0]];

  const nextSlide = useCallback(() => {
    if (!transitioning) {
      setTransitioning(true);
      setLocalIndex((prev) => prev + 1);
    }
  }, [transitioning]);

  const prevSlide = useCallback(() => {
    if (!transitioning) {
      setTransitioning(true);
      setLocalIndex((prev) => prev - 1);
    }
  }, [transitioning]);

  const goToSlide = useCallback((index: number) => {
    setTransitioning(true);
    setLocalIndex(index + 1); // Because of the cloned first slide
  }, []);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 1000);
  }, [nextSlide]);

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
      setActiveSlide(totalSlides - 1); // Update activeSlide to last slide
    } else if (localIndex === totalSlides + 1) {
      setLocalIndex(1);
      setActiveSlide(0); // Update activeSlide to first slide
    } else {
      // Update activeSlide for all other cases
      setActiveSlide(localIndex - 1);
    }
  };

  // Update activeSlide whenever localIndex changes
  useEffect(() => {
    if (localIndex > 0 && localIndex <= totalSlides) {
      setActiveSlide(localIndex - 1);
    }
  }, [localIndex, setActiveSlide, totalSlides]);

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
        {extendedSlides.map((slide, index) => (
          <div
            key={`${slide.id}-${index}`}
            className="w-full h-full flex-shrink-0 relative"
            style={{ minWidth: '100%' }}
            aria-hidden={localIndex !== index}
          >
            <img
              src={slide.image}
              alt={slide.title || `Slide ${((index - 1 + totalSlides) % totalSlides) + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            {(slide.title || slide.description) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 text-white">
                {slide.title && (
                  <h3
                    className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 md:mb-4"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {slide.title}
                  </h3>
                )}
                {slide.description && (
                  <p
                    className="text-sm sm:text-base md:text-lg"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                  >
                    {slide.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center z-10"
        aria-label={isTamil ? 'முந்தைய ஸ்லைடு' : 'Previous slide'}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center z-10"
        aria-label={isTamil ? 'அடுத்த ஸ்லைடு' : 'Next slide'}
      >
        <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => {
          // Calculate if this dot should be active
          const isActive = localIndex === index + 1 || 
                         (localIndex === 0 && index === totalSlides - 1) || // First clone case
                         (localIndex === totalSlides + 1 && index === 0);   // Last clone case
          
          return (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ring-1 ring-white/50 transition-all duration-300 ${
                isActive ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={isTamil ? `ஸ்லைடு ${index + 1} க்கு செல்ல` : `Go to slide ${index + 1}`}
              aria-current={isActive ? 'true' : 'false'}
            />
          );
        })}
      </div>
    </section>
  );
}