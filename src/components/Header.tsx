import Image from "next/image";
import Link from "next/link";

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface HeaderProps {
  /** Phone number displayed in the very top strip */
  phone?: string;
  /** Email displayed in the very top strip */
  email?: string;
  /** Optional notice text displayed in the top strip */
  notice?: string;
  /** Logo source relative to the public folder */
  logoSrc?: string;
  /** Navigation items */
  navItems?: NavItem[];
}

/**
 * Reusable Header component containing:
 * 1. Top info strip (phone, email, notice)
 * 2. Banner row (logo + organisation title)
 * 3. Navigation bar with optional dropdowns
 */
export default function Header({
  phone = "04288 – 260333",
  email = "aaascollege2021@gmail.com",
  notice = "Admission Open",
  logoSrc = "/next.svg",
  navItems = [],
}: HeaderProps) {
  // Provide a fallback set of nav items if none are supplied
  const fallbackNav: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about",
      children: [
        { label: "College Management Committee", href: "/about/college-management-committee" },
        { label: "Temple Administration", href: "/about/temple-administration" },
        { label: "Secretary Message", href: "/about/secretary-message" },
        { label: "Principal Message", href: "/about/principal-message" },
      ]
    },
    {
      label: "Academics",
      href: "#",
      children: [
        { label: "B.Sc., (CS)", href: "/academics/b-sc-cs" },
        { label: "B.Com", href: "/academics/b-com" },
        { label: "B.C.A", href: "/academics/b-ca" },
        { label: "Β.Β.Α", href: "/academics/bba" },
        { label: "B.A., (Saiva Sidhantham)", href: "/academics/ba-saiva-sidhantham" },
        { label: "Certificate Course - Saiva Ilakkiyam", href: "/academics/certificate-course-saiva-ilakkiyam" },
      ],
    },
    { label: "Faculty", href: "/faculty" 
      ,children: [
        { label: "Business Administration", href: "/faculty/business-administration" },
        { label: "Commerce", href: "/faculty/commerce" },
        { label: "Computer Applications", href: "/faculty/computer-applications" },
        { label: "Computer Science", href: "/faculty/computer-science" },
        { label: "English", href: "/faculty/english" },
        { label: "Mathematics", href: "/faculty/mathematics" },
        { label: "Tamil", href: "/faculty/tamil" },
        { label: "Librarian", href: "/faculty/librarian" },
        { label: "Physical Director", href: "/faculty/physical-director" },
      ]
    },
    { label: "IQAC", href: "/iqac" },
    { label: "Facilities", href: "/facilities",
      children: [
        { label: "Administrative Office", href: "/facilities/administrative-office" },
        { label: "Anti-Ragging Club", href: "/facilities/anti-ragging-club" },
        { label: "Anti-Drug Club", href: "/facilities/anti-drug-club" },
        { label: "Computer Lab", href: "/facilities/computer-lab" },
        { label: "ED Cell", href: "/facilities/ed-cell" },
        { label: "ELC", href: "/facilities/elc" },
        { label: "ELPF", href: "/facilities/elpf" },
        { label: "Fine Arts Club", href: "/facilities/fine-arts-club" },
        { label: "Library", href: "/facilities/library" },
        { label: "NSS", href: "/facilities/nss" },
        { label: "Sports", href: "/facilities/sports" },
        { label: "WEC", href: "/facilities/wec" },
      ]
     },
    { label: "Exam Cell", href: "/exam-cell" },
    { label: "Achievements", href: "/achievements" },
    { label: "Placement", href: "/placement" },
    { label: "Alumni Association", href: "/alumni-association" },
    { label: "Others", href: "/others" ,children: [
      { label: "AISHE", href: "/others/aishe" },
      { label: "The Academic Coordinator", href: "/others/academic-coordinator" },
    ]},
    { label: "Gallery", href: "/gallery" },
    { label: "Contact Us", href: "/contact" },
  ];

  const items = navItems.length ? navItems : fallbackNav;

  return (
    <header className="w-full text-sm font-medium shadow">
      {/* Top info strip */}
      <div className="bg-[#305783] text-white flex justify-center">
        <div className="container mx-auto px-4 py-1 flex items-center gap-4 whitespace-nowrap overflow-x-auto text-[13px]">
          <span className="flex items-center gap-1">
            <span aria-hidden>📞</span>
            {phone}
          </span>
          <span className="hidden sm:block">|</span>
          <span className="flex items-center gap-1">
            <span aria-hidden>✉️</span>
            {email}
          </span>
          {notice && (
            <>
              <span className="hidden sm:block">|</span>
              <span className="flex items-center gap-1">
                <span aria-hidden>📢</span>
                Notice: <span className="font-semibold">{notice}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Banner row */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-2 flex items-center gap-4">
          <Image
            src={logoSrc}
            alt="Logo"
            width={60}
            height={60}
            className="shrink-0"
            priority
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#163366] leading-tight">
              ARULMIGU ARTHANAREESWARAR ARTS AND SCIENCE COLLEGE
            </h1>
            <p className="text-[11px] sm:text-xs text-[#163366] font-medium">
              (AFFILIATED TO PERIYAR UNIVERSITY, SALEM) <br /> SELF FINANCE CO EDUCATION INSTITUTION UNDER HR & CE DEPARTMENT, GOVERNMENT OF TAMILNADU
            </p>
          </div>
          {/* Optional right side logo */}
          <Image
            src="/logo-right.png"
            alt="Right Logo"
            width={60}
            height={60}
            className="hidden md:block shrink-0"
          />
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-2 sm:px-4 flex">
          {items.map((item) => (
            <NavButton key={item.label} item={item} />
          ))}
        </div>
      </nav>
    </header>
  );
}

function NavButton({ item }: { item: NavItem }) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="relative group py-2">
      <Link
        href={item.href}
        className="block px-4 py-2 hover:bg-blue-300 hover:text-blue-900 whitespace-nowrap transition-all duration-300 transform hover:scale-105 rounded-full"
      >
        {item.label}
        {hasChildren && <span className="ml-1 transition-transform duration-300 group-hover:rotate-180">▾</span>}
      </Link>

      {hasChildren && (
        <div className="absolute left-0 top-full z-50 hidden min-w-max bg-gradient-to-b from-white to-gray-100 text-blue-900 rounded-md shadow-lg group-hover:block hover:block transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          {item.children!.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              className="block px-4 py-2 hover:bg-blue-100 whitespace-nowrap transition-colors duration-200"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
