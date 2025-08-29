
const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || currentHost;


import { AcademicSection } from '@/types';

type AdmissionForm = {
  id: string;
  name: string;
  isActive: boolean;
  // Add other properties as needed
};

export async function fetchAPI<T>(endpoint: string, fallback?: T): Promise<T> {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            cache: 'force-cache' // Cache for static export, no revalidate for static builds
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
export const getSiteSettings = () => fetchAPI('/api/site');
export const getCollages = () => fetchAPI('/api/collages', []);
export const getFaculty = () => fetchAPI('/api/faculty', { items: [] });
export const getPlacements = () => fetchAPI('/api/placements', { items: [] });
export const getIQAC = () => fetchAPI('/api/iqac', null);
export const getAlumni = () => fetchAPI('/api/alumni', []);
export const getAdmissionForms = async (): Promise<AdmissionForm[]> => {
  try {
    console.log('Fetching admission forms...');
    const response = await fetch('/api/admission-forms');
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || API_BASE_URL}/api/academics/public`);
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