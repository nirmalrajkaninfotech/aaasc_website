// API service for connecting to the admin server
// This replaces the static JSON file loading with live API calls

import { API_BASE_URL } from '@/config';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Generic fetch method with error handling
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Public endpoints (no authentication required)
  
  // Get site settings
  async getSiteSettings() {
    return this.fetchApi('/site/public');
  }

  // Get public collages
  async getCollages(category?: string, featured?: boolean) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (featured !== undefined) params.append('featured', featured.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/collages/public?${queryString}` : '/collages/public';
    
    return this.fetchApi(endpoint);
  }

  // Get public academics
  async getAcademics() {
    return this.fetchApi('/academics/public');
  }

  // Get public placements
  async getPlacements() {
    return this.fetchApi('/placements/public');
  }

  // Get public achievements
  async getAchievements() {
    return this.fetchApi('/achievements/public');
  }

  // Get public IQAC data
  async getIQAC() {
    return this.fetchApi('/iqac/public');
  }

  // Get public alumni data
  async getAlumni() {
    return this.fetchApi('/alumni/public');
  }

  // Get public carousel
  async getCarousel() {
    return this.fetchApi('/carousel/public');
  }

  // Health check
  async getHealth() {
    return this.fetchApi('/health');
  }

  // Admin endpoints (require authentication)
  
  // Login
  async login(username: string, password: string) {
    return this.fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Get user profile
  async getProfile(token: string) {
    return this.fetchApi('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Update site settings
  async updateSiteSettings(token: string, settings: Record<string, any>) {
    return this.fetchApi('/site', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ settings }),
    });
  }

  // Create collage
  async createCollage(token: string, collage: any) {
    return this.fetchApi('/collages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(collage),
    });
  }

  // Update collage
  async updateCollage(token: string, id: number, updates: any) {
    return this.fetchApi(`/collages/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  }

  // Delete collage
  async deleteCollage(token: string, id: number) {
    return this.fetchApi(`/collages/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Upload file
  async uploadFile(token: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload/single`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(token: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/upload/multiple`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Get uploaded files
  async getUploadedFiles(token: string, page = 1, limit = 20) {
    return this.fetchApi(`/upload?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Delete uploaded file
  async deleteUploadedFile(token: string, id: number) {
    return this.fetchApi(`/upload/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Export data
  async exportData(token: string, type: 'site' | 'collages' | 'academics') {
    return this.fetchApi(`/${type}/export`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Import data
  async importData(token: string, type: 'site' | 'collages' | 'academics', data: any) {
    return this.fetchApi(`/${type}/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export { ApiService };

// Helper functions for common operations
export const api = {
  // Public endpoints
  site: () => apiService.getSiteSettings(),
  collages: (category?: string, featured?: boolean) => apiService.getCollages(category, featured),
  academics: () => apiService.getAcademics(),
  placements: () => apiService.getPlacements(),
  achievements: () => apiService.getAchievements(),
  iqac: () => apiService.getIQAC(),
  alumni: () => apiService.getAlumni(),
  carousel: () => apiService.getCarousel(),
  health: () => apiService.getHealth(),

  // Admin endpoints (require token)
  login: (username: string, password: string) => apiService.login(username, password),
  profile: (token: string) => apiService.getProfile(token),
  updateSite: (token: string, settings: Record<string, any>) => apiService.updateSiteSettings(token, settings),
  createCollage: (token: string, collage: any) => apiService.createCollage(token, collage),
  updateCollage: (token: string, id: number, updates: any) => apiService.updateCollage(token, id, updates),
  deleteCollage: (token: string, id: number) => apiService.deleteCollage(token, id),
  uploadFile: (token: string, file: File) => apiService.uploadFile(token, file),
  uploadFiles: (token: string, files: File[]) => apiService.uploadMultipleFiles(token, files),
  getFiles: (token: string, page?: number, limit?: number) => apiService.getUploadedFiles(token, page, limit),
  deleteFile: (token: string, id: number) => apiService.deleteUploadedFile(token, id),
  export: (token: string, type: 'site' | 'collages' | 'academics') => apiService.exportData(token, type),
  import: (token: string, type: 'site' | 'collages' | 'academics', data: any) => apiService.importData(token, type, data),
};
