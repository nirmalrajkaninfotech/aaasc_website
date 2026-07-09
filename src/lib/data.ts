import fs from 'fs';
import path from 'path';
import { SiteSettings, Collage, PlacementSection } from '@/types';

const dataDir = path.join(process.cwd(), 'data');

export function readSiteSettings(): SiteSettings {
  try {
    const filePath = path.join(dataDir, 'site.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      siteTitle: "University Memories",
      logo: "/logo.png",
      navLinks: [
        { label: "Home", href: "/" },
        { label: "Academics", href: "/academics" },
        { label: "Gallery", href: "/gallery" },
        { label: "About", href: "/about" }
      ],
      hero: {
        title: "Capturing College Memories",
        subtitle: "Preserving the moments that define our academic journey",
        backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
        ctaText: "Explore Gallery",
        ctaLink: "/gallery"
      },
      about: {
        title: "About Our College",
        content: "Our institution has been a beacon of academic excellence.",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop",
        stats: [
          { label: "Students", value: "15,000+" },
          { label: "Faculty", value: "800+" }
        ],
        committee: { title: "College Management Committee", content: "", image: "", alignment: "left" },
        templeAdministration: { title: "Temple Administration", content: "", image: "", alignment: "left" },
        secretaryMessage: { title: "Secretary Message", content: "", image: "", alignment: "left" },
        principalMessage: { title: "Principal's Message", content: "", image: "", alignment: "left" }
      },
      placements: { title: "Placements", subtitle: "Our students have been placed in top companies", items: [] },
      achievements: { title: "Achievements", subtitle: "Our students' and faculty's accomplishments", items: [] },
      facilities: { title: "Facilities", subtitle: "World-class facilities for our students", items: [] },
      carousel: { title: "Highlights", subtitle: "Campus life and events", items: [] },
      contact: {
        address: "123 College Street, City, State, 12345",
        phone: "+1 234 567 8900",
        email: "info@college.edu",
        officeHours: "Monday - Friday: 9:00 AM - 5:00 PM",
        googleMapsUrl: "https://maps.google.com"
      },
      homepage: {
        sections: [
          { id: "hero", name: "Hero Section", enabled: true, order: 0 },
          { id: "about", name: "About Section", enabled: true, order: 1 },
          { id: "placements", name: "Placements", enabled: true, order: 2 },
          { id: "achievements", name: "Achievements", enabled: true, order: 3 },
          { id: "facilities", name: "Facilities", enabled: true, order: 4 }
        ]
      },
      gallery: { title: "Gallery", subtitle: "Glimpses of campus life", items: [] },
      footer: {
        text: "© 2025 University Memories. All rights reserved.",
        socialLinks: [
          { label: "Facebook", href: "https://facebook.com/university" },
          { label: "Twitter", href: "https://twitter.com/university" },
          { label: "Instagram", href: "https://instagram.com/university" },
          { label: "LinkedIn", href: "https://linkedin.com/school/university" }
        ]
      },
      examCell: { title: "", subtitle: "", content: "", showHero: false, showFeatures: false, showQuickLinks: false, showCTA: false, heroButtonText: "", ctaButtonText: "" },
      others: { aishe: { title: "", subtitle: "", content: "" }, academicCoordinator: { title: "", subtitle: "", content: "" } },
      faculty: { title: "", items: [] }
    };
  }
}

export function writeSiteSettings(settings: SiteSettings): void {
  const filePath = path.join(dataDir, 'site.json');
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
}

export function writeCollages(collages: Collage[]): void {
  const filePath = path.join(dataDir, 'collages.json');
  fs.writeFileSync(filePath, JSON.stringify(collages, null, 2));
}

export function readCollages(): Collage[] {
  try {
    const filePath = path.join(dataDir, 'collages.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function writePlacements(placements: PlacementSection): void {
  const filePath = path.join(dataDir, 'placements.json');
  fs.writeFileSync(filePath, JSON.stringify(placements, null, 2));
}

export function readPlacements(): PlacementSection {
  try {
    const filePath = path.join(dataDir, 'placements.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      title: 'Student Placements',
      subtitle: 'Our graduates excel in top companies worldwide.',
      items: []
    };
  }
}

export function writeIQACData(data: any): void {
  const filePath = path.join(dataDir, 'iqac.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readIQACData(): any {
  try {
    const filePath = path.join(dataDir, 'iqac.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function readAcademicData(): any {
  try {
    const filePath = path.join(dataDir, 'academics.json');
    if (!fs.existsSync(filePath)) {
      return {
        title: 'Academic Programs',
        subtitle: 'Explore our diverse range of academic programs',
        programs: [],
        additionalInfo: ''
      };
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      title: 'Academic Programs',
      subtitle: 'Explore our diverse range of academic programs',
      programs: [],
      additionalInfo: ''
    };
  }
}
