export interface Collage {
  id: number;
  title: string;
  images: string[];
  description?: string;
  category: string;
  date: string;
  featured: boolean;
  tags: string[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface HeroSection {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

export interface AboutSection {
  title: string;
  content: string;
  image: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  officeHours: string;
}

export interface RichTextContent {
  id: string;
  title: string;
  content: string;
  image?: string;
  alignment: 'left' | 'center' | 'right';
  order: number;
  published: boolean;
}

export interface PlacementsSection {
  title: string;
  subtitle: string;
  items: RichTextContent[];
}

export interface AchievementsSection {
  title: string;
  subtitle: string;
  items: RichTextContent[];
}

export interface HomepageSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface HomepageLayout {
  sections: HomepageSection[];
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  features: string[];
  published: boolean;
  order: number;
}

export interface FacilitiesSection {
  title: string;
  subtitle: string;
  items: Facility[];
}

export interface SiteSettings {
  siteTitle: string;
  logo: string;
  navLinks: NavLink[];
  hero: HeroSection;
  about: AboutSection;
  placements: PlacementsSection;
  achievements: AchievementsSection;
  facilities: FacilitiesSection;
  contact: ContactInfo;
  homepage: HomepageLayout;
  footer: {
    text: string;
    socialLinks: SocialLink[];
  };
}