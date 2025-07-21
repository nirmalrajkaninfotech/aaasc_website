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
    { label: "About Us", href: "/about" },
    {
      label: "Academics",
      href: "#",
      children: [
        { label: "Departments", href: "/academics/departments" },
        { label: "Calendar", href: "/academics/calendar" },
      ],
    },
    { label: "Faculty", href: "/faculty" },
    { label: "IQAC", href: "/iqac" },
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
      <nav className="bg-[#305783] text-white">
        <div className="container mx-auto px-2 sm:px-4 flex overflow-x-auto">
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
    <div className="relative group">
      <Link
        href={item.href}
        className="block px-4 py-2 hover:bg-[#fbbc05] whitespace-nowrap"
      >
        {item.label}
        {hasChildren && <span className="ml-1">▾</span>}
      </Link>

      {hasChildren && (
        <div className="absolute left-0 top-full z-10 hidden min-w-max bg-white text-[#305783] shadow-md group-hover:block">
          {item.children!.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              className="block px-4 py-2 hover:bg-[#f2f2f2] whitespace-nowrap"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
