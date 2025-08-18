'use client';

import React, { useState, useEffect } from 'react';

import { SiteSettings } from '@/types';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/site');
      if (res.ok) {
        const data: SiteSettings = await res.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!siteSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load site settings</div>
      </div>
    );
  }

  // Build an embeddable maps URL using the Embed API if apiKey + query are available
  const apiKey = siteSettings.contact?.googleMapsApiKey;
  const embedQuery = siteSettings.contact?.googleMapsEmbedQuery; // e.g., "123 University Ave, College Town"
  const hasEmbedApi = Boolean(apiKey && embedQuery);

  // Fallback: try to convert a share link/contact.googleMapsUrl to embeddable URL
  // If googleMapsUrl is like https://maps.app.goo.gl/...   or https://www.google.com/maps/place/...  
  // we try to use the "output=embed" pattern.
  const mapsUrl = siteSettings.contact?.googleMapsUrl;
  let iframeSrc = '';

  if (hasEmbedApi) {
    // Embed API URL:
    // https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=QUERY
    iframeSrc = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
      apiKey!
    )}&q=${encodeURIComponent(embedQuery!)}`;
  } else if (mapsUrl) {
    // Attempt to transform common Google Maps URLs into embeddable format
    // Priority: if it's already an embed URL, just use it.
    if (mapsUrl.includes('/maps/embed')) {
      iframeSrc = mapsUrl;
    } else if (mapsUrl.includes('google.com/maps')) {
      // Append output=embed safely
      const url = new URL(mapsUrl);
      // Some links might already have params; ensure output=embed
      url.searchParams.set('output', 'embed');
      iframeSrc = url.toString();
    } else {
      // As a last resort, create a search embed with the raw address string (if address exists)
      const addressFallback =
        siteSettings.contact?.address ?? '1600 Amphitheatre Parkway, Mountain View, CA';
      iframeSrc = `https://www.google.com/maps?q=${encodeURIComponent(addressFallback)}&output=embed`;
    }
  } else {
    // No URL provided; fallback to address if available, else to a generic location
    const addressFallback =
      siteSettings.contact?.address ?? '1600 Amphitheatre Parkway, Mountain View, CA';
    iframeSrc = `https://www.google.com/maps?q=${encodeURIComponent(addressFallback)}&output=embed`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
   
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">We'd love to hear from you. Get in touch with our team for any inquiries or support.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Get in Touch</h2>
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
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8 lg:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold text-gray-800">Send us a Message</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-800">Find Us</h2>
              </div>
              <div className="w-full h-80 rounded-xl overflow-hidden shadow-md border border-gray-100">
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