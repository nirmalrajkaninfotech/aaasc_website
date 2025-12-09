
import { API_BASE_URL as CONFIG_API_BASE_URL } from '@/config';

// Use the configured API URL, with fallback for development
export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL 
  ? (process.env.NEXT_PUBLIC_BASE_URL.endsWith('/') ? process.env.NEXT_PUBLIC_BASE_URL : `${process.env.NEXT_PUBLIC_BASE_URL}/`)
  : (CONFIG_API_BASE_URL.endsWith('/') ? CONFIG_API_BASE_URL : `${CONFIG_API_BASE_URL}/`);

  import { AcademicSection } from '@/types';

type AdmissionForm = {
  id: string;
  name: string;
  isActive: boolean;
  // Add other properties as needed
};

export async function fetchAPI<T>(endpoint: string, fallback?: T): Promise<T> {
    try {
        // Remove leading slash from endpoint if API_BASE_URL ends with slash
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const url = `${API_BASE_URL}${cleanEndpoint}`;
        const res = await fetch(url, {
            // Cache for static export, no revalidate for static builds
        });

        if (!res.ok) {
            console.warn(`API call failed for ${endpoint}: ${res.status} ${res.statusText}`);
            if (fallback !== undefined) {
                return fallback;
            }
            throw new Error(`API call failed: ${res.status} ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error(`API call error for ${endpoint}:`, error);
        if (fallback !== undefined) {
            return fallback;
        }
        throw error;
    }
}

// Specific API functions with fallbacks
export const getSiteSettings = () => fetchAPI('api/site', {
  siteTitle: 'AAASC',
  title: 'AAASC - Academic Excellence',
  description: 'A leading academic institution',
  logo: '/logo.png',
  navLinks: [],
  hero: {
    title: 'Welcome to AAASC',
    subtitle: 'Academic Excellence'
  },
  about: {
    title: 'About Us',
    content: 'Leading academic institution'
  },
  facilities: {
    title: 'Our Facilities',
    subtitle: 'State-of-the-art infrastructure',
    items: []
  },
  faculty: {
    title: 'Our Faculty',
    subtitle: 'Expert educators',
    items: []
  },
  placements: {
    title: 'Placements',
    subtitle: 'Career opportunities',
    items: []
  },
  achievements: {
    title: 'Achievements',
    subtitle: 'Our success stories',
    items: []
  },
  carousel: {
    title: 'Highlights',
    subtitle: 'Featured content',
    items: []
  },
  contact: {
    address: 'Contact address',
    phone: '+1234567890',
    email: 'info@aaasc.edu'
  },
  footer: {
    copyright: '© 2024 AAASC. All rights reserved.'
  }
});
export const getCollages = () => fetchAPI('api/collages', []);
export const getFaculty = () => fetchAPI('api/faculty', { items: [] });
export const getPlacements = () => fetchAPI('api/placements', { items: [] });
export const getIQAC = () => fetchAPI('api/iqac', null);
export const getAlumni = () => fetchAPI('api/alumni', []);
export const getAdmissionForms = async (): Promise<AdmissionForm[]> => {
  try {
    console.log('Fetching admission forms...');
    const response = await fetch(`${API_BASE_URL}api/admission-forms`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('Response not ok:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    // Only return active forms
    const activeForms = data.filter((form: AdmissionForm) => form.isActive);
    console.log('Active forms:', activeForms);
    return activeForms;
  } catch (error) {
    console.error('Failed to fetch admission forms:', error);
    return [];
  }
};

export const getAcademics = async (): Promise<AcademicSection> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/') ? process.env.NEXT_PUBLIC_API_URL : `${process.env.NEXT_PUBLIC_API_URL}/`)
      : API_BASE_URL;
    const response = await fetch(`${apiUrl}api/academics/public`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Ensure the response has the expected structure
    return {
      title: data.title || 'Academic Programs',
      subtitle: data.subtitle || 'Explore our diverse range of academic programs',
      programs: Array.isArray(data.programs) ? data.programs : [],
      additionalInfo: data.additionalInfo || ''
    };
  } catch (error) {
    console.error('Error fetching academic programs:', error);
    // Return default data structure on error
    return {
      title: 'Academic Programs',
      subtitle: 'Explore our diverse range of academic programs',
      programs: [],
      additionalInfo: ''
    };
  }
};