export interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  googleMapsApiKey?: string;
  googleMapsEmbedQuery?: string;
  googleMapsUrl?: string;
  officeHours?: string;
}

export interface SiteSettings {
  siteTitle: string;
  title: string;
  description: string;
  logo: string;
  navLinks: Array<{label: string, href: string}>;
  hero: {
    title: string;
    subtitle: string;
  };
  about: {
    title: string;
    content: string;
  };
  contact: ContactSettings;
  // Add other properties as needed
}
