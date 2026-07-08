'use client';

import Image from 'next/image';
import { AboutSection as AboutSectionType } from '@/types';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AboutSectionProps {
  about: AboutSectionType;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    setActiveTab('overview');
  }, [about]);

  const fadeInUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  return (
    <section className="py-6 md:py-8 bg-[var(--theme-bg)] w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Compact header + tabs in one row on desktop */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 md:mb-6">
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[24px] md:text-[28px] font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
            >
              {about.title}
            </motion.h1>
            {about.masterCaption && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[13px] md:text-[14px] font-normal text-[var(--theme-text-secondary)] max-w-2xl mx-auto lg:mx-0 leading-snug mt-1"
              >
                {about.masterCaption}
              </motion.p>
            )}
          </div>

          {/* Tab Navigation - wraps, no huge vertical gap */}
          <div className="bg-[var(--theme-bg-card)]/70 backdrop-blur-sm rounded-xl p-1.5 shadow-md border border-[var(--theme-border)] inline-flex flex-wrap gap-1.5 mx-auto lg:mx-0">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📋">
              Overview
            </TabButton>

            {about.galleryEnabled !== false && (
              <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon="🖼️">
                Gallery
              </TabButton>
            )}

            {about.committee && (
              <TabButton active={activeTab === 'committee'} onClick={() => setActiveTab('committee')} icon="👥">
                Committee
              </TabButton>
            )}

            {about.templeAdministration && (
              <TabButton active={activeTab === 'temple'} onClick={() => setActiveTab('temple')} icon="🏛️">
                Temple Admin
              </TabButton>
            )}

            {about.secretaryMessage && (
              <TabButton active={activeTab === 'secretary'} onClick={() => setActiveTab('secretary')} icon="📝">
                Secretary
              </TabButton>
            )}

            {about.principalMessage && (
              <TabButton active={activeTab === 'principal'} onClick={() => setActiveTab('principal')} icon="🎓">
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

        {/* Tab Content — capped height with internal scroll instead of pushing the page down */}
        <div className="max-h-[70vh] md:max-h-[640px] overflow-y-auto pr-1 -mr-1 scroll-smooth">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-start"
              >
                <motion.div variants={staggerContainer} animate="animate" className="space-y-4">
                  <motion.div variants={fadeInUp} className="prose max-w-none">
                    <div
                      className="text-[var(--theme-text)] text-[15px] leading-relaxed line-clamp-[10] lg:line-clamp-none"
                      dangerouslySetInnerHTML={{ __html: about.content }}
                    />
                  </motion.div>

                  {/* Compact inline stats instead of big cards */}
                  <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
                    {about.stats.map((stat, index) => (
                      <StatChip key={index} stat={stat} index={index} />
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeInUp} className="relative">
                  <div className="relative h-48 sm:h-56 md:h-72 rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src={about.image}
                      alt="About us"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -z-10 -top-3 -right-3 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl" />
                </motion.div>
              </motion.div>
            )}

            {/* Gallery Tab */}
            {about.galleryEnabled !== false && activeTab === 'gallery' && (
              <motion.div key="gallery" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                <GallerySection images={about.images} />
              </motion.div>
            )}

            {/* Dynamic Content Sections */}
            {activeTab.startsWith('extra:') && about.extraSections && (() => {
              const idx = parseInt(activeTab.split(':')[1] || '0', 10);
              const sec = about.extraSections[idx];
              if (!sec) return null;
              return (
                <motion.div key={`extra-${idx}`} variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                  <ContentSection section={sec} isPortrait={false} />
                </motion.div>
              );
            })()}

            {/* Standard Sections */}
            {['committee', 'temple', 'secretary', 'principal'].map(tabName => {
              const sectionKey = tabName === 'temple' ? 'templeAdministration' :
                                tabName === 'secretary' ? 'secretaryMessage' :
                                tabName === 'principal' ? 'principalMessage' : tabName;

              const isPortrait = tabName === 'secretary' || tabName === 'principal';

              if (activeTab === tabName && about[sectionKey as keyof AboutSectionType]) {
                return (
                  <motion.div key={tabName} variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                    <ContentSection
                      section={about[sectionKey as keyof AboutSectionType] as any}
                      isPortrait={isPortrait}
                    />
                  </motion.div>
                );
              }
              return null;
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Compact Tab Button Component
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
        relative px-3 md:px-4 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-[13px]
        ${active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
          : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg-card)]/50 font-medium'
        }
      `}
    >
      <span className="text-[13px]">{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg -z-10"
        />
      )}
    </button>
  );
}

// Compact Stat Chip Component (replaces the tall StatCard grid)
function StatChip({ stat, index }: { stat: { value: string; label: string }; index: number }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 }
      }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-2 bg-[var(--theme-bg-card)]/80 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-[var(--theme-border)]"
    >
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {stat.value}
      </span>
      <span className="text-[var(--theme-text-secondary)] font-medium text-[11px] uppercase tracking-wide">
        {stat.label}
      </span>
    </motion.div>
  );
}

// Enhanced Gallery Section
function GallerySection({ images }: { images?: Array<{ url: string; caption?: string; subtitle?: string }> }) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">🖼️</div>
        <h3 className="text-xl font-semibold text-gray-400 mb-1">No Images Yet</h3>
        <p className="text-[var(--theme-text-secondary)] text-sm">Gallery images will appear here once added.</p>
      </div>
    );
  }

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.04 } }
  };

  return (
    <motion.div
      variants={staggerContainer}
      animate="animate"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
    >
      {images.map((img, idx) => (
        <motion.div
          key={`${img.url}-${idx}`}
          variants={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 }
          }}
          whileHover={{ y: -3 }}
          className="group relative bg-[var(--theme-bg-card)] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
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
            <div className="p-2">
              {img.caption && (
                <h4 className="font-semibold text-[var(--theme-text)] text-[12px] line-clamp-1">{img.caption}</h4>
              )}
              {img.subtitle && (
                <p className="text-[11px] text-[var(--theme-text-secondary)] line-clamp-1">{img.subtitle}</p>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Compact Content Section Component
function ContentSection({ section, isPortrait = false }: {
  section: {
    title: string;
    content: string;
    image?: string;
    alignment?: string;
    images?: Array<{ url: string; caption?: string; subtitle?: string }>;
  };
  isPortrait?: boolean;
}) {
  return (
    <div className={`grid grid-cols-1 ${section.image ? 'lg:grid-cols-2' : ''} gap-4 lg:gap-6 items-start ${
      section.alignment === 'right' ? 'lg:flex-row-reverse' : ''
    }`}>
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className={section.image ? (section.alignment === 'right' ? 'lg:order-1' : 'lg:order-2') : ''}
      >
        <div className="bg-[var(--theme-bg-card)]/70 backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-md border border-[var(--theme-border)]">
          <h3 className="text-[20px] md:text-[22px] font-semibold text-[var(--theme-text)] mb-2.5 flex items-center gap-2.5">
            <span className="w-1 h-6 md:h-7 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
            {section.title}
          </h3>
          <div
            className="prose max-w-none text-[14px] md:text-[15px] leading-relaxed text-white/80 font-normal"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </div>

        {section.images && section.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5"
          >
            {section.images.map((img, i) => (
              <div key={`${img.url}-${i}`} className="group relative bg-[var(--theme-bg-card)] rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-0.5 ring-1 ring-white/5 hover:ring-white/20">
                <div className="relative aspect-square w-full shrink-0">
                  <Image
                    src={img.url}
                    alt={img.caption || `${section.title} image ${i + 1}`}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {(img.caption || img.subtitle) && (
                  <div className="p-1.5 text-center bg-[var(--theme-bg-card)]/30 border-t border-[var(--theme-border)]/50">
                    {img.caption && <div className="text-[11px] font-semibold text-[var(--theme-text)] line-clamp-1">{img.caption}</div>}
                    {img.subtitle && <div className="text-[10px] font-normal text-[var(--theme-text-secondary)] mt-0.5 line-clamp-1">{img.subtitle}</div>}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {section.image && (
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className={`relative ${section.alignment === 'right' ? 'lg:order-2' : 'lg:order-1'} ${isPortrait ? 'flex justify-center w-full' : ''}`}
        >
          <div className={`relative ${isPortrait ? 'w-full max-w-[220px] aspect-square md:aspect-[4/5]' : 'w-full h-40 sm:h-52 lg:h-64'} rounded-xl overflow-hidden shadow-lg`}>
            <Image
              src={section.image}
              alt={section.title}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          <div className={`absolute -z-10 -bottom-2 -left-2 ${isPortrait ? 'w-full max-w-[220px] aspect-square md:aspect-[4/5]' : 'w-full h-full'} bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-xl`} />
        </motion.div>
      )}
    </div>
  );
}