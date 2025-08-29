import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SiteSettings } from '@/types';

const sitePath = path.join(process.cwd(), 'data', 'site.json');

function readSiteSettings(): SiteSettings {
  try {
    const data = fs.readFileSync(sitePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default settings if file doesn't exist
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
        image: "/img/1.jpg",
        stats: [
          { label: "Students", value: "15,000+" },
          { label: "Faculty", value: "800+" }
        ],
        committee: {
          title: "College Management Committee",
          content: "",
          image: "",
          alignment: "left"
        },
        templeAdministration: {
          title: "Temple Administration",
          content: "",
          image: "",
          alignment: "left"
        },
        secretaryMessage: {
          title: "Secretary Message",
          content: "",
          image: "",
          alignment: "left"
        },
        principalMessage: {
          title: "Principal's Message",
          content: "",
          image: "",
          alignment: "left"
        }
      },
      placements: {
        title: "Placements",
        subtitle: "Our students have been placed in top companies",
        items: []
      },
      achievements: {
        title: "Achievements",
        subtitle: "Our students' and faculty's accomplishments",
        items: []
      },
      facilities: {
        title: "Facilities",
        subtitle: "World-class facilities for our students",
        items: []
      },
      carousel: {
        title: "Highlights",
        subtitle: "Campus life and events",
        items: []
      },
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
      gallery: {
        title: "Gallery",
        subtitle: "Glimpses of campus life",
        items: []
      },
      footer: {
        text: "© 2025 University Memories. All rights reserved.",
        socialLinks: [
          { label: "Facebook", href: "https://facebook.com/university" },
          { label: "Twitter", href: "https://twitter.com/university" },
          { label: "Instagram", href: "https://instagram.com/university" },
          { label: "LinkedIn", href: "https://linkedin.com/school/university" }
        ]
      }
    };
  }
}

function writeSiteSettings(settings: SiteSettings): void {
  fs.writeFileSync(sitePath, JSON.stringify(settings, null, 2));
}

export async function GET() {
  try {
    const settings = readSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read site settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the structure
    if (!body.siteTitle || !body.navLinks || !body.footer) {
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 });
    }

    // Ensure contact field exists
    if (!body.contact) {
      body.contact = {
        address: "123 University Avenue\nCollege Town, ST 12345",
        phone: "(555) 123-4567",
        email: "info@university.edu",
        officeHours: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM"
      };
    }

    // Ensure homepage field exists
    if (!body.homepage) {
      body.homepage = {
        sections: [
          { id: "hero", name: "Hero Section", enabled: true, order: 1 },
          { id: "about", name: "About Section", enabled: true, order: 2 },
          { id: "placements", name: "Placements Section", enabled: true, order: 3 },
          { id: "achievements", name: "Achievements Section", enabled: true, order: 4 },
          { id: "featured-collages", name: "Featured Collages", enabled: true, order: 5 }
        ]
      };
    }

    // Ensure about section fields exist
    if (!body.about) {
      body.about = {
        title: "About Our College",
        content: "Our institution has been a beacon of academic excellence.",
        image: "/img/1.jpg",
        stats: [
          { label: "Students", value: "800+" }
        ],
        committee: {
          title: "College Management Committee",
          content: "",
          image: "",
          alignment: "left"
        },
        templeAdministration: {
          title: "Temple Administration",
          content: "",
          image: "",
          alignment: "left"
        },
        secretaryMessage: {
          title: "Secretary Message",
          content: "",
          image: "",
          alignment: "left"
        },
        principalMessage: {
          title: "Principal's Message",
          content: "",
          image: "",
          alignment: "left"
        }
      };
    }

    // Ensure placements section exists
    if (!body.placements) {
      body.placements = {
        title: "Placements",
        subtitle: "Our students have been placed in top companies",
        items: []
      };
    }

    // Ensure achievements section exists
    if (!body.achievements) {
      body.achievements = {
        title: "Achievements",
        subtitle: "Our students' and faculty's accomplishments",
        items: []
      };
    }

    // Ensure facilities section exists
    if (!body.facilities) {
      body.facilities = {
        title: "Facilities",
        subtitle: "World-class facilities for our students",
        items: []
      };
    }

    // Ensure carousel section exists
    if (!body.carousel) {
      body.carousel = {
        title: "Highlights",
        subtitle: "Campus life and events",
        items: []
      };
    }

    // Ensure gallery section exists
    if (!body.gallery) {
      body.gallery = {
        title: "Gallery",
        subtitle: "Glimpses of campus life",
        items: []
      };
    }

    // In the handler for PATCH/POST requests, add support for examCell and others
    if (body.examCell) {
      // Assuming siteData is defined or accessible here, or this block needs to be moved
      // For now, adding a placeholder for examCell
      // siteData.examCell = body.examCell; 
    }
    if (body.others) {
      // Assuming siteData is defined or accessible here, or this block needs to be moved
      // For now, adding a placeholder for others
      // siteData.others = body.others; 
    }

    writeSiteSettings(body);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}