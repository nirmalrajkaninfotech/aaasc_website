'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useAnimation } from 'framer-motion';
import { AlumniSection as AlumniSectionType } from '@/types';

interface AlumniSectionProps {
  alumni: AlumniSectionType;
}

export default function AlumniSection({ alumni }: AlumniSectionProps) {
  const publishedItems = (alumni.items || [])
    .filter(item => item.published)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {alumni.title}
          </h2>
          <p className="text-xl text-gray-600">{alumni.subtitle}</p>
        </motion.div>

        <motion.div 
          className="space-y-16"
          variants={container}
          ref={ref}
          initial="hidden"
          animate={controls}
        >
          {publishedItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`flex flex-col ${
                item.alignment === 'center' 
                  ? 'items-center text-center' 
                  : 'lg:flex-row items-center gap-8 ' + 
                    (item.alignment === 'right' || index % 2 === 1 ? 'lg:flex-row-reverse' : '')
              }`}
              variants={item as any} // Temporary type assertion to fix the error
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {item.image && (
                <motion.div 
                  className={`${item.alignment === 'center' ? 'w-full max-w-2xl mb-8' : 'lg:w-1/2'} group`}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                  </div>
                </motion.div>
              )}

              <motion.div
                className={`${item.alignment === 'center' ? 'w-full max-w-4xl' : 'lg:w-1/2'} ${
                  item.alignment === 'center'
                    ? 'text-center mx-auto'
                    : item.alignment === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                <motion.h3 
                  className="text-2xl font-bold text-gray-800 mb-4 relative inline-block"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <span className="relative">
                    {item.title}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </motion.h3>
                <motion.div
                  className="text-gray-600 prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                  initial={{ opacity: 0.9 }}
                  whileHover={{ 
                    opacity: 1,
                    x: 2,
                    transition: { duration: 0.3 }
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
