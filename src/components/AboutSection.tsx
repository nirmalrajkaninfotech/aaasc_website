'use client';

import Image from 'next/image';
import { AboutSection as AboutSectionType } from '@/types';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// CSS styles for committee member cards
const committeeStyles = `
  .committee-content .grid {
    gap: 1rem !important;
  }
  .committee-content .grid > div {
    max-width: 280px !important;
    width: 100% !important;
  }
  .committee-content .grid img {
    width: 80px !important;
    height: 80px !important;
    object-fit: cover !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
  }
  .committee-content .grid img:hover {
    transform: scale(1.05) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
  }
  .committee-content .grid h4 {
    font-size: 0.875rem !important;
    margin-bottom: 0.25rem !important;
  }
  .committee-content .grid p {
    font-size: 0.75rem !important;
    margin-bottom: 0.25rem !important;
  }
  .committee-content .grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  }
`;

interface AboutSectionProps {
  about: AboutSectionType;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('');

  // Debug logging to see what data is being passed
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
      setActiveTab('gallery'); // Default fallback
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
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <style>{committeeStyles}</style>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4"
          >
            {about.title}
          </motion.h1>
          {about.masterCaption && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              {about.masterCaption}
            </motion.p>
          )}
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 inline-flex flex-wrap gap-2 mx-auto">
            {about.galleryEnabled !== false && (
              <TabButton 
                active={activeTab === 'gallery'} 
                onClick={() => setActiveTab('gallery')}
                icon="🖼️"
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
                icon="📝"
              >
                Secretary
              </TabButton>
            )}
            
            {about.principalMessage && (
              <TabButton 
                active={activeTab === 'principal'} 
                onClick={() => setActiveTab('principal')}
                icon="🎓"
              >
                Principal
              </TabButton>
            )}
            
            {about.extraSections && about.extraSections.map((sec, idx) => (
              <TabButton
                key={`extra-${idx}`}
                active={activeTab === `extra:${idx}`}
                onClick={() => setActiveTab(`extra:${idx}`)}
                icon="✨"
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
              const isTemple = tabName === 'temple';
              
              return (
                <motion.div
                  key={tabName}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`w-full ${isTemple ? 'flex justify-center' : ''}`}
                >
                  <div className={isTemple ? 'w-full max-w-4xl' : 'w-full'}>
                    <ContentSection 
                      section={{
                        ...sectionData,
                        title: isTemple ? 'Temple Administration' : sectionData.title,
                        alignment: isTemple ? 'center' : sectionData.alignment
                      }} 
                    />
                  </div>
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

// Enhanced Tab Button Component
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
        relative px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
        ${active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
        }
      `}
    >
      <span className="text-sm">{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10"
        />
      )}
    </button>
  );
}

// Enhanced Gallery Section
function GallerySection({ images }: { images?: Array<{ url: string; caption?: string; subtitle?: string }> }) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🖼️</div>
        <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Images Yet</h3>
        <p className="text-gray-500">Gallery images will appear here once added.</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={staggerContainer}
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {images.map((img, idx) => (
        <motion.div
          key={`${img.url}-${idx}`}
          variants={{
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 }
          }}
          whileHover={{ y: -5 }}
          className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="relative w-full h-48 rounded-lg overflow-hidden cursor-zoom-in">
            {/* Modern overlay for better visual appeal */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
            
            <Zoom>
              <Image 
                src={img.url} 
                alt={img.caption || `Gallery image ${idx + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-100 group-hover:brightness-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </Zoom>
            
            {/* Modern glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {(img.caption || img.subtitle) && (
            <div className="p-4 bg-gradient-to-b from-white to-gray-50/50">
              {img.caption && (
                <h4 className="font-semibold text-gray-800 mb-1">{img.caption}</h4>
              )}
              {img.subtitle && (
                <p className="text-sm text-gray-500">{img.subtitle}</p>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Enhanced Content Section Component
function ContentSection({ section }: { 
  section: { 
    title: string; 
    content: string; 
    image?: string; 
    alignment?: string;
    images?: Array<{ url: string; caption?: string; subtitle?: string }>;
  } 
}) {
  const isCenteredSection = section.title === 'Temple Administration' || section.title === 'Management Committee';
  const isCommitteeSection = section.title === 'Committee' || section.title === 'Management Committee';
  
  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="w-full lg:w-1/2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
        {/* Only show title and content if it's not a committee section or if there's actual content */}
        {(!isCommitteeSection || (section.content && section.content.trim() !== '')) && (
          <div className={`bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/20 ${isCenteredSection ? 'text-center' : ''}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              {section.title}
            </h3>
            {section.content && section.content.trim() !== '' && (
              <div 
                className={`prose max-w-none text-gray-700 leading-snug text-sm ${
                  isCommitteeSection ? 'committee-content' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        )}
        
        {/* Committee Section Layout - Only for 'Committee' section */}
        {section.title === 'Committee' ? (
          <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Title with decorative gradient accent */}
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-2 relative inline-block">
                {section.title}
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
              </h3>
            </div>

            {/* Single centered image with modern styling */}
            {section.images && section.images.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="group relative w-full max-w-md h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                  {/* Modern gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" />
                  
                  {/* Glass morphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  
                  <Image
                    src={section.images[0].url}
                    alt={section.images.caption || section.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-100 group-hover:brightness-110 contrast-100 group-hover:contrast-105"
                    sizes="(max-width: 768px) 90vw, 40vw"
                  />
                  
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 shadow-inner rounded-2xl" />
                </div>
              </motion.div>
            )}

            {/* Content below image */}
            {section.content && section.content.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="prose prose-sm md:prose-base max-w-3xl mx-auto px-4 text-gray-700"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        ) : (
          /* Original layout for non-Committee sections with modern image styling */
          <div className="mt-4 w-full space-y-3">
            {section.images && section.images.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {section.images.slice(0, 2).map((img, i) => (
                  <div key={i} className={`group relative rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
                    isCommitteeSection ? 'w-64 md:w-80' : 'w-56 md:w-64'
                  }`}>
                    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden bg-white/90 backdrop-blur-sm">
                      {/* Subtle noise texture */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`
                        }}
                      />
                      
                      {/* Subtle hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative w-4/5 h-4/5 transform group-hover:scale-110 transition-transform duration-500">
                        <Image 
                          src={img.url} 
                          alt={img.caption || `${section.title} image ${i+1}`}
                          fill
                          className="object-contain transition-all duration-300 group-hover:scale-105 filter brightness-100 group-hover:brightness-110 drop-shadow-lg group-hover:drop-shadow-2xl"
                          sizes="(max-width: 768px) 40vw, 20vw"
                        />
                      </div>
                      
                      {/* Subtle inner glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                    </div>
                    {(img.caption || img.subtitle) && (
                      <div className="p-3 bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-sm">
                        {img.caption && <div className="text-base font-medium text-gray-800">{img.caption}</div>}
                        {img.subtitle && <div className="text-sm text-gray-600">{img.subtitle}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Remaining images in vertical layout with modern styling */}
            {section.images && section.images.length > 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`space-y-4 ${
                  isCommitteeSection 
                    ? 'max-w-2xl mx-auto' 
                    : 'max-w-lg mr-auto ml-0 mt-8'
                }`}
              >
                {section.images.slice(2).map((img, i) => (
                  <div key={i + 2} className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    isCommitteeSection ? 'w-64 md:w-80' : 'w-64 md:w-72'
                  }`}>
                    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-white/90 backdrop-blur-sm">
                      {/* Subtle noise texture */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`
                        }}
                      />
                      
                      {/* Subtle hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Subtle border */}
                      <div className="absolute inset-0 border border-white/30 rounded-xl" />
                      
                      <div className="relative w-4/5 h-4/5 z-10">
                        <Image 
                          src={img.url} 
                          alt={img.caption || `${section.title} image ${i+3}`}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-105 filter brightness-110 contrast-105 drop-shadow-xl"
                          sizes="(max-width: 768px) 40vw, 20vw"
                        />
                      </div>
                      
                      {/* Inner glow effect */}
                      <div className="absolute inset-4 bg-gradient-to-br from-white/10 to-transparent rounded-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
                    </div>
                    {(img.caption || img.subtitle) && (
                      <div className="p-3 bg-gradient-to-b from-white via-gray-50/95 to-gray-100/90 backdrop-blur-sm">
                        {img.caption && <div className="text-base font-medium text-gray-800">{img.caption}</div>}
                        {img.subtitle && <div className="text-sm text-gray-600">{img.subtitle}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
        </motion.div>
      </div>
      
      {section.image && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 lg:sticky lg:top-4"
        >
          <div className="group relative rounded-3xl shadow-2xl overflow-hidden flex items-center w-[500px] h-[400px] bg-white/90 backdrop-blur-sm">
            {/* Subtle noise texture */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`
              }}
            />
            
            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Subtle border */}
            <div className="absolute inset-0 border border-white/30 rounded-3xl" />
            
            <div className="relative w-[500px] h-[500px] z-10">
              <Image 
                src={section.image} 
                alt={section.title}
                fill
                sizes="(max-width: 68px) 50vw, 50vw"
                className="object-contain p-4 transition-all duration-700 group-hover:scale-105 filter brightness-105 contrast-105 drop-shadow-2xl"
              />
            </div>
            
            {/* Modern overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          </div>
          
          {/* Subtle shadow effect */}
          <div className="absolute -z-10 -bottom-4 -left-4 w-full h-full bg-gray-100 rounded-3xl blur-xl opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
        </motion.div>
      )}
    </div>
  );
}

// Helper for stagger animations
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
