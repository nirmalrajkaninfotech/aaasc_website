export interface AboutImage {
  url: string;
  caption?: string;
  subtitle?: string;
}
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

// Support both object and string for logo
export type Logo = string | {
  url: string;
  alt: string;
};

export interface HeroSection {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  image?: string; // Alternative to backgroundImage
  ctaText?: string;
  ctaLink?: string;
  [key: string]: any; // Allow additional properties
}

export interface AboutSection {
  title?: string;
  content?: string;
  image?: string;
  images?: AboutImage[];
  masterCaption?: string;
  galleryEnabled?: boolean;
  stats?: Array<{
    label: string;
    value: string;
  }>;
  committee?: AboutSubsection;
  templeAdministration?: AboutSubsection;
  secretaryMessage?: AboutSubsection;
  principalMessage?: AboutSubsection;
  extraSections?: AboutSubsection[];
  [key: string]: any; // Allow additional properties
}

export interface AboutSubsection {
  title: string;
  content: string;
  image?: string;
  images?: AboutImage[]; // optional additional images per subsection
  alignment?: 'left' | 'right';
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  officeHours?: string;
  googleMapsUrl?: string;
  googleMapsApiKey?: string;
  googleMapsEmbedQuery?: string;
  [key: string]: any; // Allow additional properties
}

export interface RichTextContent {
  id: string;
  title: string;
  content: string;
  image?: string;
  images?: AboutImage[]; // optional multi-images with captions/subtitles
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
  gallery?: string[];
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

export interface FooterSettings {
  copyright?: string;
  text?: string;
  links?: NavLink[];
  socialLinks?: SocialLink[];
  [key: string]: any; // Allow additional properties
}

export interface SiteSettings {
  // Basic site info
  siteTitle?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  
  // Media
  logo: Logo;
  favicon?: string;
  
  // Navigation
  navLinks?: NavLink[];
  
  // Content sections
  hero?: HeroSection;
  about?: AboutSection;
  facilities?: FacilitiesSection;
  faculty?: FacultySection;
  placements?: PlacementsSection;
  achievements?: AchievementsSection;
  carousel?: CarouselSection;
  
  // Contact and footer
  contact?: ContactInfo;
  footer?: FooterSettings;
  
  // Additional sections
  homepage?: HomepageLayout;
  examCell?: ExamCellSection;
  others?: OthersSection;
  
  // Metadata
  metadata?: {
    title?: string | { default: string; template?: string };
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
    [key: string]: any;
  };
  
  // Allow any additional properties
  [key: string]: any;
}

export interface AlumniMember {
  name: string;
  batch?: string;
  department?: string;
  position?: string;
  company?: string;
  image?: string;
  [key: string]: any; // Allow additional properties
}

export interface AlumniAssociation {
  title: string;
  content: string;
  image?: string;
  members: AlumniMember[];
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
  section?: string; // grouping, e.g., UG/PG/Certificate
  description: string;
  content?: string; // rich HTML content shown on details
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

export interface FacultyImage {
  url: string;
  caption?: string;
  subtitle?: string;
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
  images?: FacultyImage[]; // <-- new field for multi-image support
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