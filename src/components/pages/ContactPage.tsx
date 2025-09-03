'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/api-utils';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const site = await getSiteSettings();
      setContact(site?.contact || null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact info...</p>
        </div>
      </div>
    );
  }

  const mapSrc = contact?.mapUrl || (contact?.address ? `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed` : null);

  const handleCopy = async () => {
    if (!mapSrc) return;
    try {
      await navigator.clipboard.writeText(mapSrc);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-10">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 mb-6">We'd love to hear from you.</p>
          <ul className="space-y-2 text-gray-700">
            {contact?.address && <li><strong>Address:</strong> {contact.address}</li>}
            {contact?.phone && <li><strong>Phone:</strong> {contact.phone}</li>}
            {contact?.email && <li><strong>Email:</strong> {contact.email}</li>}
          </ul>
        </div>

        <ContactForm />
      </div>

      {mapSrc && (
        <div className="container mx-auto px-4 mt-10">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="flex items-center justify-end px-4 py-3 border-b">
              <button
                onClick={handleCopy}
                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded"
                aria-label="Copy map "
                title="Copy map "
              >
                {copied ? 'Copied' : 'Copy Map URL'}
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={mapSrc}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Location map"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}