'use client';

import Image from 'next/image';
import { AboutSection as AboutSectionType } from '@/types';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface AboutSectionProps {
  about: AboutSectionType;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    console.log('AboutSection data:', {
      title: about.title,
      image: about.image,
      hasImage: !!about.image,
      content: about.content?.substring(0, 100) + '...',
      stats: about.stats
    });
  }, [about]);

  useEffect(() => {
    // Set the first available tab as active
    if (about.galleryEnabled !== false) {
      setActiveTab('gallery');
    } else if (about.committee) {
      setActiveTab('committee');
    } else if (about.templeAdministration) {
      setActiveTab('temple');
    } else if (about.secretaryMessage) {
      setActiveTab('secretary');
    } else if (about.principalMessage) {
      setActiveTab('principal');
    } else if (about.extraSections && about.extraSections.length > 0) {
      setActiveTab('extra:0');
    } else {
      setActiveTab('gallery');
    }
  }, [about]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            {about.title}
          </motion.h1>
          {about.masterCaption && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              {about.masterCaption}
            </motion.p>
          )}
        </div>

        {/* Professional Tab Navigation */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200">
            {about.galleryEnabled !== false && (
              <TabButton 
                active={activeTab === 'gallery'} 
                onClick={() => setActiveTab('gallery')}
                icon="📷"
              >
                Gallery
              </TabButton>
            )}
            
            {about.committee && (
              <TabButton 
                active={activeTab === 'committee'} 
                onClick={() => setActiveTab('committee')}
                icon="👥"
              >
                Committee
              </TabButton>
            )}
            
            {about.templeAdministration && (
              <TabButton 
                active={activeTab === 'temple'} 
                onClick={() => setActiveTab('temple')}
                icon="🏛️"
              >
                Temple Administration
              </TabButton>
            )}
            
            {about.secretaryMessage && (
              <TabButton 
                active={activeTab === 'secretary'} 
                onClick={() => setActiveTab('secretary')}
                icon="📋"
              >
                Secretary Message
              </TabButton>
            )}
            
            {about.principalMessage && (
              <TabButton 
                active={activeTab === 'principal'} 
                onClick={() => setActiveTab('principal')}
                icon="🎓"
              >
                Principal Message
              </TabButton>
            )}
            
            {about.extraSections && about.extraSections.map((sec, idx) => (
              <TabButton
                key={`extra-${idx}`}
                active={activeTab === `extra:${idx}`}
                onClick={() => setActiveTab(`extra:${idx}`)}
                icon="📄"
              >
                {sec.title || `Section ${idx + 1}`}
              </TabButton>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Gallery Tab */}
          {about.galleryEnabled !== false && activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <GallerySection images={about.images} />
            </motion.div>
          )}

          {/* Dynamic Content Sections */}
          {activeTab.startsWith('extra:') && about.extraSections && (() => {
            const idx = parseInt(activeTab.split(':')[1] || '0', 10);
            const sec = about.extraSections[idx];
            if (!sec) return null;
            return (
              <motion.div
                key={`extra-${idx}`}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ContentSection section={sec} />
              </motion.div>
            );
          })()}

          {/* Standard Sections */}
          {['committee', 'temple', 'secretary', 'principal'].map(tabName => {
            const sectionKey = tabName === 'temple' ? 'templeAdministration' : 
                              tabName === 'secretary' ? 'secretaryMessage' :
                              tabName === 'principal' ? 'principalMessage' : tabName;
            
            if (activeTab === tabName && about[sectionKey as keyof AboutSectionType]) {
              const sectionData = about[sectionKey as keyof AboutSectionType] as any;
              
              return (
                <motion.div
                  key={tabName}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <ContentSection 
                    section={{
                      ...sectionData,
                      title: tabName === 'temple' ? 'Temple Administration' : 
                             tabName === 'secretary' ? 'Secretary Message' :
                             tabName === 'principal' ? 'Principal Message' : sectionData.title,
                      sectionType: tabName
                    }} 
                  />
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

// Professional Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  children, 
  icon 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-2 border-b-2
        ${active 
          ? 'text-blue-600 border-blue-600 bg-blue-50' 
          : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300 hover:bg-gray-100'
        }
      `}
    >
      <span className="text-sm">{icon}</span>
      <span className="whitespace-nowrap text-sm font-medium">{children}</span>
    </button>
  );
}

// Enhanced Professional Gallery Section
function GallerySection({ images }: { images?: Array<{ url: string; caption?: string; subtitle?: string }> }) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
        <div className="text-5xl mb-4 opacity-40">📷</div>
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Images Available</h3>
        <p className="text-gray-500">Gallery images will appear here once added.</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={staggerContainer}
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {images.map((img, idx) => (
        <motion.div
          key={`${img.url}-${idx}`}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <div className="relative w-full h-48 overflow-hidden cursor-zoom-in">
            <Zoom>
              <Image 
                src={img.url} 
                alt={img.caption || `Gallery image ${idx + 1}`} 
                fill 
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </Zoom>
          </div>
          {(img.caption || img.subtitle) && (
            <div className="p-4 border-t border-gray-100">
              {img.caption && (
                <h4 className="font-semibold text-gray-900 mb-1 text-sm leading-tight">{img.caption}</h4>
              )}
              {img.subtitle && (
                <p className="text-xs text-gray-600 leading-relaxed">{img.subtitle}</p>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Instagram-style Profile Card Component
function InstagramProfileCard({ 
  image, 
  title, 
  subtitle, 
  description 
}: { 
  image: string; 
  title: string; 
  subtitle?: string; 
  description: string; 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Profile Header */}
      <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        <div className="relative w-64 h-64 mx-auto mb-6">
          <div className="absolute inset-0 rounded-xl overflow-hidden shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-300">
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  priority
                />
              </div>
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.8),0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
          </div>
          {/* Decorative elements */}
          <div className="absolute -z-10 w-64 h-64 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 blur-sm opacity-90" />
        </div>
        
        {/* Profile Info */}
        {subtitle && (
          <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
        )}
        
        {/* Instagram-style stats */}
        <div className="flex justify-center gap-6 text-center">
       
       
        </div>
      </div>
      
      {/* Description */}
      <div className="p-6">
        <div 
          className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
      
    </motion.div>
  );
}

// Professional Content Section Component with Instagram-style Secretary
function ContentSection({ section }: { 
  section: { 
    title: string; 
    content: string; 
    image?: string; 
    alignment?: string;
    images?: Array<{ url: string; caption?: string; subtitle?: string }>;
    sectionType?: string;
  } 
}) {
  const isCommitteeSection = section.title === 'Committee' || section.title === 'Management Committee';
  const isSecretarySection = section.sectionType === 'secretary';
  const isPrincipalSection = section.sectionType === 'principal';
  
  // Instagram-style layout for Secretary and Principal
  if ((isSecretarySection || isPrincipalSection) && section.image) {
    return (
      <div className="flex justify-center py-8">
        <InstagramProfileCard
          image={section.image}
          title={section.title}
          subtitle={isPrincipalSection ? "Principal" : "Secretary"}
          description={section.content}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
          {section.title}
        </h2>
      </div>

      <div className="p-8">
        {isCommitteeSection && section.images && section.images.length > 0 ? (
          /* Committee Grid Layout */
          <div className="space-y-8">
            {/* Committee Images Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {section.images.map((img, idx) => (
                <div key={idx} className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.caption || `Committee member ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  {(img.caption || img.subtitle) && (
                    <div className="p-4 bg-white border-t border-gray-100">
                      {img.caption && (
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm leading-tight">{img.caption}</h4>
                      )}
                      {img.subtitle && (
                        <p className="text-xs text-gray-600 leading-relaxed">{img.subtitle}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Committee Content */}
            {section.content && section.content.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        ) : (
          /* Standard Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Column */}
            <div className="space-y-6">
              {section.content && section.content.trim() !== '' && (
                <div 
                  className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}

              {/* Additional Images Grid */}
              {section.images && section.images.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {section.images.map((img, idx) => (
                    <div key={idx} className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                      <div className="relative w-full h-40 overflow-hidden">
                        <Image 
                          src={img.url} 
                          alt={img.caption || `${section.title} image ${idx + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      {(img.caption || img.subtitle) && (
                        <div className="p-3 bg-white border-t border-gray-100">
                          {img.caption && (
                            <h4 className="font-medium text-gray-900 mb-1 text-sm leading-tight">{img.caption}</h4>
                          )}
                          {img.subtitle && (
                            <p className="text-xs text-gray-600 leading-relaxed">{img.subtitle}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Main Image Column */}
            {section.image && !isSecretarySection && !isPrincipalSection && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:sticky lg:top-8"
              >
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="relative w-full h-96 flex items-center justify-center">
                    <Image 
                      src={section.image} 
                      alt={section.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-6 transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};
