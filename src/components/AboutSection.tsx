'use client';

import Image from 'next/image';
import { AboutSection as AboutSectionType } from '@/types';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    setActiveTab('overview');
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
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon="📋"
            >
              Overview
            </TabButton>
            
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <motion.div variants={staggerContainer} animate="animate" className="space-y-8">
                <motion.div variants={fadeInUp} className="prose max-w-none">
                  <div 
                    className="text-gray-700 text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: about.content }}
                  />
                </motion.div>
                
                {/* Enhanced Stats */}
                <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-6">
                  {about.stats.map((stat, index) => (
                    <StatCard key={index} stat={stat} index={index} />
                  ))}
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="relative"
              >
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={about.image}
                    alt="About us"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl" />
              </motion.div>
            </motion.div>
          )}

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

// Enhanced Stat Card Component
function StatCard({ stat, index }: { stat: { value: string; label: string }; index: number }) {
  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
        className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
      >
        {stat.value}
      </motion.div>
      <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
        {stat.label}
      </div>
    </motion.div>
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
          <div className="relative aspect-square">
            <Image 
              src={img.url} 
              alt={img.caption || `Gallery image ${idx + 1}`} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {(img.caption || img.subtitle) && (
            <div className="p-4">
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
  
  return (
    <div className={`grid grid-cols-1 ${isCenteredSection ? 'max-w-3xl mx-auto' : 'lg:grid-cols-2'} gap-4 items-start ${
      section.alignment === 'right' ? 'lg:flex-row-reverse' : ''
    }`}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={section.image && !isCenteredSection ? (section.alignment === 'right' ? 'lg:order-1' : 'lg:order-2') : 'w-full'}
      >
        <div className={`bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/20 ${isCenteredSection ? 'text-center' : ''}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
            {section.title}
          </h3>
          <div 
            className={`prose max-w-none text-gray-700 leading-snug text-sm ${
              section.title === 'Committee' || section.title === 'Management Committee' 
                ? 'committee-content' 
                : ''
            }`}
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </div>
        
        {section.images && section.images.length > 0 && (
          <div className="mt-4 w-full max-w-5xl mx-auto space-y-3">
            {/* First two images side by side */}
            {section.images.length >= 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {section.images.slice(0, 2).map((img, i) => (
                  <div key={i} className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 w-56 md:w-64 bg-white/5 backdrop-blur-md">
                    <div className="relative w-full h-40 flex items-center justify-center bg-gradient-to-br from-blue-600/90 to-blue-800/90">
                      <div className="relative w-4/5 h-4/5">
                        <Image 
                          src={img.url} 
                          alt={img.caption || `${section.title} image ${i+1}`}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 40vw, 20vw"
                        />
                      </div>
                    </div>
                    {(img.caption || img.subtitle) && (
                      <div className="p-3 bg-white">
                        {img.caption && <div className="text-base font-medium text-gray-800">{img.caption}</div>}
                        {img.subtitle && <div className="text-sm text-gray-600">{img.subtitle}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Remaining images in vertical layout */}
            {section.images.length > 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 max-w-lg ml-[380px] mt-8"
              >
                {section.images.slice(2).map((img, i) => (
                  <div key={i + 2} className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 w-64 md:w-72 bg-white/5 backdrop-blur-md">
                    <div className="relative w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-600/90 to-blue-800/90">
                      <div className="relative w-4/5 h-4/5">
                        <Image 
                          src={img.url} 
                          alt={img.caption || `${section.title} image ${i+3}`}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 40vw, 20vw"
                        />
                      </div>
                    </div>
                    {(img.caption || img.subtitle) && (
                      <div className="p-3 bg-white">
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
      
      {section.image && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`relative ${section.alignment === 'right' ? 'lg:order-2' : 'lg:order-1'}`}
        >
          <div className="relative rounded-3xl shadow-xl overflow-hidden  flex items-center  w-[500px] h-[400px]">
            <div className="relative w-[500px] h-[500px]">
              <Image 
                src={section.image} 
                alt={section.title}
                fill
                sizes="(max-width: 68px) 50vw, 50vw"
                className="object-contain p-4 transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          <div className="absolute -z-10 -bottom-4 -left-4 w-full h-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl" />
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
