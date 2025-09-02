'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
// Removed framer-motion animations
import { SiteSettings } from '@/types';
import ComponentHeader from './ComponentHeader';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  siteSettings: SiteSettings;
}

export default function Header({ siteSettings }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const pathname = usePathname();

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
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const { overflow } = document.body.style;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = overflow || '';
      };
    }
    return;
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <ComponentHeader />
      </div>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          isScrolled 
            ? 'bg-[#2D5073] backdrop-blur-xl shadow-lg border-b border-[#2D5073]/20' 
            : 'bg-[#2D5073] shadow-md font-serif'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between h-12 lg:h-14">
            {/* Logo + Title - Removed */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                {/* Logo image can be added here in the future */}
              </Link>
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
              className="lg:hidden p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <div className="text-blue-600">
                  <CloseIcon />
                </div>
              ) : (
                <div className="text-blue-600">
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
            onClose={toggleMobileMenu} 
            pathname={pathname}
          />
        )}
      </header>
    </div>
  );
}

// Desktop Navigation Link Component
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  // More flexible pathname matching to handle trailing slashes and partial matches
  const isActive = pathname === href || 
                   pathname === href + '/' || 
                   (href !== '/' && pathname.startsWith(href + '/')) ||
                   (href === '/' && pathname === '/');
  

  
  return (
    <div>
      <Link
        href={href}
        className={`relative px-3 py-1.5 font-serif text-sm transition-all duration-300 rounded-xl group ${
          isActive 
            ? 'text-white bg-[#F99D1C] shadow-lg shadow-[#F99D1C]/25' 
            : 'text-white hover:text-white hover:bg-blue-600/30'
        }`}
      >
        {label}
        {!isActive && (
          <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-3/4 group-hover:-translate-x-1/2" />
        )}
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
        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 font-serif text-sm transition-all duration-300 rounded-xl hover:bg-blue-50 group"
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
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 group text-sm font-serif"
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
interface MobileMenuProps {
  siteSettings: SiteSettings;
  onClose: () => void;
  pathname: string;
}

function MobileMenu({ 
  siteSettings, 
  onClose,
  pathname
}: MobileMenuProps) {
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow || '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <button
        aria-label="Close menu"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 w-[100%] max-w-sm bg-white shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-800">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
            aria-label="Close mobile menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-2">
            {siteSettings.navLinks?.map((link, index) => (
              <div key={index}>
                {link.subLinks ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setOpenSubMenu(openSubMenu === index ? null : index)}
                      className="flex items-center justify-between w-full p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 group font-serif text-base"
                    >
                      <span className="font-medium">{link.label}</span>
                      <span className="inline-block transform transition-transform" style={{ transform: openSubMenu === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ChevronIcon />
                      </span>
                    </button>
                    
                    {openSubMenu === index && (
                      <div className="pl-4 space-y-1 overflow-hidden">
                        {link.subLinks.map((subLink: any, subIndex: number) => {
                          const isSubLinkActive = pathname === subLink.href || 
                                               pathname === subLink.href + '/' || 
                                               (subLink.href !== '/' && pathname.startsWith(subLink.href + '/')) ||
                                               (subLink.href === '/' && pathname === '/');
                          return (
                            <div key={subIndex}>
                              <Link
                                href={subLink.href}
                                onClick={onClose}
                                className={`block p-3 rounded-xl transition-all duration-200 font-serif text-base ${
                                  isSubLinkActive
                                    ? 'text-white bg-[#F99D1C] shadow-lg shadow-[#F99D1C]/25'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-1.5 h-1.5 rounded-full transition-opacity duration-200 ${
                                    isSubLinkActive
                                      ? 'bg-white opacity-100'
                                      : 'bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100'
                                  }`} />
                                  {subLink.label}
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`block p-3 rounded-xl transition-all duration-200 font-serif text-base ${
                        pathname === link.href || 
                        pathname === link.href + '/' || 
                        (link.href !== '/' && pathname.startsWith(link.href + '/')) ||
                        (link.href === '/' && pathname === '/')
                          ? 'text-white bg-[#F99D1C] shadow-lg shadow-[#F99D1C]/25'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Admin Button 
            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <AdminIcon />
                <span>Admin Panel</span>
              </Link>
            </div> */}
          </nav>
        </div>
      </div>
    </div>
  );
}

// ... (rest of the code remains the same)
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