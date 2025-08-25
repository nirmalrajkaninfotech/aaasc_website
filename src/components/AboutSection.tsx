'use client';

import Image from 'next/image';
import { AboutSection as AboutSectionType } from '@/types';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const committeeStyles = `
  .committee-content .grid { gap: 1rem !important; }
  .committee-content .grid > div { max-width: 280px !important; width: 100% !important; }
  .committee-content .grid img { width: 80px !important; height: 80px !important; object-fit: cover !important; }
  .committee-content .grid h4 { font-size: 0.875rem !important; margin-bottom: 0.25rem !important; }
  .committee-content .grid p { font-size: 0.75rem !important; margin-bottom: 0.25rem !important; }
  .committee-content .grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important; }
`;

interface AboutSectionProps { about: AboutSectionType; }

export default function AboutSection({ about }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    console.log('AboutSection data:', { title: about.title, image: about.image, hasImage: !!about.image, content: about.content?.substring(0, 100) + '...', stats: about.stats });
  }, [about]);

  useEffect(() => {
    if (about.galleryEnabled !== false) setActiveTab('gallery');
    else if (about.committee) setActiveTab('committee');
    else if (about.templeAdministration) setActiveTab('temple');
    else if (about.secretaryMessage) setActiveTab('secretary');
    else if (about.principalMessage) setActiveTab('principal');
    else if (about.extraSections && about.extraSections.length > 0) setActiveTab('extra:0');
    else setActiveTab('gallery');
  }, [about]);

  const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <style>{committeeStyles}</style>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">{about.title}</motion.h1>
          {about.masterCaption && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{about.masterCaption}</motion.p>
          )}
        </div>

        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 inline-flex flex-wrap gap-2 mx-auto">
            {about.galleryEnabled !== false && (<TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon="🖼️">Gallery</TabButton>)}
            {about.committee && (<TabButton active={activeTab === 'committee'} onClick={() => setActiveTab('committee')} icon="👥">Committee</TabButton>)}
            {about.templeAdministration && (<TabButton active={activeTab === 'temple'} onClick={() => setActiveTab('temple')} icon="🏛️">Temple Administration</TabButton>)}
            {about.secretaryMessage && (<TabButton active={activeTab === 'secretary'} onClick={() => setActiveTab('secretary')} icon="📝">Secretary</TabButton>)}
            {about.principalMessage && (<TabButton active={activeTab === 'principal'} onClick={() => setActiveTab('principal')} icon="🎓">Principal</TabButton>)}
            {about.extraSections && about.extraSections.map((sec, idx) => (<TabButton key={`extra-${idx}`} active={activeTab === `extra:${idx}`} onClick={() => setActiveTab(`extra:${idx}`)} icon="✨">{sec.title || `Section ${idx + 1}`}</TabButton>))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {about.galleryEnabled !== false && activeTab === 'gallery' && (
            <motion.div key="gallery" variants={fadeInUp} initial="initial" animate="animate" exit="exit"><GallerySection images={about.images} /></motion.div>
          )}

          {activeTab.startsWith('extra:') && about.extraSections && (() => {
            const idx = parseInt(activeTab.split(':')[1] || '0', 10);
            const sec = about.extraSections[idx];
            if (!sec) return null;
            return (<motion.div key={`extra-${idx}`} variants={fadeInUp} initial="initial" animate="animate" exit="exit"><ContentSection section={sec} /></motion.div>);
          })()}

          {['committee', 'temple', 'secretary', 'principal'].map(tabName => {
            const sectionKey = tabName === 'temple' ? 'templeAdministration' : tabName === 'secretary' ? 'secretaryMessage' : tabName === 'principal' ? 'principalMessage' : tabName;
            if (activeTab === tabName && about[sectionKey as keyof AboutSectionType]) {
              const sectionData = about[sectionKey as keyof AboutSectionType] as any;
              const isTemple = tabName === 'temple';
              const isSecretary = tabName === 'secretary';
              return (
                <motion.div key={tabName} variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="w-full flex justify-center">
                  <div className={isTemple ? 'w-full max-w-4xl' : isSecretary ? 'w-full max-w-lg' : 'w-full'}>
                    <ContentSection section={{ ...sectionData, title: isTemple ? 'Temple Administration' : sectionData.title, alignment: isTemple ? 'center' : sectionData.alignment }} isSecretary={isSecretary} />
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

function TabButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: string }) {
  return (
    <button onClick={onClick} className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${active ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'}`}>
      <span className="text-sm">{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
      {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10" />}
    </button>
  );
}

function GallerySection({ images }: { images?: Array<{ url: string; caption?: string; subtitle?: string }> }) {
  if (!images || images.length === 0) return (<div className="text-center py-20"><div className="text-6xl mb-4">🖼️</div><h3 className="text-2xl font-semibold text-gray-400 mb-2">No Images Yet</h3><p className="text-gray-500">Gallery images will appear here once added.</p></div>);
  return (
    <motion.div animate="animate" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((img, idx) => (
        <motion.div key={`${img.url}-${idx}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -5 }} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="relative w-full h-48 rounded-lg overflow-hidden cursor-zoom-in">
            <Zoom>
              <Image src={img.url} alt={img.caption || `Gallery image ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
            </Zoom>
          </div>
          {(img.caption || img.subtitle) && (<div className="p-4">{img.caption && <h4 className="font-semibold text-gray-800 mb-1">{img.caption}</h4>}{img.subtitle && <p className="text-sm text-gray-500">{img.subtitle}</p>}</div>)}
        </motion.div>
      ))}
    </motion.div>
  );
}

function ContentSection({ section, isSecretary = false }: { section: { title: string; content: string; image?: string; alignment?: string; images?: Array<{ url: string; caption?: string; subtitle?: string }>; }; isSecretary?: boolean; }) {
  if (isSecretary) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-lg mx-auto">
        {section.image && (
          <div className="relative w-full h-80 flex items-center justify-center">
            <Image src={section.image} alt={section.title} fill className="object-contain" />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h3>
          <div className="prose max-w-none text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: section.content }} />
        </div>
      </motion.div>
    );
  }

  const isCenteredSection = section.title === 'Temple Administration' || section.title === 'Management Committee';
  return (
    <div className={`grid grid-cols-1 ${isCenteredSection ? 'max-w-3xl mx-auto' : 'lg:grid-cols-2'} gap-4 items-start`}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
        <div className={`bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/20 ${isCenteredSection ? 'text-center' : ''}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
            {section.title}
          </h3>
          <div className={`prose max-w-none text-gray-700 leading-snug text-sm ${section.title.includes('Committee') ? 'committee-content' : ''}`} dangerouslySetInnerHTML={{ __html: section.content }} />
        </div>

        {section.images && section.images.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {section.images.map((img, i) => (
              <div key={i} className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white/5 backdrop-blur-md">
                <div className="relative w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-600/90 to-blue-800/90">
                  <div className="relative w-4/5 h-4/5">
                    <Image src={img.url} alt={img.caption || `${section.title} image ${i + 1}`} fill className="object-contain transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                </div>
                {(img.caption || img.subtitle) && (<div className="p-3 bg-white">{img.caption && <div className="text-base font-medium text-gray-800">{img.caption}</div>}{img.subtitle && <div className="text-sm text-gray-600">{img.subtitle}</div>}</div>)}
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {section.image && !isCenteredSection && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative">
          <div className="relative rounded-3xl shadow-xl overflow-hidden flex items-center w-[500px] h-[400px]">
            <div className="relative w-[500px] h-[500px]">
              <Image src={section.image} alt={section.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-4 transition-transform duration-700 hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          <div className="absolute -z-10 -bottom-4 -left-4 w-full h-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl" />
        </motion.div>
      )}
    </div>
  );
}
