// This file is kept for type definitions and can be removed if not needed
// All data now comes from API calls only

export type SiteSettings = {
    siteName: string;
    siteDescription: string;
    logo: string;
    contact: {
        phone: string;
        email: string;
        address: string;
        googleMapsUrl: string;
        googleMapsApiKey: string;
        googleMapsEmbedQuery: string;
    };
    social: {
        facebook: string;
        twitter: string;
        instagram: string;
        linkedin: string;
    };
    header: {
        navigation: Array<{ name: string; href: string }>;
    };
    footer: {
        quickLinks: Array<{ name: string; href: string }>;
    };
    facilities?: Array<{
        id: string;
        title: string;
        description: string;
        image: string;
        category: string;
    }>;
};