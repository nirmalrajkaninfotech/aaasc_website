export interface GalleryItem {
  id: string;
  title: string;
  description?: string; // Made optional
  category: string;
  date: string;
  featured: boolean;
  tags: string[];
  images: string[];
  order?: number;
  published?: boolean;
}

export interface GallerySectionProps {
  items: GalleryItem[];
  title?: string;
  subtitle?: string;
}
