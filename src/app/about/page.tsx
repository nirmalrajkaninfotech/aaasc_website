
import AboutSection from '@/components/AboutSection';
import { SiteSettings } from '@/types';
import fs from 'fs';
import path from 'path';

async function getSiteSettings(): Promise<SiteSettings> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading site settings:', error);
    return {
      siteTitle: "My Collage Website",
      logo: "/logo.png",
      navLinks: [
        { label: "Home", href: "/" },
        { label: "Gallery", href: "/" },
        { label: "About", href: "/about" }
      ],
      hero: {
        title: "Welcome",
        subtitle: "Building memories",
        backgroundImage: "/img/1.jpg",
        ctaText: "Explore",
        ctaLink: "/"
      },
      footer: {
        text: "© 2025 My Collage Website. All rights reserved.",
        socialLinks: [
          { label: "Twitter", href: "https://twitter.com/myprofile" },
          { label: "GitHub", href: "https://github.com/myprofile" }
        ]
      },
      about: {
        title: "About Us",
        content: "Content coming soon.",
        image: "/img/1.jpg",
        stats: []
      },
      placements: {
        title: "Placements",
        subtitle: "Our students succeed",
        items: []
      },
      achievements: {
        title: "Achievements",
        subtitle: "Our milestones",
        items: []
      },
      facilities: {
        title: "Facilities",
        subtitle: "What we offer",
        items: []
      },
      contact: {
        address: "",
        phone: "",
        email: "",
        officeHours: ""
      },
      homepage: {
        sections: [
          { id: "hero", name: "Hero Section", enabled: true, order: 1 },
          { id: "about", name: "About Section", enabled: true, order: 2 }
        ]
      },
      examCell: {
        title: "Exam Cell",
        subtitle: "Examination information",
        content: "Exam cell details",
        showHero: false,
        showFeatures: false,
        showQuickLinks: false,
        showCTA: false,
        heroButtonText: "",
        ctaButtonText: ""
      },
      others: {
        aishe: { title: "AISHE", subtitle: "", content: "" },
        academicCoordinator: { title: "Academic Coordinator", subtitle: "", content: "" }
      },
      faculty: {
        title: "Our Faculty",
        items: []
      },
      carousel: {
        title: "Highlights",
        subtitle: "Campus life",
        items: []
      }
    };
  }
}

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-1">
        <AboutSection about={siteSettings.about} />
      </main>

    </div>
  );
}