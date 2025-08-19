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
  subLinks?: NavLink[];
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
  committee?: AboutSubsection;
  templeAdministration?: AboutSubsection;
  secretaryMessage?: AboutSubsection;
  principalMessage?: AboutSubsection;
}

export interface AboutSubsection {
  title: string;
  content: string;
  image?: string;
  alignment?: 'left' | 'right';
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  officeHours: string;
  googleMapsUrl?: string;
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

export interface CarouselItem {
  id: string;
  image: string;
  title: string;
  description?: string;
  caption?: string;  // Alternative to title
  link?: string;     // Alternative to description
  order: number;
  published: boolean;
}

export interface CarouselSection {
  title: string;
  subtitle: string;
  items: CarouselItem[];
}

export interface Header2 {
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  noticeText?: string;
  published: boolean;
}

// Added to SiteSettings
export interface SiteSettings {
  siteTitle: string;
  logo: string;
  navLinks: NavLink[];
  hero: HeroSection;
  about: AboutSection;
  placements: PlacementsSection;
  achievements: AchievementsSection;
  facilities: FacilitiesSection;
  carousel: CarouselSection;
  contact: ContactInfo;
  homepage: HomepageLayout;
  homepage_image?: {
    image: string;
    title?: string;
    description?: string;
  };
  gallery?: {
    title: string;
    subtitle?: string;
    items: Array<{
      id?: string;
      image: string;
      title?: string;
      description?: string;
      published?: boolean;
      order?: number;
      homepage_image?: boolean;
    }>;
  };
  footer: {
    text: string;
    socialLinks: SocialLink[];
  };
  examCell: ExamCellSection;
  others: OthersSection;
  faculty: FacultySection;
  header2?: Header2;
}

export interface AlumniAssociation {
  title: string;
  content: string;
  image?: string;
  members?: Array<{
    name: string;
    year: string;
    description?: string;
    image?: string;
  }>;
}

export interface PlacementSection {
  title: string;
  subtitle: string;
  items: Array<{
    id: string;
    title: string;
    content: string;
    images?: string[]; // <-- support multiple images
    alignment?: 'left' | 'center' | 'right';
    order?: number;
    published?: boolean;
  }>;
}

export interface GalleryItem {
  id?: string;
  image: string;
  title?: string;
  description?: string;
  order?: number;
  published?: boolean;
  homepage_image?: boolean;
}

export interface AcademicProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  eligibility: string;
  syllabus: string;
  careerProspects: string[];
  image?: string;
  order: number;
  published: boolean;
}

export interface AcademicSection {
  title: string;
  subtitle: string;
  programs: AcademicProgram[];
  additionalInfo?: string;
}

export interface ExamCellSection {
  title: string;
  subtitle: string;
  content: string;
  showHero: boolean;
  showFeatures: boolean;
  showQuickLinks: boolean;
  showCTA: boolean;
  heroButtonText: string;
  ctaButtonText: string;
}

export interface OthersSubSection {
  title: string;
  subtitle: string;
  content: string;
}

export interface OthersSection {
  aishe: OthersSubSection;
  academicCoordinator: OthersSubSection;
}

export interface FacultyItem {
  id: string;          // unique id
  slug: string;        // URL slug
  title: string;       // display title (name)
  subtitle?: string;   // additional title/qualification
  designation: string;   // official position/designation
  email?: string;      // contact email
  phone?: string;      // contact phone
  content: string;     // HTML content (bio/description)
  image?: string;      // profile image
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  order: number;       // ordering index
  published: boolean;  // visibility
}

export interface FacultySection {
  title: string;
  items: FacultyItem[];
}