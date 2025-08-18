'use client';

import Image from 'next/image';
import { AboutSection as AboutSectionType } from '@/types';

interface AboutSectionProps {
  about: AboutSectionType;
}

export default function AboutSection({ about }: AboutSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {about.title}
            </h2>
            <div
              className="prose max-w-none text-gray-700 mb-8"
              dangerouslySetInnerHTML={{ __html: about.content }}
            />
            
            <div className="grid grid-cols-2 gap-6">
              {about.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={about.image}
              alt="About us"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Optional Subsections */}
        <div className="mt-16 space-y-16">
          {about.committee && (
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ${about.committee.alignment === 'right' ? 'lg:flex-row-reverse' : ''}`}>
              <div className={about.committee.image ? 'lg:order-1' : ''}>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{about.committee.title}</h3>
                <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: about.committee.content }} />
              </div>
              {about.committee.image && (
                <div className={`relative h-72 rounded-lg overflow-hidden ${about.committee.alignment === 'right' ? 'lg:order-2' : ''}`}>
                  <Image src={about.committee.image} alt={about.committee.title} fill className="object-cover" />
                </div>
              )}
            </div>
          )}

          {about.templeAdministration && (
            <div className="space-y-8">
              <div className="text-center" data-aos="fade-up" data-aos-duration="800">
                <h2 className="text-3xl font-bold text-gray-800 mb-4 relative inline-block">
                  {about.templeAdministration.title}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-blue-500 rounded-full"></span>
                </h2>
              </div>
              
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${about.templeAdministration.alignment === 'right' ? 'lg:flex-row-reverse' : ''}`} data-aos="fade-up" data-aos-duration="800">
                <div className={`relative p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: about.templeAdministration.content }} />
                </div>
                
                {about.templeAdministration.images && about.templeAdministration.images.length > 0 && (
                  <div className="space-y-8">
                    {about.templeAdministration.images.map((imgData, index) => {
                      const isObj = typeof imgData === 'object';
                      const img = isObj ? (imgData as any).url : (imgData as string);
                      const alignment = isObj ? ((imgData as any).alignment || 'left') : 'left';
                      const caption = isObj ? (imgData as any).caption : undefined;
                      const subCaption = isObj ? (imgData as any).subCaption : undefined;
                      const hasText = Boolean(caption || subCaption);

                      return (
                        <div
                          key={index}
                          className={`flex flex-col ${hasText ? (alignment === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row') : ''} gap-6 items-start`}
                        >
                          <div className={`relative w-full ${hasText ? 'lg:w-1/2' : 'lg:w-full'} h-80 rounded-xl overflow-hidden group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                            <Image
                              src={img}
                              alt={`${about.templeAdministration.title} ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              sizes={hasText ? '(max-width: 1024px) 100vw, 50vw' : '100vw'}
                            />
                            {caption && (
                              <span className="absolute top-3 right-3 z-20 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-600 text-white shadow">
                                {caption}
                              </span>
                            )}
                          </div>
                          {hasText && (
                            <div className="lg:w-1/2">
                              {subCaption && (
                                <h4 className="text-lg font-semibold text-gray-900 leading-tight">{subCaption}</h4>
                              )}
                              {caption && (
                                <p className="text-sm text-blue-600 mt-1">{caption}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {about.secretaryMessage && (
            <div 
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${about.secretaryMessage.alignment === 'right' ? 'lg:flex-row-reverse' : ''}`}
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay="200"
            >
              <div 
                className={`relative p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  about.secretaryMessage.image 
                    ? (about.secretaryMessage.alignment === 'right' ? 'lg:order-1' : 'lg:order-2') 
                    : ''
                }`}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 relative inline-block">
                  {about.secretaryMessage.title}
                  <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-blue-500 rounded-full transform origin-left transition-all duration-300 group-hover:w-full"></span>
                </h3>
                <div 
                  className="prose max-w-none text-gray-700 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: about.secretaryMessage.content }} 
                />
              </div>
              {about.secretaryMessage.image && (
                <div 
                  className={`relative h-80 rounded-xl overflow-hidden group ${
                    about.secretaryMessage.alignment === 'right' ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  <Image 
                    src={about.secretaryMessage.image} 
                    alt={about.secretaryMessage.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          )}

          {about.principalMessage && (
            <div 
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${about.principalMessage.alignment === 'right' ? 'lg:flex-row-reverse' : ''}`}
              data-aos="fade-up"
              data-aos-duration="800"
            >
              <div 
                className={`relative p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  about.principalMessage.image 
                    ? (about.principalMessage.alignment === 'right' ? 'lg:order-1' : 'lg:order-2') 
                    : ''
                }`}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 relative inline-block">
                  {about.principalMessage.title}
                  <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-blue-500 rounded-full transform origin-left transition-all duration-300 group-hover:w-full"></span>
                </h3>
                <div 
                  className="prose max-w-none text-gray-700 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: about.principalMessage.content }} 
                />
              </div>
              {about.principalMessage.image && (
                <div 
                  className={`relative h-80 rounded-xl overflow-hidden group ${
                    about.principalMessage.alignment === 'right' ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  <Image 
                    src={about.principalMessage.image} 
                    alt={about.principalMessage.title} 
                    fill 
                    className="object-contain transition-transform duration-700 group-hover:scale-105" 
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}