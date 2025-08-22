'use client';

import Link from 'next/link';
import { SiteSettings } from '@/types';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

interface FooterProps {
  siteSettings: SiteSettings | null | undefined;
}

// Function to get the appropriate icon based on the social media platform
const getSocialIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('facebook')) return <FaFacebook className="w-5 h-5" />;
  if (lowerLabel.includes('instagram')) return <FaInstagram className="w-5 h-5" />;
  if (lowerLabel.includes('twitter')) return <FaTwitter className="w-5 h-5" />;
  if (lowerLabel.includes('linkedin')) return <FaLinkedin className="w-5 h-5" />;
  return null; // Default case
};

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
                className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 hover:scale-110 transform transition-transform duration-200"
                title={link.label}
              >
                {getSocialIcon(link.label)}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}