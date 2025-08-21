
import AboutSection from '@/components/AboutSection';
import { SiteSettings } from '@/types';
import { fetchApi } from '@/lib/api';

async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`/api/site`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
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
      }
    };
  }
  
  return res.json();
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