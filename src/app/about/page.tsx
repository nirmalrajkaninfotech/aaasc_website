import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';

async function getSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/site`, {
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
      footer: {
        text: "© 2025 My Collage Website. All rights reserved.",
        socialLinks: [
          { label: "Twitter", href: "https://twitter.com/myprofile" },
          { label: "GitHub", href: "https://github.com/myprofile" }
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
      <Header siteSettings={siteSettings} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            About {siteSettings.siteTitle}
          </h1>
          
          <div className="prose prose-lg mx-auto">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Welcome to our beautiful collage website! This platform allows you to create, 
              share, and explore stunning photo collages that capture life's precious moments.
            </p>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Whether you're preserving vacation memories, celebrating special occasions, 
              or simply showcasing your favorite photographs, our easy-to-use platform 
              makes it simple to create and share your visual stories.
            </p>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              Built with modern web technologies, this site offers a seamless experience 
              for both viewing and managing your collages. Visit our admin panel to start 
              creating your own collections today!
            </p>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}