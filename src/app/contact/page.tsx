import React from 'react';
import { getSiteSettings } from '@/lib/api-utils';
import { ContactSettings } from '@/types';
import ContactForm from '@/components/ContactForm';

export default async function ContactPage() {
  const siteSettings = await getSiteSettings();

  // Build map iframe src
  const apiKey = siteSettings.contact?.googleMapsApiKey || '';
  const embedQuery = siteSettings.contact?.googleMapsEmbedQuery || '';
  const hasEmbedApi = Boolean(apiKey && embedQuery);
  const mapsUrl = siteSettings.contact?.googleMapsUrl || '';
  let iframeSrc = '';

  if (hasEmbedApi) {
    iframeSrc = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
      apiKey!
    )}&q=${encodeURIComponent(embedQuery!)}`;
  } else if (mapsUrl) {
    if (mapsUrl.includes('/maps/embed')) {
      iframeSrc = mapsUrl;
    } else if (mapsUrl.includes('google.com/maps')) {
      const url = new URL(mapsUrl);
      url.searchParams.set('output', 'embed');
      iframeSrc = url.toString();
    } else {
      const addressFallback = siteSettings.contact?.address ?? '1600 Amphitheatre Parkway, Mountain View, CA';
      iframeSrc = `https://www.google.com/maps?q=${encodeURIComponent(addressFallback)}&output=embed`;
    }
  } else {
    const addressFallback = siteSettings.contact?.address ?? '1600 Amphitheatre Parkway, Mountain View, CA';
    iframeSrc = `https://www.google.com/maps?q=${encodeURIComponent(addressFallback)}&output=embed`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-8 sm:py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">Contact Us</h1>
            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
              We'd love to hear from you. Get in touch with our team for any inquiries or support.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-4 sm:p-6 md:p-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-1 h-6 sm:h-8 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Get in Touch</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-blue-50 p-3 rounded-full flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-1">Address</h3>
                      <p className="text-gray-600 text-sm leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                        {siteSettings.contact?.address || '123 University Avenue\nCollege Town, ST 12345'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-blue-50 p-3 rounded-full flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-1">Phone</h3>
                      <a href={`tel:${siteSettings.contact?.phone || '5551234567'}`} className="text-blue-600 hover:text-blue-800 transition-colors text-sm">
                        {siteSettings.contact?.phone || '(555) 123-4567'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-blue-50 p-3 rounded-full flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-1">Email</h3>
                      <a href={`mailto:${siteSettings.contact?.email || 'info@university.edu'}`} className="text-blue-600 hover:text-blue-800 transition-colors text-sm">
                        {siteSettings.contact?.email || 'info@university.edu'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-blue-50 p-3 rounded-full flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-1">Office Hours</h3>
                      <p className="text-gray-600 text-sm leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                        {siteSettings.contact?.officeHours || 'Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <ContactForm />
            </div>

            <div className="mt-8 sm:mt-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-1 h-6 sm:h-8 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Find Us</h2>
              </div>
              <div className="relative w-full">
                <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-md border border-gray-100">
                  <iframe
                    title="Google Map"
                    src={iframeSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
              {!hasEmbedApi && (
                <p className="text-xs text-gray-500 mt-1">
                  Tip: For better map display, add API key in site settings.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
