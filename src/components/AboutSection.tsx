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
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ${about.templeAdministration.alignment === 'right' ? 'lg:flex-row-reverse' : ''}`}>
              <div className={about.templeAdministration.image ? (about.templeAdministration.alignment === 'right' ? 'lg:order-1' : 'lg:order-2') : ''}>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{about.templeAdministration.title}</h3>
                <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: about.templeAdministration.content }} />
              </div>
              {about.templeAdministration.image && (
                <div className={`relative h-72 rounded-lg overflow-hidden ${about.templeAdministration.alignment === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
                  <Image src={about.templeAdministration.image} alt={about.templeAdministration.title} fill className="object-cover" />
                </div>
              )}
            </div>
          )}

          {about.secretaryMessage && (
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ${about.secretaryMessage.alignment === 'right' ? 'lg:flex-row-reverse' : ''}`}>
              <div className={about.secretaryMessage.image ? 'lg:order-1' : ''}>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{about.secretaryMessage.title}</h3>
                <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: about.secretaryMessage.content }} />
              </div>
              {about.secretaryMessage.image && (
                <div className={`relative h-72 rounded-lg overflow-hidden ${about.secretaryMessage.alignment === 'right' ? 'lg:order-2' : ''}`}>
                  <Image src={about.secretaryMessage.image} alt={about.secretaryMessage.title} fill className="object-cover" />
                </div>
              )}
            </div>
          )}

          {about.principalMessage && (
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ${about.principalMessage.alignment === 'right' ? 'lg:flex-row-reverse' : ''}`}>
              <div className={about.principalMessage.image ? (about.principalMessage.alignment === 'right' ? 'lg:order-1' : 'lg:order-2') : ''}>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{about.principalMessage.title}</h3>
                <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: about.principalMessage.content }} />
              </div>
              {about.principalMessage.image && (
                <div className={`relative h-72 rounded-lg overflow-hidden ${about.principalMessage.alignment === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
                  <Image src={about.principalMessage.image} alt={about.principalMessage.title} fill className="object-cover" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}