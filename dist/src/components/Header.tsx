'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
// Removed framer-motion animations
import { SiteSettings } from '@/types';
import ComponentHeader from './ComponentHeader';

interface HeaderProps {
  siteSettings: SiteSettings;
}

export default function Header({ siteSettings }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  if (!siteSettings) return null;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <>
      <ComponentHeader />

      <header
        className={`sticky top-0 z-50 transition-all duration-300 w-full full-width-header ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-white/20' 
            : 'bg-white shadow-md'
        }`}
      >
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo + Title */}
            <div>
        
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {siteSettings.navLinks?.map((link, index) =>
                link.subLinks ? (
                  <DropdownMenu 
                    key={index} 
                    link={link} 
                    index={index}
                    activeDropdown={activeDropdown}
                    onToggle={handleDropdownToggle}
                  />
                ) : (
                  <NavLink key={index} href={link.href} label={link.label} />
                )
              )}

              {/* Admin Button 
              <div className="ml-4">
                <Link
                  href="/admin"
                  className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10">Admin</span>
                  <AdminIcon />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>*/}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <div>
                  <CloseIcon />
                </div>
              ) : (
                <div>
                  <MenuIcon />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <MobileMenu 
            siteSettings={siteSettings} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
        )}
      </header>
    </>
  );
}

// Desktop Navigation Link Component
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <div>
      <Link
        href={href}
        className="relative px-4 py-2.5 text-gray-700 hover:text-blue-600 font-medium text-sm transition-all duration-300 rounded-xl hover:bg-blue-50 group"
      >
        {label}
        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-3/4 group-hover:-translate-x-1/2" />
      </Link>
    </div>
  );
}

// Dropdown Menu Component
function DropdownMenu({ 
  link, 
  index, 
  activeDropdown, 
  onToggle 
}: { 
  link: any; 
  index: number; 
  activeDropdown: number | null; 
  onToggle: (index: number) => void; 
}) {
  const isOpen = activeDropdown === index;

  return (
    <div className="relative">
      <button
        onClick={() => onToggle(index)}
        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 font-medium text-sm transition-all duration-300 rounded-xl hover:bg-blue-50 group"
      >
        {link.label}
        <span className="inline-block transform transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronIcon />
        </span>
        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-3/4 group-hover:-translate-x-1/2" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 min-w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50">
          <div className="py-2">
            {link.subLinks.map((subLink: any, subIndex: number) => (
              <div key={subIndex}>
                <Link
                  href={subLink.href}
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 group text-sm"
                  onClick={() => onToggle(-1)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {subLink.label}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile Menu Component
function MobileMenu({ 
  siteSettings, 
  onClose 
}: { 
  siteSettings: SiteSettings; 
  onClose: () => void; 
}) {
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);

  return (
    <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 overflow-hidden full-width-header">
      <div className="w-full px-4 py-6">
        <nav className="space-y-2">
          {siteSettings.navLinks?.map((link, index) => (
            <div key={index}>
              {link.subLinks ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setOpenSubMenu(openSubMenu === index ? null : index)}
                    className="flex items-center justify-between w-full p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 group text-sm"
                  >
                    <span className="font-medium">{link.label}</span>
                    <span className="inline-block transform transition-transform" style={{ transform: openSubMenu === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronIcon />
                    </span>
                  </button>
                  
                  {openSubMenu === index && (
                    <div className="pl-4 space-y-1 overflow-hidden">
                      {link.subLinks.map((subLink: any, subIndex: number) => (
                        <div key={subIndex}>
                          <Link
                            href={subLink.href}
                            onClick={onClose}
                            className="block p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 group text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              {subLink.label}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium text-sm"
                  >
                    {link.label}
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* Mobile Admin Button */}
          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <AdminIcon />
              <span>Admin Panel</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

// Icon Components
function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15l3-3-3-3M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
