'use client';

import Link from 'next/link';
import { SiteSettings } from '@/types';

interface FooterProps {
  siteSettings: SiteSettings | null | undefined;
}

export default function Footer({ siteSettings }: FooterProps) {
  if (!siteSettings) {
    return null;
  }
  const footer = siteSettings.footer;
  if (!footer) {
    return null;
  }
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-300">{footer.text}</p>
          </div>
          
          <div className="flex space-x-6">
            {footer.socialLinks?.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}