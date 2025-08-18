'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SiteSettings } from '@/types';

interface HeaderProps {
  siteSettings: SiteSettings;
}

export default function Header({ siteSettings }: HeaderProps) {
  if (!siteSettings) {
    return null;
  }
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
           {/* {siteSettings.logo && (
              <Image
                src={siteSettings.logo}
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-800">
              {siteSettings.siteTitle}
            </h1>*/}
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            {siteSettings.navLinks.map((link, index) => (
              link.subLinks ? (
                <div key={index} className="relative group">
                  <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer">
                    {link.label}
                  </span>
                  <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-2 w-48">
                    {link.subLinks.map((subLink, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subLink.href}
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              )
            ))}
            <Link
              href="/admin"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Admin
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link
              href="/admin"
              className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              Admin
            </Link>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            {siteSettings.navLinks.map((link, index) => (
              <div key={index}>
                {link.subLinks ? (
                  <>
                    <span className="text-sm text-gray-800 font-semibold py-2 block">{link.label}</span>
                    <div className="flex flex-col space-y-2 pl-4">
                      {link.subLinks.map((subLink, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subLink.href}
                          className="text-sm text-gray-600 hover:text-gray-900 py-1"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 py-2"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}