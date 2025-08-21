'use client';
import { useDisableRightClick } from '@/hooks/useDisableRightClick';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableNavItem } from '@/components/SortableNavItem';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import ImageUpload from '@/components/ImageUpload';
import SortableSection from '@/components/SortableSection';
import MultiImageUpload from '@/components/MultiImageUpload';
import { Collage, SiteSettings, RichTextContent, HomepageSection, CarouselItem, AlumniAssociation, ExamCellSection } from '@/types';
import {
  FaAlignLeft,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaEnvelope,
  FaGlobe,
  FaCog,
  FaHashtag,
  FaLink,
  FaPlus,
  FaInfoCircle,
  FaMapMarkedAlt,
  FaBriefcase,
  FaTag,
  FaTimes,
  FaGripVertical,
  FaImages,
  FaQuoteLeft,
  FaGraduationCap,
  FaTrophy,
  FaMedal,
  FaStar,
  FaEdit,
  FaCircle,
  FaImage,
  FaToggleOn
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import {    
    FaShieldAlt, 
    FaHeading, 
    FaEye, 
    FaUsers, 
    FaTrash, 
    FaBullseye, 
    FaCogs, 
    FaTasks, 
    FaSave 
} from 'react-icons/fa';

import { 
    FaClipboardCheck, 
    FaFlag,
    FaBullhorn, 
    FaMousePointer, 
    FaCheckCircle, 
    FaCheck, 
   
} from 'react-icons/fa';

import { 
  
    FaSort 
} from 'react-icons/fa';


import { 
    FaHome,  
    FaEyeSlash, 
    FaLightbulb 
} from 'react-icons/fa';
import { FaChartBar, FaUserTie, FaCloudUploadAlt, FaExternalLinkAlt } from 'react-icons/fa';

import { 
  
    FaIdCard,  
    FaFileAlt, 
} from 'react-icons/fa';

// Placement state type
interface AdminPlacement {
  id: string;
  title: string;
  content: string;
  images: string[];
  alignment: 'left' | 'center' | 'right';
  order?: number;
  published?: boolean;
}

export default function AdminPage() {
    useDisableRightClick();

    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [collages, setCollages] = useState<Collage[]>([]);
    const [activeTab, setActiveTab] = useState<'collages' | 'site' | 'contact' | 'about' | 'academics'|'placements' | 'achievements' | 'homepage' | 'others' | 'carousel' | 'gallery' | 'homepage_image' | 'alumni' | 'navigation' | 'iqac' | 'examCell' | 'faculty' | 'facilities'>('site');
  const [newNavItem, setNewNavItem] = useState({ label: '', href: '' });
  const [editingNavItem, setEditingNavItem] = useState<{ index: number; item: { label: string; href: string } } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveSiteSettings = async (updatedSettings: SiteSettings) => {
    try {
      setSaving(true);
      const response = await fetch('/api/site', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save navigation changes');
      }

      // Update local state with the saved settings
      const savedSettings = await response.json();
      setSiteSettings(savedSettings);
      return savedSettings;
    } catch (error) {
      console.error('Error saving navigation:', error);
      alert('Failed to save navigation changes. Please try again.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && siteSettings) {
      const oldIndex = siteSettings.navLinks.findIndex(item => item.label === active.id);
      const newIndex = siteSettings.navLinks.findIndex(item => item.label === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newNavLinks = arrayMove([...siteSettings.navLinks], oldIndex, newIndex);
        const updatedSettings = {
          ...siteSettings,
          navLinks: newNavLinks
        };
        
        // Save the changes to the backend
        const savedSettings = await saveSiteSettings(updatedSettings);
        if (savedSettings) {
          setSiteSettings(savedSettings);
        }
      }
    }
  };

  const handleAddNavItem = async () => {
    if (!newNavItem.label || !newNavItem.href || !siteSettings) return;
    
    try {
      setSaving(true);
      let updatedNavLinks;
      
      if (editingNavItem) {
        // Update existing item
        updatedNavLinks = [...siteSettings.navLinks];
        updatedNavLinks[editingNavItem.index] = { ...newNavItem };
        setEditingNavItem(null);
      } else {
        // Add new item
        updatedNavLinks = [...siteSettings.navLinks, { ...newNavItem }];
      }
      
      // Save to backend
      const updatedSettings = {
        ...siteSettings,
        navLinks: updatedNavLinks
      };
      
      const savedSettings = await saveSiteSettings(updatedSettings);
      if (savedSettings) {
        setSiteSettings(savedSettings);
        setNewNavItem({ label: '', href: '' });
      }
    } catch (error) {
      console.error('Error saving navigation item:', error);
      alert('Failed to save navigation item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNavItem = (index: number) => {
    const item = siteSettings?.navLinks[index];
    if (item) {
      setNewNavItem({ ...item });
      setEditingNavItem({ index, item });
    }
  };

  const handleRemoveNavItem = async (index: number) => {
    if (!siteSettings) return;
    
    if (!confirm('Are you sure you want to remove this navigation item?')) {
      return;
    }
    
    try {
      setSaving(true);
      const updatedNavLinks = [...siteSettings.navLinks];
      updatedNavLinks.splice(index, 1);
      
      const updatedSettings = {
        ...siteSettings,
        navLinks: updatedNavLinks
      };
      
      const savedSettings = await saveSiteSettings(updatedSettings);
      if (savedSettings) {
        setSiteSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error removing navigation item:', error);
      alert('Failed to remove navigation item. Please try again.');
    } finally {
      setSaving(false);
    }
  };
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Collage form state
    const [newCollage, setNewCollage] = useState({
        title: '',
        description: '',
        category: '',
        featured: false,
        tags: '',
        images: ['']
    });
    const [editingCollage, setEditingCollage] = useState<Collage | null>(null);

    // Rich content form state
    const [newPlacement, setNewPlacement] = useState<AdminPlacement>({
        id: '',
        title: '',
        content: '',
        images: [],
        alignment: 'left',
        published: true,
    });
    const [editingPlacement, setEditingPlacement] = useState<AdminPlacement | null>(null);

    const [newAchievement, setNewAchievement] = useState<Partial<RichTextContent>>({
        title: '',
        content: '',
        image: '',
        alignment: 'left',
        published: true
    });
    const [editingAchievement, setEditingAchievement] = useState<RichTextContent | null>(null);

    const [newAboutStat, setNewAboutStat] = useState<{ label: string; value: string }>({
        label: '',
        value: ''
    });

    const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
    const [newCarousel, setNewCarousel] = useState<Partial<CarouselItem>>({ image: '', caption: '', link: '' });
    const [editingCarousel, setEditingCarousel] = useState<CarouselItem | null>(null);
    const [uploading, setUploading] = useState(false);
    const [carouselOrder, setCarouselOrder] = useState<CarouselItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageDragIndexRef = useRef<number | null>(null);
    const facultyEditImageDragIndexRef = useRef<number | null>(null);
    const facultyNewImageDragIndexRef = useRef<number | null>(null);

    const [placements, setPlacements] = useState<AdminPlacement[]>([]);
    const [loadingPlacements, setLoadingPlacements] = useState(false);
    const [placementError, setPlacementError] = useState<string | null>(null);
    const [placementSectionTitle, setPlacementSectionTitle] = useState<string>('');
    const [placementSectionSubtitle, setPlacementSectionSubtitle] = useState<string>('');

    const handleMultiGalleryUpload = async (urls: string[]) => {
      if (urls.length === 0) return;
      
      try {
        // Create a gallery item for each uploaded image
        const uploadPromises = urls.map(async (url) => {
          await fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: url,
              title: '',
              description: '',
              published: true,
              order: galleryItems.length + 1
            }),
          });
        });
        
        await Promise.all(uploadPromises);
        fetchGallery();
      } catch (error) {
        console.error('Failed to create gallery items:', error);
      }
    };

    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [newGallery, setNewGallery] = useState<Partial<any>>({ image: '', title: '', description: '', published: true });
    const [editingGallery, setEditingGallery] = useState<any | null>(null);
    const [galleryOrder, setGalleryOrder] = useState<any[]>([]);

    const [homepageImage, setHomepageImage] = useState<{ image: string; title: string; description: string }>({ image: '', title: '', description: '' });
    const [homepageImageLoading, setHomepageImageLoading] = useState(false);

    const [alumni, setAlumni] = useState<AlumniAssociation | null>(null);
    const [alumniLoading, setAlumniLoading] = useState(false);
    const [alumniSaving, setAlumniSaving] = useState(false);
    const [alumniError, setAlumniError] = useState<string | null>(null);

    // Add state for examCell and others
    const [examCell, setExamCell] = useState<ExamCellSection>({
      title: '',
      subtitle: '',
      content: '',
      showHero: false,
      showFeatures: false,
      showQuickLinks: false,
      showCTA: false,
      heroButtonText: '',
      ctaButtonText: ''
    });
    const [others, setOthers] = useState({
      aishe: { title: '', subtitle: '', content: '' },
      academicCoordinator: { title: '', subtitle: '', content: '' }
    });

    // IQAC state
    const [iqac, setIqac] = useState<any | null>(null);
    const [iqacLoading, setIqacLoading] = useState(false);
    const [iqacSaving, setIqacSaving] = useState(false);

    const [faculty, setFaculty] = useState(siteSettings?.faculty || { title: 'Faculty', items: [] });
    const [editingFacultyItem, setEditingFacultyItem] = useState<any | null>(null);
    const [newFacultyItem, setNewFacultyItem] = useState({ title: '', slug: '', content: '', order: 1, published: true });

    // Facilities state
    const [facilities, setFacilities] = useState(siteSettings?.facilities || { title: 'Facilities', subtitle: '', items: [] });
    const [editingFacilityIndex, setEditingFacilityIndex] = useState<number | null>(null);
    const [newFacility, setNewFacility] = useState({ id: '', name: '', description: '', image: '', category: '', features: '', published: true, order: 1 });
    const [newFacilityImages, setNewFacilityImages] = useState<string[]>([]);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Handle escape key for modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && editingFacilityIndex !== null) {
                setEditingFacilityIndex(null);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [editingFacilityIndex]);

    useEffect(() => {
      if (siteSettings) {
        setExamCell(siteSettings.examCell || { title: '', subtitle: '', content: '' });
        setOthers(siteSettings.others || {
          aishe: { title: '', subtitle: '', content: '' },
          academicCoordinator: { title: '', subtitle: '', content: '' }
        });
        if (siteSettings.facilities) {
          setFacilities(siteSettings.facilities as any);
        }
      }
    }, [siteSettings]);

    useEffect(() => {
      if (siteSettings?.faculty) setFaculty(siteSettings.faculty);
    }, [siteSettings]);

    // Fetch carousel items
    useEffect(() => {
        if (activeTab === 'carousel') {
            fetchCarousel();
        }
    }, [activeTab]);

    const fetchCarousel = async () => {
        try {
            const res = await fetch('/api/carousel');
            if (res.ok) {
                const data = await res.json();
                setCarouselItems(data.sort((a: CarouselItem, b: CarouselItem) => a.order - b.order));
            }
        } catch (e) {
            console.error('Failed to fetch carousel:', e);
        }
    };

    // Multi-image upload handler
    const handleMultiImageUpload = async (files: FileList | null) => {
        if (!files) return;
        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch('/api/upload', { method: 'POST', body: formData });
                if (response.ok) {
                    const data = await response.json();
                    await fetch('/api/carousel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: data.url }),
                    });
                }
            });
            await Promise.all(uploadPromises);
            fetchCarousel();
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Edit, update, delete
    const handleEditCarousel = (item: CarouselItem) => setEditingCarousel(item);
    const handleUpdateCarousel = async () => {
        if (!editingCarousel) return;
        const res = await fetch('/api/carousel', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingCarousel),
        });
        if (res.ok) {
            setEditingCarousel(null);
            fetchCarousel();
        }
    };
    const handleDeleteCarousel = async (id: string) => {
        if (!window.confirm('Delete this carousel item?')) return;
        const res = await fetch(`/api/carousel?id=${id}`, {
            method: 'DELETE'
        });
        if (res.ok) fetchCarousel();
    };

    // Drag-and-drop ordering
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
    };
    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === targetId) return;
        const draggedIdx = carouselOrder.findIndex(item => item.id === draggedId);
        const targetIdx = carouselOrder.findIndex(item => item.id === targetId);
        if (draggedIdx === -1 || targetIdx === -1) return;
        const newOrder = [...carouselOrder];
        const [draggedItem] = newOrder.splice(draggedIdx, 1);
        newOrder.splice(targetIdx, 0, draggedItem);
        setCarouselOrder(newOrder.map((item, idx) => ({ ...item, order: idx })));
    };
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    // Save order
    const handleSaveOrder = async () => {
        for (const item of carouselOrder) {
            await fetch('/api/carousel', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
        }
        fetchCarousel();
    };

    // Sync order state
    useEffect(() => {
        setCarouselOrder(carouselItems);
    }, [carouselItems]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [siteRes, collagesRes] = await Promise.all([
                fetch('/api/site'),
                fetch('/api/collages')
            ]);

            if (siteRes.ok) {
                const siteData = await siteRes.json();
                setSiteSettings(siteData);
            }

            if (collagesRes.ok) {
                const collagesData = await collagesRes.json();
                setCollages(collagesData);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSiteSettings = async () => {
        if (!siteSettings) return;

        setSaving(true);
        try {
            const res = await fetch('/api/site', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteSettings)
            });

            if (res.ok) {
                alert('Site settings saved successfully!');
            } else {
                alert('Failed to save site settings');
            }
        } catch (error) {
            alert('Error saving site settings');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateCollage = async () => {
        if (!newCollage.title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (!newCollage.category.trim()) {
            alert('Please enter a category');
            return;
        }

        const validImages = newCollage.images.filter(img => img.trim());
        if (validImages.length === 0) {
            alert('Please add at least one image URL');
            return;
        }

        const tagsArray = newCollage.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

        try {
            const res = await fetch('/api/collages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newCollage.title,
                    description: newCollage.description,
                    category: newCollage.category,
                    featured: newCollage.featured,
                    tags: tagsArray,
                    date: new Date().toISOString().split('T')[0],
                    images: validImages
                })
            });

            if (res.ok) {
                setNewCollage({
                    title: '',
                    description: '',
                    category: '',
                    featured: false,
                    tags: '',
                    images: ['']
                });
                fetchData();
                alert('Collage created successfully!');
            } else {
                alert('Failed to create collage');
            }
        } catch (error) {
            alert('Error creating collage');
        }
    };

    const handleUpdateCollage = async () => {
        if (!editingCollage) return;

        try {
            const res = await fetch('/api/collages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCollage)
            });

            if (res.ok) {
                setEditingCollage(null);
                fetchData();
                alert('Collage updated successfully!');
            } else {
                alert('Failed to update collage');
            }
        } catch (error) {
            alert('Error updating collage');
        }
    };

    const handleDeleteCollage = async (id: number) => {
        if (!confirm('Are you sure you want to delete this collage?')) return;

        try {
            const res = await fetch(`/api/collages?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchData();
                alert('Collage deleted successfully!');
            } else {
                alert('Failed to delete collage');
            }
        } catch (error) {
            alert('Error deleting collage');
        }
    };

    // Placement management functions
    const handleCreatePlacement = async () => {
        const id = `placement-${Date.now()}`;
        const newItem: AdminPlacement = {
            ...newPlacement,
            id,
            images: newPlacement.images || [],
        };
        const updated = [...placements, newItem];
        setPlacements(updated);
        setNewPlacement({ id: '', title: '', content: '', images: [], alignment: 'left', published: true });
        await fetch('/api/placements', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Student Placements', subtitle: '', items: updated }),
        });
    };

    const handleUpdatePlacement = async () => {
        if (!editingPlacement) return;
        const updated = placements.map(item => item.id === editingPlacement.id ? editingPlacement : item);
        setPlacements(updated);
        setEditingPlacement(null);
        await fetch('/api/placements', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Student Placements', subtitle: '', items: updated }),
        });
    };

    const handleDeletePlacement = async (id: string) => {
        if (!window.confirm('Delete this placement?')) return;
        const updated = placements.filter(item => item.id !== id);
        setPlacements(updated);
        await fetch('/api/placements', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Student Placements', subtitle: '', items: updated }),
        });
    };

    // Achievement management functions
    const handleCreateAchievement = () => {
        if (!newAchievement.title?.trim()) {
            alert('Please enter a title');
            return;
        }

        const achievement: RichTextContent = {
            id: `achievement-${Date.now()}`,
            title: newAchievement.title,
            content: newAchievement.content || '',
            image: newAchievement.image,
            alignment: newAchievement.alignment || 'left',
            order: (siteSettings?.achievements.items.length || 0) + 1,
            published: newAchievement.published || true
        };

        const updatedSettings = {
            ...siteSettings!,
            achievements: {
                ...siteSettings!.achievements,
                items: [...siteSettings!.achievements.items, achievement]
            }
        };

        setSiteSettings(updatedSettings);
        setNewAchievement({ title: '', content: '', image: '', alignment: 'left', published: true });
        fetch('/api/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSettings),
        });
    };

    const handleUpdateAchievement = () => {
        if (!editingAchievement) return;

        const updatedSettings = {
            ...siteSettings!,
            achievements: {
                ...siteSettings!.achievements,
                items: siteSettings!.achievements.items.map(item =>
                    item.id === editingAchievement.id ? editingAchievement : item
                )
            }
        };

        setSiteSettings(updatedSettings);
        setEditingAchievement(null);
        fetch('/api/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSettings),
        });
    };

    const handleDeleteAchievement = (id: string) => {
        if (!confirm('Are you sure you want to delete this achievement?')) return;

        const updatedSettings = {
            ...siteSettings!,
            achievements: {
                ...siteSettings!.achievements,
                items: siteSettings!.achievements.items.filter(item => item.id !== id)
            }
        };

        setSiteSettings(updatedSettings);
        fetch('/api/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSettings),
        });
    };

    // About management functions
    const handleAddAboutStat = () => {
        if (!newAboutStat.label.trim() || !newAboutStat.value.trim()) {
            alert('Please enter both label and value');
            return;
        }

        const updatedSettings = {
            ...siteSettings!,
            about: {
                ...siteSettings!.about,
                stats: [...siteSettings!.about.stats, { label: newAboutStat.label.trim(), value: newAboutStat.value.trim() }]
            }
        };

        setSiteSettings(updatedSettings);
        setNewAboutStat({ label: '', value: '' });
    };

    const handleRemoveAboutStat = (index: number) => {
        if (!confirm('Remove this stat?')) return;
        const updatedSettings = {
            ...siteSettings!,
            about: {
                ...siteSettings!.about,
                stats: siteSettings!.about.stats.filter((_, i) => i !== index)
            }
        };
        setSiteSettings(updatedSettings);
    };

    // Homepage layout management
    const handleHomepageSectionsChange = (sections: HomepageSection[]) => {
        const updatedSettings = {
            ...siteSettings!,
            homepage: {
                sections
            }
        };
        setSiteSettings(updatedSettings);
    };

    // Fetch gallery items
    useEffect(() => {
        if (activeTab === 'gallery') {
            fetchGallery();
        }
    }, [activeTab]);

    const fetchGallery = async () => {
        try {
            const res = await fetch('/api/gallery');
            if (res.ok) {
                const data = await res.json();
                setGalleryItems(data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
            }
        } catch (e) {
            console.error('Failed to fetch gallery:', e);
        }
    };

    // Gallery image upload handler
    const handleGalleryImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (response.ok) {
            const data = await response.json();
            setNewGallery(prev => ({ ...prev, image: data.url }));
        }
    };

    // Add new gallery image
    const handleAddGallery = async () => {
        if (!newGallery.image) return;
        const res = await fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newGallery,
                published: newGallery.published !== false,
            }),
        });
        if (res.ok) {
            setNewGallery({ image: '', title: '', description: '', published: true });
            fetchGallery();
        }
    };

    // Edit, update, delete gallery
    const handleEditGallery = (item: any) => setEditingGallery(item);
    const handleUpdateGallery = async () => {
        if (!editingGallery) return;
        const res = await fetch('/api/gallery', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingGallery),
        });
        if (res.ok) {
            setEditingGallery(null);
            fetchGallery();
        }
    };
    const handleDeleteGallery = async (id: string) => {
        if (!window.confirm('Delete this gallery image?')) return;
        const res = await fetch(`/api/gallery?id=${id}`, {
            method: 'DELETE'
        });
        if (res.ok) fetchGallery();
    };

    // Drag-and-drop ordering for gallery
    const handleGalleryDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
    };
    const handleGalleryDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === targetId) return;
        const draggedIdx = galleryOrder.findIndex(item => item.id === draggedId);
        const targetIdx = galleryOrder.findIndex(item => item.id === targetId);
        if (draggedIdx === -1 || targetIdx === -1) return;
        const newOrder = [...galleryOrder];
        const [draggedItem] = newOrder.splice(draggedIdx, 1);
        newOrder.splice(targetIdx, 0, draggedItem);
        setGalleryOrder(newOrder.map((item, idx) => ({ ...item, order: idx })));
    };
    const handleGalleryDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleSaveGalleryOrder = async () => {
        for (const item of galleryOrder) {
            await fetch('/api/gallery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
        }
        fetchGallery();
    };
    useEffect(() => {
        setGalleryOrder(galleryItems);
    }, [galleryItems]);

    // Fetch homepage image
    useEffect(() => {
        if (activeTab === 'homepage_image') {
            fetchHomepageImage();
        }
    }, [activeTab]);

    const fetchHomepageImage = async () => {
        setHomepageImageLoading(true);
        try {
            const res = await fetch('/api/site');
            if (res.ok) {
                const data = await res.json();
                setHomepageImage(data.homepage_image || { image: '', title: '', description: '' });
            }
        } finally {
            setHomepageImageLoading(false);
        }
    };

    const handleHomepageImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (response.ok) {
            const data = await response.json();
            setHomepageImage(prev => ({ ...prev, image: data.url }));
        }
    };

    const handleSaveHomepageImage = async () => {
        setHomepageImageLoading(true);
        try {
            // Fetch current site settings
            const res = await fetch('/api/site');
            if (!res.ok) return;
            const siteData = await res.json();
            // Update homepage_image
            siteData.homepage_image = homepageImage;
            // Save
            await fetch('/api/site', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteData)
            });
        } finally {
            setHomepageImageLoading(false);
        }
    };

    // Toggle homepage_image for a gallery item
    const handleToggleHomepageImage = async (item: any) => {
        const updated = galleryItems.map(g => g.id === item.id ? { ...g, homepage_image: !g.homepage_image } : g);
        setGalleryItems(updated);
        // Save to backend
        for (const g of updated) {
            await fetch('/api/gallery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(g),
            });
        }
        fetchGallery();
    };

    // Fetch alumni data
    useEffect(() => {
        if (activeTab === 'alumni') {
            setAlumniLoading(true);
            fetch('/api/alumni')
                .then(res => res.json())
                .then(data => setAlumni(data))
                .catch(() => setAlumniError('Failed to load alumni data'))
                .finally(() => setAlumniLoading(false));
        }
    }, [activeTab]);

    // Fetch IQAC data
    useEffect(() => {
      if (activeTab === 'iqac') {
        setIqacLoading(true);
        fetch('/api/iqac')
          .then(res => res.json())
          .then(data => setIqac(data))
          .finally(() => setIqacLoading(false));
      }
    }, [activeTab]);

    const handleAlumniChange = (field: keyof AlumniAssociation, value: any) => {
        setAlumni(prev => prev ? { ...prev, [field]: value } : prev);
    };
    const handleAlumniMembersChange = (value: string) => {
        try {
            const members = JSON.parse(value);
            setAlumni(prev => prev ? { ...prev, members } : prev);
            setAlumniError(null);
        } catch {
            setAlumniError('Invalid JSON for members');
        }
    };
    const handleSaveAlumni = async () => {
        if (!alumni) return;
        setAlumniSaving(true);
        setAlumniError(null);
        try {
            const res = await fetch('/api/alumni', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alumni)
            });
            if (!res.ok) throw new Error('Failed to save');
            alert('Alumni Association content saved!');
        } catch {
            setAlumniError('Failed to save alumni data');
        } finally {
            setAlumniSaving(false);
        }
    };

    // Fetch placements from API (and section meta)
    useEffect(() => {
      if (activeTab === 'placements') {
        setLoadingPlacements(true);
        fetch('/api/placements')
          .then(res => res.json())
          .then(data => {
            setPlacements(data.items || []);
            setPlacementSectionTitle(data.title || '');
            setPlacementSectionSubtitle(data.subtitle || '');
          })
          .catch(() => setPlacementError('Failed to load placements'))
          .finally(() => setLoadingPlacements(false));
      }
    }, [activeTab]);

    const handleSaveFaculty = async () => {
      if (!siteSettings) return;
      const updated: SiteSettings = { ...siteSettings, faculty } as SiteSettings;
      const saved = await saveSiteSettings(updated);
      if (saved) setFaculty(saved.faculty);
    };

    const handleSaveExamCell = async () => {
      if (!siteSettings) return;
      const updated: SiteSettings = { ...siteSettings, examCell } as SiteSettings;
      const saved = await saveSiteSettings(updated);
      if (saved) setExamCell(saved.examCell);
    };

    const handleSaveOthers = async () => {
      if (!siteSettings) return;
      const updated: SiteSettings = { ...siteSettings, others } as SiteSettings;
      const saved = await saveSiteSettings(updated);
      if (saved) setOthers(saved.others);
    };

    const handleLogout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } finally {
        window.location.href = '/login';
      }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!siteSettings) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Failed to load site settings</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <a href="/" className="text-sm text-blue-600 hover:underline">Back to site</a>
                        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex flex-wrap gap-2 mb-8">
                    {/* Removed Manage Collages tab */}
                    <button
                        onClick={() => setActiveTab('site')}
                        className={`px-4 py-2 rounded ${activeTab === 'site' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Site Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`px-4 py-2 rounded ${activeTab === 'contact' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Contact Info
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-4 py-2 rounded ${activeTab === 'about' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        About
                    </button>
                    <a
                        href="/admin/academics"
                        className="px-4 py-2 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    >
                        Academics
                    </a>
                    <button
                        onClick={() => setActiveTab('placements')}
                        className={`px-4 py-2 rounded ${activeTab === 'placements' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Placements
                    </button>
                    <button
                        onClick={() => setActiveTab('facilities')}
                        className={`px-4 py-2 rounded ${activeTab === 'facilities' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Facilities
                    </button>
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`px-4 py-2 rounded ${activeTab === 'achievements' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Achievements
                    </button>
                    <button
                        onClick={() => setActiveTab('homepage')}
                        className={`px-4 py-2 rounded ${activeTab === 'homepage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Homepage Layout
                    </button>
                    <button
                        onClick={() => setActiveTab('others')}
                        className={`px-4 py-2 rounded ${activeTab === 'others' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Others
                    </button>
                    <button
                        onClick={() => setActiveTab('carousel')}
                        className={`px-4 py-2 rounded ${activeTab === 'carousel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Carousel
                    </button>
                    <a
                        href="/admin/gallery"
                        className="px-4 py-2 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    >
                        Gallery
                    </a>
                    <button
                        onClick={() => setActiveTab('navigation')}
                        className={`px-4 py-2 rounded ${activeTab === 'navigation' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Navigation
                    </button>
                    <button
                        onClick={() => setActiveTab('iqac')}
                        className={`px-4 py-2 rounded ${activeTab === 'iqac' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        IQAC
                    </button>
                    <button
                        onClick={() => setActiveTab('examCell')}
                        className={`px-4 py-2 rounded ${activeTab === 'examCell' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Exam Cell
                    </button>
                    <button
                        onClick={() => setActiveTab('faculty')}
                        className={`px-4 py-2 rounded ${activeTab === 'faculty' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Faculty
                    </button>
                </nav>

                {/* Navigation Management Tab */}
                {activeTab === 'navigation' && siteSettings && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Manage Navigation Links</h2>
                            
                            {/* Add/Edit Navigation Item Form */}
                            <div className="bg-gray-50 p-4 rounded-md mb-6">
                                <h3 className="text-lg font-medium mb-3">
                                    {editingNavItem ? 'Edit Navigation Item' : 'Add New Navigation Item'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={newNavItem.label}
                                            onChange={(e) => setNewNavItem({ ...newNavItem, label: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="e.g., Home, About"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL Path
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                /
                                            </span>
                                            <input
                                                type="text"
                                                value={newNavItem.href.replace(/^\//, '')}
                                                onChange={(e) => setNewNavItem({ 
                                                    ...newNavItem, 
                                                    href: e.target.value ? `/${e.target.value}` : '' 
                                                })}
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300"
                                                placeholder="about"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    {editingNavItem && (
                                        <button
                                            onClick={() => {
                                                setNewNavItem({ label: '', href: '' });
                                                setEditingNavItem(null);
                                            }}
                                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleAddNavItem}
                                        disabled={!newNavItem.label || !newNavItem.href}
                                        className={`px-4 py-2 text-sm text-white rounded-md ${
                                            !newNavItem.label || !newNavItem.href 
                                                ? 'bg-blue-300 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {editingNavItem ? 'Update Item' : 'Add Item'}
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Items List */}
                            <div>
                                <h3 className="text-lg font-medium mb-3">Navigation Items</h3>
                                {siteSettings.navLinks.length === 0 ? (
                                    <p className="text-gray-500 italic">No navigation items added yet.</p>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                        modifiers={[restrictToVerticalAxis]}
                                    >
                                        <SortableContext 
                                            items={siteSettings.navLinks.map(item => item.label)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2">
                                                {siteSettings.navLinks.map((item, index) => (
                                                    <SortableNavItem 
                                                        key={`${item.label}-${index}`}
                                                        id={item.label}
                                                        onEdit={() => handleEditNavItem(index)}
                                                        onRemove={() => handleRemoveNavItem(index)}
                                                    >
                                                        <span className="font-medium">{item.label}</span>
                                                        <span className="text-sm text-gray-500 ml-2">{item.href}</span>
                                                    </SortableNavItem>
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </div>
                    </div>
                )}
          {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="space-y-8">
                        {/* About Basics */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">About Section</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={siteSettings.about.title}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            about: { ...siteSettings.about, title: e.target.value }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Master Caption</label>
                                    <input
                                        type="text"
                                        value={siteSettings.about.masterCaption || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            about: { ...siteSettings.about, masterCaption: e.target.value }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Global caption/strapline for About section"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                    <RichTextEditor
                                        value={siteSettings.about.content || ''}
                                        onChange={(content) => setSiteSettings({
                                            ...siteSettings,
                                            about: { ...siteSettings.about, content }
                                        })}
                                        placeholder="Write about your college..."
                                    />
                                </div>

                                <div>
                                    <ImageUpload
                                        value={siteSettings.about.image}
                                        onChange={(image) => setSiteSettings({
                                            ...siteSettings,
                                            about: { ...siteSettings.about, image }
                                        })}
                                        label="About Main Image"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        id="about-gallery-enabled"
                                        type="checkbox"
                                        checked={siteSettings.about.galleryEnabled ?? true}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            about: { ...siteSettings.about, galleryEnabled: e.target.checked }
                                        })}
                                    />
                                    <label htmlFor="about-gallery-enabled" className="text-sm text-gray-700">Enable About Gallery</label>
                                </div>

                                <div>
                                    {siteSettings.about.galleryEnabled !== false && (
                                        <MultiImageUpload
                                            label="About Gallery Images"
                                            onUpload={(urls) => setSiteSettings({
                                                ...siteSettings,
                                                about: { ...siteSettings.about, images: [...(siteSettings.about.images || []), ...urls.map((u)=>({ url: u }))] }
                                            })}
                                        />
                                    )}

                                    {siteSettings.about.galleryEnabled !== false && siteSettings.about.images && siteSettings.about.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {siteSettings.about.images.map((img, idx) => (
                                                <div
                                                    key={`${img.url}-${idx}`}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('text/plain', String(idx));
                                                    }}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const fromIndex = Number(e.dataTransfer.getData('text/plain'));
                                                        const toIndex = idx;
                                                        if (isNaN(fromIndex)) return;
                                                        const next = [...(siteSettings.about.images || [])];
                                                        const [moved] = next.splice(fromIndex, 1);
                                                        next.splice(toIndex, 0, moved);
                                                        setSiteSettings({
                                                            ...siteSettings,
                                                            about: { ...siteSettings.about, images: next }
                                                        });
                                                    }}
                                                    className="relative h-28 border rounded overflow-hidden group"
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt={`About image ${idx + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                                    <button
                                                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                                                        onClick={() => {
                                                            const next = (siteSettings.about.images || []).filter((_, i) => i !== idx);
                                                            setSiteSettings({
                                                                ...siteSettings,
                                                                about: { ...siteSettings.about, images: next }
                                                            });
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Key Stats</h3>

                            {siteSettings.about.stats.length === 0 ? (
                                <p className="text-gray-500 mb-4">No stats yet.</p>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    {siteSettings.about.stats.map((stat, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                                            <input
                                                type="text"
                                                value={stat.label}
                                                onChange={(e) => {
                                                    const newStats = [...siteSettings.about.stats];
                                                    newStats[index] = { ...newStats[index], label: e.target.value };
                                                    setSiteSettings({
                                                        ...siteSettings,
                                                        about: { ...siteSettings.about, stats: newStats }
                                                    });
                                                }}
                                                className="md:col-span-3 p-2 border border-gray-300 rounded-md"
                                                placeholder="Label (e.g., Students)"
                                            />
                                            <input
                                                type="text"
                                                value={stat.value}
                                                onChange={(e) => {
                                                    const newStats = [...siteSettings.about.stats];
                                                    newStats[index] = { ...newStats[index], value: e.target.value };
                                                    setSiteSettings({
                                                        ...siteSettings,
                                                        about: { ...siteSettings.about, stats: newStats }
                                                    });
                                                }}
                                                className="md:col-span-3 p-2 border border-gray-300 rounded-md"
                                                placeholder="Value (e.g., 15,000+)"
                                            />
                                            <button
                                                onClick={() => handleRemoveAboutStat(index)}
                                                className="md:col-span-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                                <input
                                    type="text"
                                    value={newAboutStat.label}
                                    onChange={(e) => setNewAboutStat({ ...newAboutStat, label: e.target.value })}
                                    className="md:col-span-3 p-2 border border-gray-300 rounded-md"
                                    placeholder="New stat label"
                                />
                                <input
                                    type="text"
                                    value={newAboutStat.value}
                                    onChange={(e) => setNewAboutStat({ ...newAboutStat, value: e.target.value })}
                                    className="md:col-span-3 p-2 border border-gray-300 rounded-md"
                                    placeholder="New stat value"
                                />
                                <button
                                    onClick={handleAddAboutStat}
                                    className="md:col-span-1 px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Subsections */}
                            <div className="mt-10 space-y-10">
                                {/* Committee */}
                                <div className="border-t pt-8">
                                    <h3 className="text-lg font-semibold mb-4">College Management Committee</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={siteSettings.about.committee?.title || 'College Management Committee'}
                                            onChange={(e) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    committee: {
                                                        ...(siteSettings.about.committee || { title: '', content: '', image: '' }),
                                                        title: e.target.value
                                                    }
                                                }
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Section title"
                                        />
                                        <RichTextEditor
                                            value={siteSettings.about.committee?.content || ''}
                                            onChange={(content) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    committee: {
                                                        ...(siteSettings.about.committee || { title: 'College Management Committee', content: '', image: '' }),
                                                        content
                                                    }
                                                }
                                            })}
                                            placeholder="Write committee content..."
                                        />
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <ImageUpload
                                                    value={siteSettings.about.committee?.image || ''}
                                                    onChange={(image) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            committee: {
                                                                ...(siteSettings.about.committee || { title: 'College Management Committee', content: '', image: '', alignment: 'left' }),
                                                                image
                                                            }
                                                        }
                                                    })}
                                                    label="Committee Image (optional)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Alignment</label>
                                                <select
                                                    value={siteSettings.about.committee?.alignment || 'left'}
                                                    onChange={(e) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            committee: {
                                                                ...(siteSettings.about.committee || { title: 'College Management Committee', content: '', image: '', alignment: 'left' }),
                                                                alignment: e.target.value as 'left' | 'right'
                                                            }
                                                        }
                                                    })}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Temple Administration */}
                                <div className="border-t pt-8">
                                    <h3 className="text-lg font-semibold mb-4">Temple Administration</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={siteSettings.about.templeAdministration?.title || 'Temple Administration'}
                                            onChange={(e) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    templeAdministration: {
                                                        ...(siteSettings.about.templeAdministration || { title: '', content: '', image: '' }),
                                                        title: e.target.value
                                                    }
                                                }
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Section title"
                                        />
                                        <RichTextEditor
                                            value={siteSettings.about.templeAdministration?.content || ''}
                                            onChange={(content) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    templeAdministration: {
                                                        ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', image: '' }),
                                                        content
                                                    }
                                                }
                                            })}
                                            placeholder="Write temple administration content..."
                                        />
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <ImageUpload
                                                    value={siteSettings.about.templeAdministration?.image || ''}
                                                    onChange={(image) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            templeAdministration: {
                                                                ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', image: '', alignment: 'left' }),
                                                                image
                                                            }
                                                        }
                                                    })}
                                                    label="Temple Administration Image (optional)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Alignment</label>
                                                <select
                                                    value={siteSettings.about.templeAdministration?.alignment || 'left'}
                                                    onChange={(e) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            templeAdministration: {
                                                                ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', image: '', alignment: 'left' }),
                                                                alignment: e.target.value as 'left' | 'right'
                                                            }
                                                        }
                                                    })}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Secretary Message */}
                                <div className="border-t pt-8">
                                    <h3 className="text-lg font-semibold mb-4">Secretary Message</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={siteSettings.about.secretaryMessage?.title || 'Secretary Message'}
                                            onChange={(e) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    secretaryMessage: {
                                                        ...(siteSettings.about.secretaryMessage || { title: '', content: '', image: '' }),
                                                        title: e.target.value
                                                    }
                                                }
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Section title"
                                        />
                                        <RichTextEditor
                                            value={siteSettings.about.secretaryMessage?.content || ''}
                                            onChange={(content) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    secretaryMessage: {
                                                        ...(siteSettings.about.secretaryMessage || { title: 'Secretary Message', content: '', image: '' }),
                                                        content
                                                    }
                                                }
                                            })}
                                            placeholder="Write secretary message..."
                                        />
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <ImageUpload
                                                    value={siteSettings.about.secretaryMessage?.image || ''}
                                                    onChange={(image) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            secretaryMessage: {
                                                                ...(siteSettings.about.secretaryMessage || { title: 'Secretary Message', content: '', image: '', alignment: 'left' }),
                                                                image
                                                            }
                                                        }
                                                    })}
                                                    label="Secretary Image (optional)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Alignment</label>
                                                <select
                                                    value={siteSettings.about.secretaryMessage?.alignment || 'left'}
                                                    onChange={(e) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            secretaryMessage: {
                                                                ...(siteSettings.about.secretaryMessage || { title: 'Secretary Message', content: '', image: '', alignment: 'left' }),
                                                                alignment: e.target.value as 'left' | 'right'
                                                            }
                                                        }
                                                    })}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Principal Message */}
                                <div className="border-t pt-8">
                                    <h3 className="text-lg font-semibold mb-4">Principal Message</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={siteSettings.about.principalMessage?.title || 'Principal Message'}
                                            onChange={(e) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    principalMessage: {
                                                        ...(siteSettings.about.principalMessage || { title: '', content: '', image: '' }),
                                                        title: e.target.value
                                                    }
                                                }
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Section title"
                                        />
                                        <RichTextEditor
                                            value={siteSettings.about.principalMessage?.content || ''}
                                            onChange={(content) => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    principalMessage: {
                                                        ...(siteSettings.about.principalMessage || { title: 'Principal Message', content: '', image: '' }),
                                                        content
                                                    }
                                                }
                                            })}
                                            placeholder="Write principal message..."
                                        />
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <ImageUpload
                                                    value={siteSettings.about.principalMessage?.image || ''}
                                                    onChange={(image) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            principalMessage: {
                                                                ...(siteSettings.about.principalMessage || { title: 'Principal Message', content: '', image: '', alignment: 'left' }),
                                                                image
                                                            }
                                                        }
                                                    })}
                                                    label="Principal Image (optional)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Alignment</label>
                                                <select
                                                    value={siteSettings.about.principalMessage?.alignment || 'left'}
                                                    onChange={(e) => setSiteSettings({
                                                        ...siteSettings,
                                                        about: {
                                                            ...siteSettings.about,
                                                            principalMessage: {
                                                                ...(siteSettings.about.principalMessage || { title: 'Principal Message', content: '', image: '', alignment: 'left' }),
                                                                alignment: e.target.value as 'left' | 'right'
                                                            }
                                                        }
                                                    })}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Extra Sections */}
                                <div className="border-t pt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">More Sections</h3>
                                        <button
                                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            onClick={() => setSiteSettings({
                                                ...siteSettings,
                                                about: {
                                                    ...siteSettings.about,
                                                    extraSections: [
                                                        ...((siteSettings.about.extraSections) || []),
                                                        { title: 'New Section', content: '', image: '', images: [], alignment: 'left' }
                                                    ]
                                                }
                                            })}
                                        >
                                            + Add Section
                                        </button>
                                    </div>

                                    {(siteSettings.about.extraSections || []).map((sec, idx) => (
                                        <div key={idx} className="mb-8 p-4 border rounded-md space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    value={sec.title}
                                                    onChange={(e) => {
                                                        const next = [...(siteSettings.about.extraSections || [])];
                                                        next[idx] = { ...next[idx], title: e.target.value } as any;
                                                        setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                    placeholder="Section title"
                                                />
                                                <select
                                                    value={sec.alignment || 'left'}
                                                    onChange={(e) => {
                                                        const next = [...(siteSettings.about.extraSections || [])];
                                                        next[idx] = { ...next[idx], alignment: e.target.value as any } as any;
                                                        setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>

                                            <RichTextEditor
                                                value={sec.content || ''}
                                                onChange={(content) => {
                                                    const next = [...(siteSettings.about.extraSections || [])];
                                                    next[idx] = { ...next[idx], content } as any;
                                                    setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                }}
                                                placeholder="Write section content..."
                                            />

                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <ImageUpload
                                                        value={sec.image || ''}
                                                        onChange={(image) => {
                                                            const next = [...(siteSettings.about.extraSections || [])];
                                                            next[idx] = { ...next[idx], image } as any;
                                                            setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                        }}
                                                        label="Section Main Image (optional)"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <MultiImageUpload
                                                        label="Section Images (optional)"
                                                        onUpload={(urls) => {
                                                            const next = [...(siteSettings.about.extraSections || [])];
                                                            const current = (next[idx] as any).images || [];
                                                            const wrapped = urls.map(url => ({ url, caption: '', subtitle: '' }));
                                                            next[idx] = { ...next[idx], images: [...current, ...wrapped] } as any;
                                                            setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                        }}
                                                    />
                                                    {sec.images && sec.images.length > 0 && (
                                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {sec.images.map((img, i) => (
                                                                <div key={`${img.url}-${i}`} className="border rounded overflow-hidden">
                                                                    <div className="relative h-28">
                                                                        <Image src={img.url} alt="" fill className="object-cover" />
                                                                    </div>
                                                                    <div className="p-2 space-y-2">
                                                                        <input
                                                                            type="text"
                                                                            value={img.caption || ''}
                                                                            onChange={(e) => {
                                                                                const nextImgs = [...(sec.images || [])];
                                                                                nextImgs[i] = { ...nextImgs[i], caption: e.target.value } as any;
                                                                                const next = [...(siteSettings.about.extraSections || [])];
                                                                                next[idx] = { ...(next[idx] as any), images: nextImgs } as any;
                                                                                setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                                            }}
                                                                            placeholder="Caption"
                                                                            className="w-full p-2 border rounded"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={img.subtitle || ''}
                                                                            onChange={(e) => {
                                                                                const nextImgs = [...(sec.images || [])];
                                                                                nextImgs[i] = { ...nextImgs[i], subtitle: e.target.value } as any;
                                                                                const next = [...(siteSettings.about.extraSections || [])];
                                                                                next[idx] = { ...(next[idx] as any), images: nextImgs } as any;
                                                                                setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                                            }}
                                                                            placeholder="Subtitle"
                                                                            className="w-full p-2 border rounded"
                                                                        />
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-xs text-gray-500">Drag to reorder</span>
                                                                            <button className="text-red-600 text-xs" onClick={()=>{const nextImgs=(sec.images || []).filter((_,k)=>k!==i); const next=[...(siteSettings.about.extraSections || [])]; next[idx]={ ...(next[idx] as any), images: nextImgs } as any; setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });}}>Remove</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <button className="text-red-600" onClick={()=>{
                                                    const next=(siteSettings.about.extraSections || []).filter((_,k)=>k!==idx);
                                                    setSiteSettings({ ...siteSettings, about: { ...siteSettings.about, extraSections: next } });
                                                }}>Delete Section</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSiteSettings}
                                disabled={saving}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save About Section'}
                            </button>
                        </div>
                    </div>
                )}

        {/* Site Settings Tab */}
{activeTab === 'site' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
    >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white">
                    <FaCog className="text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Site Settings
                    </h2>
                    <p className="text-gray-600 text-lg">Configure your website's basic information and appearance</p>
                </div>
            </div>
        </div>

        <div className="p-8 space-y-8">
            {/* Basic Settings Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaGlobe className="text-blue-500" />
                            Site Title
                        </label>
                        <input
                            type="text"
                            value={siteSettings.siteTitle}
                            onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your site title"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaImage className="text-purple-500" />
                            Logo URL
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={siteSettings.logo}
                                onChange={(e) => setSiteSettings({ ...siteSettings, logo: e.target.value })}
                                className="w-full p-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter logo URL"
                            />
                            {siteSettings.logo && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <img src={siteSettings.logo} alt="Logo preview" className="w-8 h-8 object-cover rounded" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Navigation Links Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
                        <h3 className="text-xl font-bold text-gray-800">Navigation Links</h3>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const newNavLinks = [...siteSettings.navLinks, { label: '', href: '' }];
                            setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Nav Link
                    </motion.button>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {siteSettings.navLinks.map((link, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">Label</label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newNavLinks = [...siteSettings.navLinks];
                                                newNavLinks[index] = { ...link, label: e.target.value };
                                                setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                            }}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter link label"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={link.href}
                                                onChange={(e) => {
                                                    const newNavLinks = [...siteSettings.navLinks];
                                                    newNavLinks[index] = { ...link, href: e.target.value };
                                                    setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                                }}
                                                className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="Enter URL"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const newNavLinks = siteSettings.navLinks.filter((_, i) => i !== index);
                                                    setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                                }}
                                                className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors duration-200"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {siteSettings.navLinks.length === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            No navigation links added yet. Click "Add Nav Link" to get started.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Footer Settings Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Footer Settings</h3>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaAlignLeft className="text-orange-500" />
                        Footer Text
                    </label>
                    <textarea
                        value={siteSettings.footer.text}
                        onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            footer: { ...siteSettings.footer, text: e.target.value }
                        })}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        rows={3}
                        placeholder="Enter footer text (copyright, description, etc.)"
                    />
                </div>
            </motion.div>

            {/* Social Links Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                        <h3 className="text-xl font-bold text-gray-800">Social Links</h3>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const newSocialLinks = [...siteSettings.footer.socialLinks, { label: '', href: '' }];
                            setSiteSettings({
                                ...siteSettings,
                                footer: { ...siteSettings.footer, socialLinks: newSocialLinks }
                            });
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Social Link
                    </motion.button>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {siteSettings.footer.socialLinks.map((link, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                            <FaHashtag className="text-pink-500" />
                                            Platform
                                        </label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newSocialLinks = [...siteSettings.footer.socialLinks];
                                                newSocialLinks[index] = { ...link, label: e.target.value };
                                                setSiteSettings({
                                                    ...siteSettings,
                                                    footer: { ...siteSettings.footer, socialLinks: newSocialLinks }
                                                });
                                            }}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                                            placeholder="e.g., Facebook, Twitter, Instagram"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                            <FaLink className="text-rose-500" />
                                            URL
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={link.href}
                                                onChange={(e) => {
                                                    const newSocialLinks = [...siteSettings.footer.socialLinks];
                                                    newSocialLinks[index] = { ...link, href: e.target.value };
                                                    setSiteSettings({
                                                        ...siteSettings,
                                                        footer: { ...siteSettings.footer, socialLinks: newSocialLinks }
                                                    });
                                                }}
                                                className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                                                placeholder="https://..."
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const newSocialLinks = siteSettings.footer.socialLinks.filter((_, i) => i !== index);
                                                    setSiteSettings({
                                                        ...siteSettings,
                                                        footer: { ...siteSettings.footer, socialLinks: newSocialLinks }
                                                    });
                                                }}
                                                className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors duration-200"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {siteSettings.footer.socialLinks.length === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-dashed border-pink-300">
                            No social links added yet. Click "Add Social Link" to connect your social media.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center pt-8 border-t border-gray-200"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveSiteSettings}
                    disabled={saving}
                    className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                        saving 
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl'
                    }`}
                >
                    {saving ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                            />
                            Saving Settings...
                        </>
                    ) : (
                        <>
                            <FaSave />
                            Save Site Settings
                        </>
                    )}
                </motion.button>
            </motion.div>
        </div>
    </motion.div>
)}


{/* Contact Info Tab */}
{activeTab === 'contact' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
    >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white">
                    <FaPhone className="text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Contact Information
                    </h2>
                    <p className="text-gray-600 text-lg">Update contact details and location information for your site</p>
                </div>
            </div>
        </div>

        <div className="p-8 space-y-8">
            {/* Address Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Location Details</h3>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-emerald-500" />
                        Business Address
                    </label>
                    <div className="relative">
                        <textarea
                            value={siteSettings.contact.address}
                            onChange={(e) =>
                                setSiteSettings({
                                    ...siteSettings,
                                    contact: { ...siteSettings.contact, address: e.target.value },
                                })
                            }
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                            rows={3}
                            placeholder="Enter your complete business address..."
                        />
                        <div className="absolute top-3 right-3">
                            <FaMapMarkerAlt className="text-gray-300" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Contact Methods Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Contact Methods</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaPhone className="text-blue-500" />
                            Phone Number
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={siteSettings.contact.phone}
                                onChange={(e) =>
                                    setSiteSettings({
                                        ...siteSettings,
                                        contact: { ...siteSettings.contact, phone: e.target.value },
                                    })
                                }
                                className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter phone number"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FaPhone className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaEnvelope className="text-cyan-500" />
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={siteSettings.contact.email}
                                onChange={(e) =>
                                    setSiteSettings({
                                        ...siteSettings,
                                        contact: { ...siteSettings.contact, email: e.target.value },
                                    })
                                }
                                className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter email address"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FaEnvelope className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Business Hours Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Business Hours</h3>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaClock className="text-orange-500" />
                        Office Hours
                    </label>
                    <div className="relative">
                        <textarea
                            value={siteSettings.contact.officeHours}
                            onChange={(e) =>
                                setSiteSettings({
                                    ...siteSettings,
                                    contact: { ...siteSettings.contact, officeHours: e.target.value },
                                })
                            }
                            className="w-full p-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                            rows={3}
                            placeholder="e.g., Monday - Friday: 9:00 AM - 5:00 PM&#10;Saturday: 10:00 AM - 2:00 PM&#10;Sunday: Closed"
                        />
                        <div className="absolute top-3 right-3">
                            <FaClock className="text-gray-300" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <FaInfoCircle className="text-blue-400" />
                        Include all relevant operating hours and special schedules
                    </p>
                </div>
            </motion.div>

            {/* Map Integration Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Map Integration</h3>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaMapMarkedAlt className="text-purple-500" />
                        Google Maps Embed URL
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={siteSettings.contact.googleMapsUrl || ''}
                            onChange={(e) =>
                                setSiteSettings({
                                    ...siteSettings,
                                    contact: { ...siteSettings.contact, googleMapsUrl: e.target.value },
                                })
                            }
                            className="w-full p-4 pl-12 pr-16 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="https://maps.google.com/embed?..."
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FaMapMarkedAlt className="text-gray-400" />
                        </div>
                        {siteSettings.contact.googleMapsUrl && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-3">
                        <p className="text-sm text-purple-700 flex items-start gap-2">
                            <FaInfoCircle className="text-purple-500 mt-0.5 flex-shrink-0" />
                            <span>
                                To get the embed URL: Go to Google Maps → Search your location → Click "Share" → 
                                Choose "Embed a map" → Copy the URL from the iframe src attribute
                            </span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Preview Section */}
            {(siteSettings.contact.address || siteSettings.contact.phone || siteSettings.contact.email) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-6 bg-gradient-to-b from-gray-500 to-blue-500 rounded-full"></span>
                        <h4 className="text-lg font-bold text-gray-800">Contact Information Preview</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {siteSettings.contact.address && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
                                    <FaMapMarkerAlt />
                                    Address
                                </div>
                                <p className="text-gray-700 text-sm whitespace-pre-line">
                                    {siteSettings.contact.address}
                                </p>
                            </div>
                        )}
                        
                        {siteSettings.contact.phone && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                                    <FaPhone />
                                    Phone
                                </div>
                                <p className="text-gray-700 text-sm">
                                    {siteSettings.contact.phone}
                                </p>
                            </div>
                        )}
                        
                        {siteSettings.contact.email && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2 text-cyan-600 font-medium mb-2">
                                    <FaEnvelope />
                                    Email
                                </div>
                                <p className="text-gray-700 text-sm">
                                    {siteSettings.contact.email}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-8 border-t border-gray-200"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveSiteSettings}
                    disabled={saving}
                    className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                        saving 
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-2xl'
                    }`}
                >
                    {saving ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                            />
                            Saving Contact Info...
                        </>
                    ) : (
                        <>
                            <FaSave />
                            Save Contact Information
                        </>
                    )}
                </motion.button>
            </motion.div>
        </div>
    </motion.div>
)}


                {/* Placements Tab */}
{/* Placements Tab */}
{activeTab === 'placements' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white">
                        <FaBriefcase className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Placement Management
                        </h2>
                        <p className="text-gray-600 text-lg">Showcase your students' career success and placement achievements</p>
                    </div>
                </div>
            </div>

            {/* Section Settings */}
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Section Configuration</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaGraduationCap className="text-indigo-500" />
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={placementSectionTitle}
                            onChange={(e) => setPlacementSectionTitle(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            placeholder="Student Placements"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaQuoteLeft className="text-purple-500" />
                            Section Subtitle
                        </label>
                        <input
                            type="text"
                            value={placementSectionSubtitle}
                            onChange={(e) => setPlacementSectionSubtitle(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Our graduates excel in top companies worldwide."
                        />
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Main Content Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Placement Content</h3>
                </div>
            </div>

            <div className="p-8">
                {loadingPlacements ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-16 text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
                        />
                        <p className="text-gray-500 text-lg">Loading placement content...</p>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {/* Main Description */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                                <h4 className="text-lg font-bold text-gray-800">Main Description</h4>
                            </div>
                            
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                <RichTextEditor
                                    value={placements[0]?.content || ''}
                                    onChange={(content) => {
                                        if (placements.length === 0) {
                                            setPlacements([{ 
                                                id: crypto.randomUUID(), 
                                                title: 'Placement', 
                                                content, 
                                                images: [], 
                                                alignment: 'left', 
                                                published: true 
                                            }]);
                                        } else {
                                            const updated = [...placements];
                                            updated[0] = { ...updated, content };
                                            setPlacements(updated);
                                        }
                                    }}
                                    placeholder="Write placement description highlighting achievements, statistics, and success stories..."
                                />
                            </div>
                        </motion.div>

                        {/* Images Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                                <h4 className="text-lg font-bold text-gray-800">Gallery Images</h4>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                                <MultiImageUpload
                                    onUpload={(urls: string[]) => {
                                        if (placements.length === 0) {
                                            setPlacements([{ 
                                                id: crypto.randomUUID(), 
                                                title: 'Placement', 
                                                content: '', 
                                                images: urls, 
                                                alignment: 'left', 
                                                published: true 
                                            }]);
                                        } else {
                                            const updated = [...placements];
                                            updated[0] = { ...updated, images: [...(updated.images || []), ...urls] };
                                            setPlacements(updated);
                                        }
                                    }}
                                    label="Upload Placement Images"
                                />
                                
                                {(placements[0]?.images || []).length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FaImages className="text-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">
                                                Uploaded Images ({(placements[0]?.images || []).length})
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            <AnimatePresence>
                                                {(placements[0]?.images || []).map((img, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="relative group aspect-square cursor-move"
                                                        draggable
                                                        onDragStart={() => { imageDragIndexRef.current = idx; }}
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            const from = imageDragIndexRef.current;
                                                            const to = idx;
                                                            if (from === null || from === to) return;
                                                            const current = placements[0]?.images || [];
                                                            const reordered = [...current];
                                                            const [moved] = reordered.splice(from, 1);
                                                            reordered.splice(to, 0, moved);
                                                            const updated = [...placements];
                                                            updated[0] = { ...updated, images: reordered };
                                                            setPlacements(updated);
                                                            imageDragIndexRef.current = null;
                                                        }}
                                                    >
                                                        <img 
                                                            src={img} 
                                                            alt="" 
                                                            className="object-cover w-full h-full rounded-xl border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-200" 
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                                                            <FaGripVertical className="text-white text-lg" />
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            type="button"
                                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                                                            onClick={() => {
                                                                const updated = [...placements];
                                                                updated[0] = { ...updated, images: updated.images.filter((_, i) => i !== idx) };
                                                                setPlacements(updated);
                                                            }}
                                                        >
                                                            <FaTimes size={12} />
                                                        </motion.button>
                                                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            #{idx + 1}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Settings Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                                <h4 className="text-lg font-bold text-gray-800">Display Settings</h4>
                            </div>

                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <FaTag className="text-orange-500" />
                                            Card Title
                                        </label>
                                        <input
                                            type="text"
                                            value={placements[0]?.title || ''}
                                            onChange={(e) => {
                                                if (placements.length === 0) {
                                                    setPlacements([{ 
                                                        id: crypto.randomUUID(), 
                                                        title: e.target.value, 
                                                        content: '', 
                                                        images: [], 
                                                        alignment: 'left', 
                                                        published: true 
                                                    }]);
                                                } else {
                                                    const updated = [...placements];
                                                    updated[0] = { ...updated, title: e.target.value };
                                                    setPlacements(updated);
                                                }
                                            }}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter card title"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <FaAlignLeft className="text-red-500" />
                                            Text Alignment
                                        </label>
                                        <select
                                            value={placements[0]?.alignment || 'left'}
                                            onChange={(e) => {
                                                if (placements.length === 0) return;
                                                const updated = [...placements];
                                                updated[0] = { ...updated, alignment: e.target.value as 'left' | 'center' | 'right' };
                                                setPlacements(updated);
                                            }}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="left">Left Aligned</option>
                                            <option value="center">Center Aligned</option>
                                            <option value="right">Right Aligned</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <FaToggleOn className="text-green-500" />
                                            Visibility
                                        </label>
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-700">
                                                {placements[0]?.published ?? true ? 'Published' : 'Draft'}
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id="placement-single-published"
                                                    checked={placements[0]?.published ?? true}
                                                    onChange={(e) => {
                                                        if (placements.length === 0) return;
                                                        const updated = [...placements];
                                                        updated[0] = { ...updated[0], published: e.target.checked };
                                                        setPlacements(updated);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Save Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center pt-8 border-t border-gray-200"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                    try {
                                        setSaving(true);
                                        const body = {
                                            title: placementSectionTitle,
                                            subtitle: placementSectionSubtitle,
                                            items: placements,
                                        };
                                        await fetch('/api/placements', {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(body),
                                        });
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                disabled={saving}
                                className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                                    saving 
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                                        />
                                        Saving Placement Data...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Save Placement Section
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    </motion.div>
)}



                {/* Achievements Tab */}
                {/* Facilities Tab */}
                {activeTab === 'facilities' && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Facilities Section</h2>
                          <p className="text-gray-600">Manage your institution's facilities and amenities</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                          <input
                            type="text"
                            value={facilities.title}
                            onChange={(e) => setFacilities({ ...facilities, title: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                            placeholder="Enter section title..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Section Subtitle</label>
                          <input
                            type="text"
                            value={facilities.subtitle}
                            onChange={(e) => setFacilities({ ...facilities, subtitle: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                            placeholder="Enter section subtitle..."
                          />
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">Add New Facility</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Facility Name</label>
                            <input 
                              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300" 
                              placeholder="Enter facility name" 
                              value={newFacility.name} 
                              onChange={(e)=>setNewFacility({...newFacility,name:e.target.value})} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Category</label>
                            <input 
                              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300" 
                              placeholder="e.g., Library, Lab, Sports" 
                              value={newFacility.category} 
                              onChange={(e)=>setNewFacility({...newFacility,category:e.target.value})} 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Main Image</label>
                            <ImageUpload
                              value={newFacility.image}
                              onChange={(url) => setNewFacility(prev => ({ ...prev, image: url }))}
                              label="Upload Main Image"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Display Order</label>
                            <input 
                              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300" 
                              placeholder="1, 2, 3..." 
                              type="number" 
                              value={newFacility.order} 
                              onChange={(e)=>setNewFacility({...newFacility,order:Number(e.target.value)})} 
                            />
                          </div>
                          
                          <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Additional Gallery Images</label>
                            <MultiImageUpload onUpload={(urls: string[]) => setNewFacilityImages(prev => [...prev, ...urls])} label="Upload Multiple Images" />
                            {newFacilityImages.length > 0 && (
                              <div className="flex flex-wrap gap-3 mt-3">
                                {newFacilityImages.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img src={img} className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200" />
                                    <button 
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg" 
                                      onClick={() => setNewFacilityImages(prev => prev.filter((_, i) => i !== idx))}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Description</label>
                            <RichTextEditor
                              value={newFacility.description}
                              onChange={(content) => setNewFacility(prev => ({ ...prev, description: content }))}
                              placeholder="Enter detailed facility description..."
                            />
                          </div>
                          
                          <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Features</label>
                            <input 
                              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300" 
                              placeholder="WiFi, Air Conditioning, Projector (comma separated)" 
                              value={newFacility.features} 
                              onChange={(e)=>setNewFacility({...newFacility,features:e.target.value})} 
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button
                            onClick={() => {
                              const item = {
                                id: crypto.randomUUID(),
                                name: newFacility.name,
                                description: newFacility.description,
                                image: newFacility.image,
                                gallery: newFacilityImages,
                                category: newFacility.category,
                                features: newFacility.features.split(',').map(f=>f.trim()).filter(Boolean),
                                published: true,
                                order: newFacility.order || (facilities.items.length + 1),
                              };
                              setFacilities(prev => ({ ...prev, items: [...(prev.items || []), item] }));
                              setNewFacility({ id: '', name: '', description: '', image: '', category: '', features: '', published: true, order: 1 });
                              setNewFacilityImages([]);
                            }}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Facility
                          </button>
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">Existing Facilities</h3>
                        </div>
                        
                        {(!facilities.items || facilities.items.length === 0) ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No facilities added yet</p>
                            <p className="text-gray-400 text-sm">Start by adding your first facility above</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {facilities.items.sort((a:any,b:any)=>a.order-b.order).map((item:any, index:number) => (
                              <div key={item.id} className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-blue-200">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      <div className="font-semibold text-gray-800 text-lg">{item.name}</div>
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{item.category}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Order: {item.order}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {item.features.length} features
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg" 
                                      onClick={()=>setEditingFacilityIndex(index)}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edit
                                    </button>
                                    <button 
                                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg" 
                                      onClick={()=>setFacilities({ ...facilities, items: facilities.items.filter((_:any,i:number)=>i!==index) })}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Edit Facility Modal */}
                      {editingFacilityIndex !== null && facilities.items && facilities.items[editingFacilityIndex] && (
                        <div 
                          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                          onClick={() => setEditingFacilityIndex(null)}
                        >
                          <div 
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-t-2xl border-b border-yellow-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-gray-800">Edit Facility</h3>
                                    <p className="text-gray-600">Update facility information and settings</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setEditingFacilityIndex(null)}
                                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                                >
                                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {/* Modal Body */}
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Facility Name</label>
                                  <input
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                                    placeholder="Enter facility name"
                                    value={facilities.items[editingFacilityIndex].name}
                                    onChange={(e)=>{
                                      const copy: any = { ...facilities };
                                      copy.items[editingFacilityIndex].name = e.target.value;
                                      setFacilities(copy);
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Category</label>
                                  <input
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                                    placeholder="e.g., Library, Lab, Sports"
                                    value={facilities.items[editingFacilityIndex].category}
                                    onChange={(e)=>{
                                      const copy: any = { ...facilities };
                                      copy.items[editingFacilityIndex].category = e.target.value;
                                      setFacilities(copy);
                                    }}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Main Image</label>
                                  <ImageUpload
                                    value={facilities.items[editingFacilityIndex].image || ''}
                                    onChange={(url) => {
                                      const copy: any = { ...facilities };
                                      copy.items[editingFacilityIndex].image = url;
                                      setFacilities(copy);
                                    }}
                                    label="Upload Image"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Display Order</label>
                                  <input
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                                    placeholder="1, 2, 3..."
                                    type="number"
                                    value={facilities.items[editingFacilityIndex].order}
                                    onChange={(e)=>{
                                      const copy: any = { ...facilities };
                                      copy.items[editingFacilityIndex].order = Number(e.target.value);
                                      setFacilities(copy);
                                    }}
                                  />
                                </div>
                                
                                <div className="md:col-span-2 space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Gallery Images</label>
                                  <MultiImageUpload
                                    onUpload={(urls: string[]) => {
                                      const copy: any = { ...facilities };
                                      const current = copy.items[editingFacilityIndex].gallery || [];
                                      copy.items[editingFacilityIndex].gallery = [...current, ...urls];
                                      setFacilities(copy);
                                    }}
                                    label="Upload Multiple Images"
                                  />
                                  {(facilities.items[editingFacilityIndex].gallery || []).length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                      {(facilities.items[editingFacilityIndex].gallery || []).map((img: string, idx: number) => (
                                        <div key={idx} className="relative group">
                                          <img src={img} className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200" />
                                          <button
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                            onClick={() => {
                                              const copy: any = { ...facilities };
                                              copy.items[editingFacilityIndex].gallery = (copy.items[editingFacilityIndex].gallery || []).filter((_: any, i: number) => i !== idx);
                                              setFacilities(copy);
                                            }}
                                          >×</button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="md:col-span-2 space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Description</label>
                                  <RichTextEditor
                                    value={facilities.items[editingFacilityIndex].description}
                                    onChange={(content) => {
                                      const copy: any = { ...facilities };
                                      copy.items[editingFacilityIndex].description = content;
                                      setFacilities(copy);
                                    }}
                                    placeholder="Edit facility description..."
                                  />
                                </div>
                                
                                <div className="md:col-span-2 space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Features</label>
                                  <input
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                                    placeholder="WiFi, Air Conditioning, Projector (comma separated)"
                                    value={(facilities.items[editingFacilityIndex].features || []).join(', ')}
                                    onChange={(e)=>{
                                      const copy: any = { ...facilities };
                                      copy.items[editingFacilityIndex].features = e.target.value.split(',').map((f:string)=>f.trim()).filter(Boolean);
                                      setFacilities(copy);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
                              <div className="flex gap-3 justify-end">
                                <button 
                                  className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg" 
                                  onClick={() => setEditingFacilityIndex(null)}
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel
                                </button>
                                <button 
                                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg" 
                                  onClick={() => {
                                    setEditingFacilityIndex(null);
                                    // Show success message
                                    setSaveStatus({ type: 'success', message: 'Facility updated successfully!' });
                                    setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
                                  }}
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-6">
                        <button
                          onClick={async ()=>{
                            if (isSaving) return; // Prevent multiple clicks
                            setIsSaving(true);
                            try {
                              const updated = { ...siteSettings, facilities } as any;
                              const saved = await saveSiteSettings(updated);
                              if (saved) {
                                setSiteSettings(saved);
                                // Show success message
                                setSaveStatus({ type: 'success', message: 'Facilities saved successfully!' });
                                setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
                              }
                            } catch (error) {
                              setSaveStatus({ type: 'error', message: 'Failed to save facilities. Please try again.' });
                              setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          disabled={isSaving}
                          className={`px-8 py-3 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center mx-auto ${
                            isSaving 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save All Facilities
                            </>
                          )}
                        </button>
                        
                        {/* Save Status Message */}
                        {saveStatus.type && (
                          <div className={`mt-4 p-4 rounded-xl text-center transition-all duration-300 ${
                            saveStatus.type === 'success' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            <div className="flex items-center justify-center gap-2">
                              {saveStatus.type === 'success' ? (
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              <span className="font-medium">{saveStatus.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
 {activeTab === 'achievements' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white">
                        <FaTrophy className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                            Achievements Management
                        </h2>
                        <p className="text-gray-600 text-lg">Showcase your institution's awards, recognitions, and milestones</p>
                    </div>
                </div>
            </div>

            {/* Section Settings */}
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Section Configuration</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaMedal className="text-amber-500" />
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={siteSettings.achievements?.title || ''}
                            onChange={(e) => setSiteSettings({
                                ...siteSettings,
                                achievements: { ...siteSettings.achievements, title: e.target.value }
                            })}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="Our Achievements"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaQuoteLeft className="text-orange-500" />
                            Section Subtitle
                        </label>
                        <input
                            type="text"
                            value={siteSettings.achievements?.subtitle || ''}
                            onChange={(e) => setSiteSettings({
                                ...siteSettings,
                                achievements: { ...siteSettings.achievements, subtitle: e.target.value }
                            })}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                            placeholder="Celebrating excellence and recognition in education"
                        />
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Create New Achievement */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Create New Achievement</h3>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Basic Information */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                        <h4 className="text-lg font-bold text-gray-800">Achievement Details</h4>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaStar className="text-blue-500" />
                            Achievement Title
                        </label>
                        <input
                            type="text"
                            value={newAchievement.title || ''}
                            onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter achievement title"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaFileAlt className="text-cyan-500" />
                            Achievement Content
                        </label>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                            <RichTextEditor
                                value={newAchievement.content || ''}
                                onChange={(content) => setNewAchievement({ ...newAchievement, content })}
                                placeholder="Describe the achievement, its significance, date received, awarding body, etc..."
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Image Upload */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                        <h4 className="text-lg font-bold text-gray-800">Visual Content</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FaImage className="text-purple-500" />
                                Primary Image
                            </label>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                <ImageUpload
                                    value={newAchievement.image || ''}
                                    onChange={(image) => setNewAchievement({ ...newAchievement, image })}
                                    label="Upload Primary Image"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FaImages className="text-pink-500" />
                                Additional Images
                            </label>
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                                <MultiImageUpload
                                    label="Upload Additional Images"
                                    onUpload={(urls) => setNewAchievement({
                                        ...newAchievement,
                                        images: [
                                            ...((newAchievement.images as any) || []),
                                            ...urls.map(u => ({ url: u, caption: '', subtitle: '' }))
                                        ]
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    {newAchievement.images && (newAchievement as any).images.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FaImages className="text-pink-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    Uploaded Images ({(newAchievement as any).images.length})
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {(newAchievement as any).images.map((img: any, i: number) => (
                                        <motion.div
                                            key={`${img.url}-${i}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="relative h-40">
                                                <Image src={img.url} alt="" fill className="object-cover" />
                                                <button 
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                                    onClick={() => {
                                                        const nextImgs = ((newAchievement as any).images || []).filter((_: any, k: number) => k !== i);
                                                        setNewAchievement({ ...(newAchievement as any), images: nextImgs } as any);
                                                    }}
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-2">Caption</label>
                                                    <RichTextEditor
                                                        value={img.caption || ''}
                                                        onChange={(value: string) => {
                                                            const nextImgs = [...((newAchievement as any).images || [])];
                                                            nextImgs[i] = { ...nextImgs[i], caption: value };
                                                            setNewAchievement({ ...(newAchievement as any), images: nextImgs } as any);
                                                        }}
                                                        placeholder="Write image caption..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-2">Subcaption</label>
                                                    <RichTextEditor
                                                        value={img.subtitle || ''}
                                                        onChange={(value: string) => {
                                                            const nextImgs = [...((newAchievement as any).images || [])];
                                                            nextImgs[i] = { ...nextImgs[i], subtitle: value };
                                                            setNewAchievement({ ...(newAchievement as any), images: nextImgs } as any);
                                                        }}
                                                        placeholder="Write subcaption..."
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FaGripVertical />
                                                        Drag to reorder
                                                    </span>
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                        #{i + 1}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Display Settings */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                        <h4 className="text-lg font-bold text-gray-800">Display Settings</h4>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FaAlignLeft className="text-indigo-500" />
                                    Text Alignment
                                </label>
                                <select
                                    value={newAchievement.alignment || 'left'}
                                    onChange={(e) => setNewAchievement({ ...newAchievement, alignment: e.target.value as 'left' | 'center' | 'right' })}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="left">Left Aligned</option>
                                    <option value="center">Center Aligned</option>
                                    <option value="right">Right Aligned</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FaToggleOn className="text-purple-500" />
                                    Publication Status
                                </label>
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-700">
                                        {newAchievement.published ? 'Published' : 'Draft'}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="achievement-published"
                                            checked={newAchievement.published || false}
                                            onChange={(e) => setNewAchievement({ ...newAchievement, published: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Create Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center pt-6 border-t border-gray-200"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateAchievement}
                        className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-xl hover:shadow-2xl font-bold text-lg transition-all duration-200 flex items-center gap-3"
                    >
                        <FaPlus />
                        Create Achievement
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>

        {/* Existing Achievements */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-slate-500 to-gray-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">
                        Existing Achievements ({siteSettings.achievements?.items.length || 0})
                    </h3>
                </div>
            </div>

            <div className="p-8">
                {siteSettings.achievements?.items.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No achievements yet</h3>
                        <p className="text-gray-500">Create your first achievement using the form above</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {siteSettings.achievements?.items.map((achievement) => (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                        editingAchievement?.id === achievement.id 
                                            ? 'border-blue-300 shadow-lg bg-blue-50/30' 
                                            : 'border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    {editingAchievement?.id === achievement.id ? (
                                        // Edit Mode
                                        <div className="p-6 space-y-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-bold text-gray-800">Edit Achievement</h4>
                                                <button
                                                    onClick={() => setEditingAchievement(null)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={editingAchievement.title}
                                                    onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="Achievement title"
                                                />
                                                <RichTextEditor
                                                    value={editingAchievement.content || ''}
                                                    onChange={(content) => setEditingAchievement({ ...editingAchievement, content })}
                                                    placeholder="Edit achievement content..."
                                                />
                                                <ImageUpload
                                                    value={editingAchievement.image || ''}
                                                    onChange={(image) => setEditingAchievement({ ...editingAchievement, image })}
                                                    label="Update Primary Image"
                                                />
                                                
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <select
                                                        value={editingAchievement.alignment}
                                                        onChange={(e) => setEditingAchievement({ ...editingAchievement, alignment: e.target.value as 'left' | 'center' | 'right' })}
                                                        className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    >
                                                        <option value="left">Left Aligned</option>
                                                        <option value="center">Center Aligned</option>
                                                        <option value="right">Right Aligned</option>
                                                    </select>
                                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                        <span className="text-sm font-medium text-gray-700">Published</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={editingAchievement.published}
                                                                onChange={(e) => setEditingAchievement({ ...editingAchievement, published: e.target.checked })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleUpdateAchievement}
                                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <FaSave />
                                                    Save Changes
                                                </motion.button>
                                                <button
                                                    onClick={() => setEditingAchievement(null)}
                                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    {achievement.image && (
                                                        <div className="flex-shrink-0">
                                                            <img 
                                                                src={achievement.image} 
                                                                alt={achievement.title} 
                                                                className="w-16 h-16 object-cover rounded-xl shadow-sm" 
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                                            <FaTrophy className="text-amber-500" />
                                                            {achievement.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                            <span className="flex items-center gap-1">
                                                                <FaAlignLeft />
                                                                {achievement.alignment} aligned
                                                            </span>
                                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                                achievement.published 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                <FaCircle size={6} />
                                                                {achievement.published ? 'Published' : 'Draft'}
                                                            </span>
                                                            {(achievement as any).images && (achievement as any).images.length > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <FaImages />
                                                                    {(achievement as any).images.length} images
                                                                </span>
                                                            )}
                                                        </div>
                                                        {achievement.content && (
                                                            <div 
                                                                className="text-gray-600 text-sm line-clamp-2"
                                                                dangerouslySetInnerHTML={{ __html: achievement.content }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setEditingAchievement(achievement)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Achievement"
                                                    >
                                                        <FaEdit />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDeleteAchievement(achievement.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Achievement"
                                                    >
                                                        <FaTrash />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Save All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center pt-8 border-t border-gray-200 mt-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveSiteSettings}
                        disabled={saving}
                        className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                            saving 
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl'
                        }`}
                    >
                        {saving ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                                />
                                Saving All Changes...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                Save All Changes
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    </motion.div>
)}


{activeTab === 'homepage' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl text-white">
                        <FaHome className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Homepage Layout Management
                        </h2>
                        <p className="text-gray-600 text-lg">Design your homepage by controlling section visibility and order</p>
                    </div>
                </div>
            </div>

            {/* Description and Instructions */}
            <div className="p-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
                    <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Use</h3>
                            <ul className="text-blue-700 space-y-1 text-sm">
                                <li>• <strong>Drag and drop</strong> sections to reorder them on your homepage</li>
                                <li>• Use <strong>toggle switches</strong> to show or hide sections</li>
                                <li>• <strong>Order numbers</strong> indicate the display sequence on your homepage</li>
                                <li>• Changes are <strong>saved automatically</strong> when you click "Save Homepage Layout"</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Section Management */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-2 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></span>
                        <h3 className="text-xl font-bold text-gray-800">Configure Sections</h3>
                    </div>

                    {siteSettings.homepage?.sections ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200"
                        >
                            <SortableSection
                                sections={siteSettings.homepage.sections}
                                onSectionsChange={handleHomepageSectionsChange}
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-dashed border-gray-300"
                        >
                            <div className="text-6xl mb-4">⚙️</div>
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Homepage Sections</h3>
                            <p className="text-gray-500">Homepage sections are not configured yet.</p>
                        </motion.div>
                    )}

                    {/* Save Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center pt-6 border-t border-gray-200"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveSiteSettings}
                            disabled={saving}
                            className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                                saving 
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-2xl'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                                    />
                                    Saving Layout...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save Homepage Layout
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaEye className="text-emerald-600" />
                        Homepage Layout Preview
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">This is how your homepage sections will appear to visitors</p>
            </div>

            <div className="p-8">
                {/* Visible Sections */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                        <h4 className="text-lg font-bold text-gray-800">Active Sections</h4>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                            {siteSettings.homepage?.sections?.filter(section => section.enabled).length || 0} visible
                        </span>
                    </div>

                    {siteSettings.homepage?.sections
                        ?.filter(section => section.enabled)
                        ?.sort((a, b) => a.order - b.order)
                        ?.length > 0 ? (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {siteSettings.homepage.sections
                                    .filter(section => section.enabled)
                                    .sort((a, b) => a.order - b.order)
                                    .map((section: HomepageSection, index: number) => (
                                        <motion.div
                                            key={section.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-3 py-2 rounded-lg shadow-sm">
                                                        #{index + 1}
                                                    </span>
                                                    <FaGripVertical className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800 text-lg">
                                                        {section.name}
                                                    </span>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Order: {section.order} • Status: Active
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-green-500 text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-2">
                                                    <FaCheck size={12} />
                                                    Visible
                                                </span>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-dashed border-gray-300">
                            <div className="text-4xl mb-4">👁️</div>
                            <h4 className="text-lg font-semibold text-gray-400 mb-2">No Visible Sections</h4>
                            <p className="text-gray-500">Enable some sections above to see them here</p>
                        </div>
                    )}
                </div>

                {/* Hidden Sections */}
                {siteSettings.homepage?.sections?.some(section => !section.enabled) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-8 border-t border-gray-200"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-2 h-6 bg-gradient-to-b from-gray-400 to-slate-400 rounded-full"></span>
                            <h4 className="text-lg font-bold text-gray-800">Hidden Sections</h4>
                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                {siteSettings.homepage.sections.filter(section => !section.enabled).length} hidden
                            </span>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <AnimatePresence>
                                    {siteSettings.homepage.sections
                                        .filter(section => !section.enabled)
                                        .map((section: HomepageSection, index: number) => (
                                            <motion.div
                                                key={section.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <FaEyeSlash className="text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600 truncate">
                                                            {section.name}
                                                        </span>
                                                    </div>
                                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                                                        Hidden
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                </AnimatePresence>
                            </div>

                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FaLightbulb className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-amber-700 text-sm">
                                        <strong>Tip:</strong> Enable hidden sections using the toggle switches above to make them visible on your homepage.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 pt-8 border-t border-gray-200"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {siteSettings.homepage?.sections?.length || 0}
                            </div>
                            <div className="text-blue-700 font-medium text-sm">Total Sections</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {siteSettings.homepage?.sections?.filter(s => s.enabled).length || 0}
                            </div>
                            <div className="text-green-700 font-medium text-sm">Active Sections</div>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 text-center">
                            <div className="text-3xl font-bold text-gray-600 mb-2">
                                {siteSettings.homepage?.sections?.filter(s => !s.enabled).length || 0}
                            </div>
                            <div className="text-gray-700 font-medium text-sm">Hidden Sections</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    </motion.div>
)}


      {/* Carousel Tab */}
{activeTab === 'carousel' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white">
                        <FaImages className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                            Carousel Management
                        </h2>
                        <p className="text-gray-600 text-lg">Upload and organize homepage carousel images with captions and links</p>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Upload New Images</h3>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => handleMultiImageUpload(e.target.files)}
                        disabled={uploading}
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                            uploading 
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl'
                        }`}
                    >
                        {uploading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                                />
                                Uploading Images...
                            </>
                        ) : (
                            <>
                                <FaCloudUploadAlt />
                                Upload Multiple Images
                            </>
                        )}
                    </motion.button>
                    <p className="text-purple-700 text-sm mt-3 flex items-center gap-2">
                        <FaInfoCircle />
                        Select multiple images to upload them all at once
                    </p>
                </div>
            </div>
        </motion.div>

        {/* Carousel Images Management */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaGripVertical className="text-blue-600" />
                            Carousel Images ({carouselOrder.length})
                        </h3>
                    </div>
                    {carouselOrder.length > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveOrder}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                        >
                            <FaSave />
                            Save Order
                        </motion.button>
                    )}
                </div>
                <p className="text-gray-600 mt-2">Drag and drop images to reorder them in the carousel</p>
            </div>

            <div className="p-8">
                {carouselOrder.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {carouselOrder.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ y: -4 }}
                                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-move border border-gray-200"
                                    draggable
                                    onDragStart={e => handleDragStart(e, item.id)}
                                    onDrop={e => handleDrop(e, item.id)}
                                    onDragOver={handleDragOver}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-video overflow-hidden">
                                        <img 
                                            src={item.image} 
                                            alt={item.caption || 'carousel image'} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        {/* Order Badge */}
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                            #{idx + 1}
                                        </div>

                                        {/* Drag Handle */}
                                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <FaGripVertical />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 line-clamp-2">
                                                {item.caption || 'No Caption'}
                                            </h4>
                                            {item.link && (
                                                <a 
                                                    href={item.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-600 hover:text-blue-800 text-sm truncate block mt-1 flex items-center gap-1"
                                                >
                                                    <FaExternalLinkAlt size={10} />
                                                    {item.link}
                                                </a>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEditCarousel(item)}
                                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                            >
                                                <FaEdit size={14} />
                                                Edit
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDeleteCarousel(item.id)}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                            >
                                                <FaTrash size={14} />
                                                Delete
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6">🖼️</div>
                        <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Carousel Images</h3>
                        <p className="text-gray-500 mb-6">Upload your first carousel image to get started</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                        >
                            <FaCloudUploadAlt />
                            Upload First Image
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>

        {/* Edit Modal */}
        <AnimatePresence>
            {editingCarousel && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <FaEdit className="text-purple-600" />
                                Edit Carousel Item
                            </h3>
                            <button
                                onClick={() => setEditingCarousel(null)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                                <ImageUpload
                                    value={editingCarousel.image}
                                    onChange={img => setEditingCarousel(c => c ? { ...c, image: img } : null)}
                                    label="Update Image"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
                                <input
                                    type="text"
                                    placeholder="Enter image caption (optional)"
                                    value={editingCarousel.caption || ''}
                                    onChange={e => setEditingCarousel(c => c ? { ...c, caption: e.target.value } : null)}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Link URL</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com (optional)"
                                    value={editingCarousel.link || ''}
                                    onChange={e => setEditingCarousel(c => c ? { ...c, link: e.target.value } : null)}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpdateCarousel}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <FaSave />
                                Save Changes
                            </motion.button>
                            <button
                                onClick={() => setEditingCarousel(null)}
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
)}


       {/* Others Tab */}
{activeTab === 'others' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-zinc-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-slate-500 to-zinc-500 rounded-xl text-white">
                        <FaCog className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-600 via-zinc-600 to-gray-700 bg-clip-text text-transparent">
                            Additional Sections
                        </h2>
                        <p className="text-gray-600 text-lg">Manage specialized sections and additional content areas</p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* AISHE Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartBar className="text-blue-600" />
                        AISHE Section
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">All India Survey on Higher Education related content</p>
            </div>

            <div className="p-8 space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaHeading className="text-blue-500" />
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={others.aishe.title}
                            onChange={e => setOthers(o => ({ ...o, aishe: { ...o.aishe, title: e.target.value } }))}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="AISHE Report"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaQuoteLeft className="text-indigo-500" />
                            Section Subtitle
                        </label>
                        <input
                            type="text"
                            value={others.aishe.subtitle}
                            onChange={e => setOthers(o => ({ ...o, aishe: { ...o.aishe, subtitle: e.target.value } }))}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            placeholder="Annual data submission and statistics"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                >
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaFileAlt className="text-cyan-500" />
                        AISHE Content
                    </label>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <RichTextEditor
                            value={others.aishe.content}
                            onChange={content => setOthers(o => ({ ...o, aishe: { ...o.aishe, content } }))}
                            placeholder="Enter AISHE content including survey data, statistics, compliance information, and annual reports..."
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>

        {/* Academic Coordinator Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUserTie className="text-emerald-600" />
                        Academic Coordinator Section
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">Academic coordination and administrative information</p>
            </div>

            <div className="p-8 space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaHeading className="text-emerald-500" />
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={others.academicCoordinator.title}
                            onChange={e => setOthers(o => ({ ...o, academicCoordinator: { ...o.academicCoordinator, title: e.target.value } }))}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            placeholder="Academic Coordinator"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaQuoteLeft className="text-teal-500" />
                            Section Subtitle
                        </label>
                        <input
                            type="text"
                            value={others.academicCoordinator.subtitle}
                            onChange={e => setOthers(o => ({ ...o, academicCoordinator: { ...o.academicCoordinator, subtitle: e.target.value } }))}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                            placeholder="Academic oversight and coordination"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                >
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaFileAlt className="text-cyan-500" />
                        Academic Coordinator Content
                    </label>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                        <RichTextEditor
                            value={others.academicCoordinator.content}
                            onChange={content => setOthers(o => ({ ...o, academicCoordinator: { ...o.academicCoordinator, content } }))}
                            placeholder="Enter Academic Coordinator information including responsibilities, contact details, office hours, and coordination procedures..."
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>

        {/* Content Preview */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaEye className="text-purple-600" />
                        Content Preview
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">Preview of your additional sections</p>
            </div>

            <div className="p-8 space-y-6">
                {/* AISHE Preview */}
                {(others.aishe.title || others.aishe.subtitle || others.aishe.content) && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FaChartBar className="text-blue-600" />
                            <h4 className="text-lg font-bold text-blue-800">AISHE Section Preview</h4>
                        </div>
                        {others.aishe.title && (
                            <h5 className="text-xl font-bold text-gray-800 mb-2">{others.aishe.title}</h5>
                        )}
                        {others.aishe.subtitle && (
                            <p className="text-gray-600 mb-3">{others.aishe.subtitle}</p>
                        )}
                        {others.aishe.content && (
                            <div 
                                className="prose max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: others.aishe.content }}
                            />
                        )}
                    </div>
                )}

                {/* Academic Coordinator Preview */}
                {(others.academicCoordinator.title || others.academicCoordinator.subtitle || others.academicCoordinator.content) && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FaUserTie className="text-emerald-600" />
                            <h4 className="text-lg font-bold text-emerald-800">Academic Coordinator Preview</h4>
                        </div>
                        {others.academicCoordinator.title && (
                            <h5 className="text-xl font-bold text-gray-800 mb-2">{others.academicCoordinator.title}</h5>
                        )}
                        {others.academicCoordinator.subtitle && (
                            <p className="text-gray-600 mb-3">{others.academicCoordinator.subtitle}</p>
                        )}
                        {others.academicCoordinator.content && (
                            <div 
                                className="prose max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: others.academicCoordinator.content }}
                            />
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!others.aishe.title && !others.aishe.subtitle && !others.aishe.content && 
                 !others.academicCoordinator.title && !others.academicCoordinator.subtitle && !others.academicCoordinator.content && (
                    <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-dashed border-gray-300">
                        <div className="text-6xl mb-4">📝</div>
                        <h4 className="text-xl font-semibold text-gray-400 mb-2">No Content Yet</h4>
                        <p className="text-gray-500">Add content to the sections above to see a preview here</p>
                    </div>
                )}
            </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
        >
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveOthers}
                disabled={saving}
                className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                    saving 
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-slate-600 to-zinc-600 text-white hover:shadow-2xl'
                }`}
            >
                {saving ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                        />
                        Saving Content...
                    </>
                ) : (
                    <>
                        <FaSave />
                        Save Additional Sections
                    </>
                )}
            </motion.button>
        </motion.div>

        {/* Statistics */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FaChartBar className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">AISHE Section</h4>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                    {[others.aishe.title, others.aishe.subtitle, others.aishe.content].filter(Boolean).length}/3
                </div>
                <div className="text-sm text-gray-600">Fields completed</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <FaUserTie className="text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Academic Coordinator</h4>
                </div>
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                    {[others.academicCoordinator.title, others.academicCoordinator.subtitle, others.academicCoordinator.content].filter(Boolean).length}/3
                </div>
                <div className="text-sm text-gray-600">Fields completed</div>
            </div>
        </motion.div>
    </motion.div>
)}


                {activeTab === 'gallery' && (
                    <section className="p-4 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Gallery Management</h2>
                        
                        {/* Add this new section for multi-image upload */}
                        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                          <h3 className="text-xl font-semibold mb-4">Upload Multiple Images</h3>
                          <MultiImageUpload 
                            onUpload={handleMultiGalleryUpload}
                            label="Upload Multiple Gallery Images"
                          />
                          <p className="text-sm text-gray-500 mt-2">Upload multiple images at once to add them to the gallery.</p>
                        </div>

                        <div className="mb-4">
                          <h3 className="text-xl font-semibold mb-2">Add New Gallery Image</h3>
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                            <ImageUpload
                                value={newGallery.image || ''}
                                onChange={url => setNewGallery((prev: Partial<any>) => ({ ...prev, image: url }))}
                                label="Upload Gallery Image"
                            />
                            <input
                                type="text"
                                placeholder="Title"
                                className="border p-2 rounded"
                                value={newGallery.title || ''}
                                onChange={e => setNewGallery((prev: Partial<any>) => ({ ...prev, title: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                className="border p-2 rounded"
                                value={newGallery.description || ''}
                                onChange={e => setNewGallery((prev: Partial<any>) => ({ ...prev, description: e.target.value }))}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleAddGallery}
                                disabled={!newGallery.image}
                            >Add Image</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {galleryOrder.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="relative border rounded overflow-hidden group"
                                    draggable
                                    onDragStart={e => handleGalleryDragStart(e, item.id)}
                                    onDrop={e => handleGalleryDrop(e, item.id)}
                                    onDragOver={handleGalleryDragOver}
                                >
                                    <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 flex flex-col">
                                        <span className="font-bold">{item.title}</span>
                                        <span className="text-xs">{item.description}</span>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditGallery(item)} className="bg-yellow-400 text-white px-2 py-1 rounded">Edit</button>
                                        <button onClick={() => handleDeleteGallery(item.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                                    </div>
                                    <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleToggleHomepageImage(item)}
                                        className={`px-2 py-1 rounded ${item.homepage_image ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-800'}`}
                                      >
                                        {item.homepage_image ? 'Homepage Image' : 'Set as Homepage Image'}
                                      </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded" onClick={handleSaveGalleryOrder}>Save Order</button>
                        {editingGallery && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                                    <h3 className="text-xl font-bold mb-4">Edit Gallery Image</h3>
                                    <ImageUpload
                                        value={editingGallery.image || ''}
                                        onChange={url => setEditingGallery((prev: any | null) => prev ? { ...prev, image: url } : prev)}
                                        label="Upload Gallery Image"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        className="border p-2 rounded w-full mb-2"
                                        value={editingGallery.title || ''}
                                        onChange={e => setEditingGallery((prev: any | null) => prev ? { ...prev, title: e.target.value } : prev)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        className="border p-2 rounded w-full mb-2"
                                        value={editingGallery.description || ''}
                                        onChange={e => setEditingGallery((prev: any | null) => prev ? { ...prev, description: e.target.value } : prev)}
                                    />
                                    <div className="flex gap-2 mt-4">
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpdateGallery}>Save</button>
                                        <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditingGallery(null)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}
                {
                    activeTab === 'homepage_image' && (


                    <section className="p-4 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Homepage Image</h2>
                        <div className="mb-4">
                            <ImageUpload
                                value={homepageImage.image}
                                onChange={url => setHomepageImage(prev => ({ ...prev, image: url }))}
                                label="Upload Homepage Image"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Title"
                            className="border p-2 rounded w-full mb-2"
                            value={homepageImage.title}
                            onChange={e => setHomepageImage(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            className="border p-2 rounded w-full mb-2"
                            value={homepageImage.description}
                            onChange={e => setHomepageImage(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                            onClick={handleSaveHomepageImage}
                            disabled={homepageImageLoading}
                        >Save Homepage Image</button>
                    </section>
                )}
             {activeTab === 'iqac' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl text-white">
                        <FaShieldAlt className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            IQAC Management
                        </h2>
                        <p className="text-gray-600 text-lg">Internal Quality Assurance Cell configuration and committee management</p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Main Content */}
        {iqacLoading ? (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl border border-white/20 p-16 text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-500 text-lg">Loading IQAC data...</p>
            </motion.div>
        ) : iqac ? (
            <div className="space-y-8">
                {/* Basic Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                            <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FaHeading className="text-blue-500" />
                                    IQAC Title
                                </label>
                                <input 
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                    value={iqac.title || ''} 
                                    onChange={e => setIqac((prev:any) => ({ ...prev, title: e.target.value }))} 
                                    placeholder="Internal Quality Assurance Cell"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FaQuoteLeft className="text-indigo-500" />
                                    Subtitle
                                </label>
                                <input 
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                                    value={iqac.subtitle || ''} 
                                    onChange={e => setIqac((prev:any) => ({ ...prev, subtitle: e.target.value }))} 
                                    placeholder="Ensuring continuous quality improvement"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FaImage className="text-purple-500" />
                                Hero Image
                            </label>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                <ImageUpload 
                                    value={iqac.heroImage || ''} 
                                    onChange={(url) => setIqac((prev:any)=>({ ...prev, heroImage: url }))} 
                                    label="Upload IQAC Hero Image" 
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mission & Vision */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                            <h3 className="text-xl font-bold text-gray-800">Mission & Vision</h3>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    {/* Replaced FaTarget with a checkmark icon as a placeholder */}
                                    <span className="text-emerald-600 text-xl">&#10003;</span>
                                    <h4 className="text-lg font-bold text-gray-800">Mission</h4>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Mission Title</label>
                                    <input 
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                                        value={iqac.mission?.title || ''} 
                                        onChange={e => setIqac((prev:any)=>({ ...prev, mission: { ...(prev.mission||{}), title: e.target.value } }))} 
                                        placeholder="Our Mission"
                                    />
                                </div>
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                                    <RichTextEditor 
                                        value={iqac.mission?.content || ''} 
                                        onChange={content => setIqac((prev:any)=>({ ...prev, mission: { ...(prev.mission||{}), content } }))} 
                                        placeholder="Describe the IQAC mission..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaEye className="text-teal-600 text-xl" />
                                    <h4 className="text-lg font-bold text-gray-800">Vision</h4>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Vision Title</label>
                                    <input 
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200" 
                                        value={iqac.vision?.title || ''} 
                                        onChange={e => setIqac((prev:any)=>({ ...prev, vision: { ...(prev.vision||{}), title: e.target.value } }))} 
                                        placeholder="Our Vision"
                                    />
                                </div>
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                                    <RichTextEditor 
                                        value={iqac.vision?.content || ''} 
                                        onChange={content => setIqac((prev:any)=>({ ...prev, vision: { ...(prev.vision||{}), content } }))} 
                                        placeholder="Describe the IQAC vision..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Committee Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></span>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaUsers className="text-violet-600" />
                                    Committee Members ({(iqac.committee?.members || []).length})
                                </h3>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button" 
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                                onClick={() => setIqac((prev:any)=>({
                                    ...prev,
                                    committee: {
                                        ...(prev.committee || { title: '', members: [] }),
                                        members: [ ...((prev.committee?.members) || []), { name: '', position: '', designation: '', department: '' } ]
                                    }
                                }))}
                            >
                                <FaPlus />
                                Add Member
                            </motion.button>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FaIdCard className="text-violet-500" />
                                Committee Title
                            </label>
                            <input
                                type="text"
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                                value={iqac.committee?.title || ''}
                                onChange={e => setIqac((prev:any)=>({ ...prev, committee: { ...(prev.committee||{}), title: e.target.value, members: (prev.committee?.members||[]) } }))}
                                placeholder="IQAC Committee"
                            />
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {(iqac.committee?.members || []).map((m:any, idx:number) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                <FaUserTie className="text-violet-600" />
                                                Member #{idx + 1}
                                            </h4>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                type="button" 
                                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                onClick={() => setIqac((prev:any)=>({
                                                    ...prev,
                                                    committee: {
                                                        ...(prev.committee||{ title: '', members: [] }),
                                                        members: (prev.committee?.members || []).filter((_:any, i:number) => i !== idx)
                                                    }
                                                }))}
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200" 
                                                    value={m.name || ''} 
                                                    onChange={e => {
                                                        const next = { ...(iqac as any) };
                                                        const list = [ ...(next.committee?.members || []) ];
                                                        list[idx] = { ...list[idx], name: e.target.value };
                                                        next.committee = { ...(next.committee||{}), members: list };
                                                        setIqac(next);
                                                    }} 
                                                    placeholder="Full name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Position</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200" 
                                                    value={m.position || ''} 
                                                    onChange={e => {
                                                        const next = { ...(iqac as any) };
                                                        const list = [ ...(next.committee?.members || []) ];
                                                        list[idx] = { ...list[idx], position: e.target.value };
                                                        next.committee = { ...(next.committee||{}), members: list };
                                                        setIqac(next);
                                                    }} 
                                                    placeholder="Chairman/Member"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200" 
                                                    value={m.designation || ''} 
                                                    onChange={e => {
                                                        const next = { ...(iqac as any) };
                                                        const list = [ ...(next.committee?.members || []) ];
                                                        list[idx] = { ...list[idx], designation: e.target.value };
                                                        next.committee = { ...(next.committee||{}), members: list };
                                                        setIqac(next);
                                                    }} 
                                                    placeholder="Professor/Principal"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200" 
                                                    value={m.department || ''} 
                                                    onChange={e => {
                                                        const next = { ...(iqac as any) };
                                                        const list = [ ...(next.committee?.members || []) ];
                                                        list[idx] = { ...list[idx], department: e.target.value };
                                                        next.committee = { ...(next.committee||{}), members: list };
                                                        setIqac(next);
                                                    }} 
                                                    placeholder="Computer Science"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {(iqac.committee?.members || []).length === 0 && (
                                <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-dashed border-gray-300">
                                    <div className="text-6xl mb-4">👥</div>
                                    <h4 className="text-xl font-semibold text-gray-400 mb-2">No Committee Members</h4>
                                    <p className="text-gray-500">Add your first committee member to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Objectives & Functions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
                            <h3 className="text-xl font-bold text-gray-800">Objectives & Functions</h3>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaBullseye className="text-amber-600 text-xl" />
                                    <h4 className="text-lg font-bold text-gray-800">Objectives</h4>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Objectives (one per line)</label>
                                    <textarea 
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200" 
                                        rows={6} 
                                        value={(iqac.objectives||[]).join('\n')} 
                                        onChange={e => setIqac((prev:any)=>({ ...prev, objectives: e.target.value.split('\n').map((s)=>s.trim()).filter(Boolean) }))} 
                                        placeholder="Enter each objective on a new line..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaCogs className="text-orange-600 text-xl" />
                                    <h4 className="text-lg font-bold text-gray-800">Functions</h4>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Functions (one per line)</label>
                                    <textarea 
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200" 
                                        rows={6} 
                                        value={(iqac.functions||[]).join('\n')} 
                                        onChange={e => setIqac((prev:any)=>({ ...prev, functions: e.target.value.split('\n').map((s)=>s.trim()).filter(Boolean) }))} 
                                        placeholder="Enter each function on a new line..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Visibility Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></span>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaToggleOn className="text-rose-600" />
                                Section Visibility
                            </h3>
                        </div>
                        <p className="text-gray-600 mt-2">Control which sections are visible on the IQAC page</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { key: 'overview', label: 'Overview', icon: FaEye },
                                { key: 'committee', label: 'Committee', icon: FaUsers },
                                { key: 'activities', label: 'Activities', icon: FaTasks },
                                { key: 'reports', label: 'Reports', icon: FaFileAlt },
                                { key: 'practices', label: 'Best Practices', icon: FaStar }
                            ].map(({ key, label, icon: Icon }) => (
                                <div key={key} className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-100 rounded-lg">
                                                <Icon className="text-rose-600" />
                                            </div>
                                            <span className="font-semibold text-gray-800 capitalize">{label}</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={iqac.enabled ? iqac.enabled[key] !== false : true} 
                                                onChange={(e) => setIqac((prev:any)=>({ ...prev, enabled: { ...(prev.enabled||{}), [key]: e.target.checked } }))} 
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async ()=>{
                            setIqacSaving(true);
                            await fetch('/api/iqac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(iqac) });
                            setIqacSaving(false);
                        }}
                        className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                            iqacSaving 
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-2xl'
                        }`}
                        disabled={iqacSaving}
                    >
                        {iqacSaving ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                                />
                                Saving IQAC Data...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                Save IQAC Configuration
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl border border-white/20 p-16 text-center"
            >
                <div className="text-6xl mb-6">📋</div>
                <h3 className="text-2xl font-semibold text-gray-400 mb-2">No IQAC Data Found</h3>
                <p className="text-gray-500">IQAC configuration data is not available</p>
            </motion.div>
        )}
    </motion.div>
)}

                {activeTab === 'alumni' && (
                    <section className="p-4 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Alumni Association</h2>
                        {alumniLoading ? <div>Loading...</div> : alumni && (
                            <>
                                <input
                                    type="text"
                                    className="border p-2 rounded w-full mb-2"
                                    placeholder="Title"
                                    value={alumni.title}
                                    onChange={e => handleAlumniChange('title', e.target.value)}
                                />
                                <RichTextEditor
                                    value={alumni.content}
                                    onChange={val => handleAlumniChange('content', val)}
                                    placeholder="Content (HTML allowed)"
                                />
                                <input
                                    type="text"
                                    className="border p-2 rounded w-full mb-2"
                                    placeholder="Image URL"
                                    value={alumni.image || ''}
                                    onChange={e => handleAlumniChange('image', e.target.value)}
                                />
                                <textarea
                                    className="border p-2 rounded w-full mb-2 font-mono"
                                    placeholder='Members (JSON array: [{"name":"...","year":"...","description":"...","image":"..."}])'
                                    rows={5}
                                    value={JSON.stringify(alumni.members || [], null, 2)}
                                    onChange={e => handleAlumniMembersChange(e.target.value)}
                                />
                                {alumniError && <div className="text-red-600 mb-2">{alumniError}</div>}
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                    onClick={handleSaveAlumni}
                                    disabled={alumniSaving}
                                >Save Alumni Content</button>
                            </>
                        )}
                    </section>
                )}
          {/* Exam Cell Tab */}
{activeTab === 'examCell' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl text-white">
                        <FaClipboardCheck className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                            Exam Cell Management
                        </h2>
                        <p className="text-gray-600 text-lg">Configure examination cell information and system settings</p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Basic Information */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                </div>
            </div>

            <div className="p-8 space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaHeading className="text-blue-500" />
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={examCell.title}
                            onChange={e => setExamCell({ ...examCell, title: e.target.value })}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Examination Cell"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FaQuoteLeft className="text-indigo-500" />
                            Section Subtitle
                        </label>
                        <input
                            type="text"
                            value={examCell.subtitle}
                            onChange={e => setExamCell({ ...examCell, subtitle: e.target.value })}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            placeholder="Managing examinations with excellence"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                >
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaFileAlt className="text-cyan-500" />
                        Content
                    </label>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <RichTextEditor
                            value={examCell.content}
                            onChange={content => setExamCell({ ...examCell, content })}
                            placeholder="Enter detailed information about the exam cell, procedures, policies, and guidelines..."
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>

        {/* Section Visibility Settings */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaToggleOn className="text-emerald-600" />
                        Section Visibility Controls
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">Control which sections are displayed on the exam cell page</p>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        { key: 'showHero', label: 'Hero Section', description: 'Main banner with title and call-to-action', icon: FaFlag },
                        { key: 'showFeatures', label: 'Features Section', description: 'Key features and capabilities', icon: FaStar },
                        { key: 'showQuickLinks', label: 'Quick Links Section', description: 'Important exam-related links', icon: FaLink },
                        { key: 'showCTA', label: 'Call-to-Action Section', description: 'Contact and action buttons', icon: FaBullhorn }
                    ].map(({ key, label, description, icon: Icon }) => (
                        <motion.div 
                            key={key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <Icon className="text-emerald-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-800">{label}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">{description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        checked={examCell[key as keyof typeof examCell] || false}
                                        onChange={(e) => setExamCell(prev => ({ ...prev, [key]: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>

        {/* Button Configuration */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaMousePointer className="text-violet-600" />
                        Button Configuration
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">Customize button text for different sections</p>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FaFlag className="text-violet-600 text-xl" />
                            <h4 className="text-lg font-bold text-gray-800">Hero Section Button</h4>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Button Text</label>
                            <input
                                type="text"
                                value={examCell.heroButtonText || ''}
                                onChange={(e) => setExamCell(prev => ({ ...prev, heroButtonText: e.target.value }))}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                                placeholder="View Exam Schedule"
                            />
                        </div>
                        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <FaInfoCircle className="text-violet-500 mt-0.5 flex-shrink-0" />
                                <p className="text-violet-700 text-sm">
                                    This button appears in the hero section when enabled
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FaBullhorn className="text-purple-600 text-xl" />
                            <h4 className="text-lg font-bold text-gray-800">Call-to-Action Button</h4>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Button Text</label>
                            <input
                                type="text"
                                value={examCell.ctaButtonText || ''}
                                onChange={(e) => setExamCell(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Contact Exam Cell"
                            />
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <FaInfoCircle className="text-purple-500 mt-0.5 flex-shrink-0" />
                                <p className="text-purple-700 text-sm">
                                    This button appears in the call-to-action section when enabled
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>

        {/* Configuration Preview */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaEye className="text-orange-600" />
                        Configuration Preview
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">Preview of your exam cell page settings</p>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Sections */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            Active Sections
                        </h4>
                        <div className="space-y-2">
                            {[
                                { key: 'showHero', label: 'Hero Section' },
                                { key: 'showFeatures', label: 'Features Section' },
                                { key: 'showQuickLinks', label: 'Quick Links Section' },
                                { key: 'showCTA', label: 'Call-to-Action Section' }
                            ].filter(section => examCell[section.key as keyof typeof examCell]).map(section => (
                                <div key={section.key} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <FaCheck className="text-green-600" />
                                    <span className="text-green-800 font-medium">{section.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Button Configuration Summary */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaMousePointer className="text-blue-500" />
                            Button Settings
                        </h4>
                        <div className="space-y-3">
                            {examCell.heroButtonText && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-800 font-medium">Hero Button:</span>
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                                            {examCell.heroButtonText}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {examCell.ctaButtonText && (
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-purple-800 font-medium">CTA Button:</span>
                                        <span className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm">
                                            {examCell.ctaButtonText}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {[examCell.showHero, examCell.showFeatures, examCell.showQuickLinks, examCell.showCTA].filter(Boolean).length}
                            </div>
                            <div className="text-blue-700 font-medium text-sm">Active Sections</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {[examCell.heroButtonText, examCell.ctaButtonText].filter(Boolean).length}
                            </div>
                            <div className="text-green-700 font-medium text-sm">Configured Buttons</div>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 text-center">
                            <div className="text-3xl font-bold text-orange-600 mb-2">
                                {examCell.content ? '✓' : '✗'}
                            </div>
                            <div className="text-orange-700 font-medium text-sm">Content Status</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
        >
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveExamCell}
                disabled={saving}
                className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                    saving 
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-2xl'
                }`}
            >
                {saving ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                        />
                        Saving Exam Cell...
                    </>
                ) : (
                    <>
                        <FaSave />
                        Save Exam Cell Configuration
                    </>
                )}
            </motion.button>
        </motion.div>
    </motion.div>
)}

                {/* Others Tab */}
                {activeTab === 'others' && (
                  <div className="space-y-8">
                    {/* AISHE Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h2 className="text-xl font-semibold mb-4">AISHE Section</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input
                            type="text"
                            value={others.aishe.title}
                            onChange={e => setOthers(o => ({ ...o, aishe: { ...o.aishe, title: e.target.value } }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
                          <input
                            type="text"
                            value={others.aishe.subtitle}
                            onChange={e => setOthers(o => ({ ...o, aishe: { ...o.aishe, subtitle: e.target.value } }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <RichTextEditor
                            value={others.aishe.content}
                            onChange={content => setOthers(o => ({ ...o, aishe: { ...o.aishe, content } }))}
                            placeholder="Enter AISHE content with rich formatting..."
                          />
                        </div>
                      </div>
                    </div>
                    {/* Academic Coordinator Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h2 className="text-xl font-semibold mb-4">Academic Coordinator Section</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input
                            type="text"
                            value={others.academicCoordinator.title}
                            onChange={e => setOthers(o => ({ ...o, academicCoordinator: { ...o.academicCoordinator, title: e.target.value } }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
                          <input
                            type="text"
                            value={others.academicCoordinator.subtitle}
                            onChange={e => setOthers(o => ({ ...o, academicCoordinator: { ...o.academicCoordinator, subtitle: e.target.value } }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <RichTextEditor
                            value={others.academicCoordinator.content}
                            onChange={content => setOthers(o => ({ ...o, academicCoordinator: { ...o.academicCoordinator, content } }))}
                            placeholder="Enter Academic Coordinator content with rich formatting..."
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveOthers}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Others
                    </button>
                  </div>
                )}
          {activeTab === 'faculty' && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white">
                        <FaGraduationCap className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Faculty Management
                        </h2>
                        <p className="text-gray-600 text-lg">Manage faculty departments, profiles, and academic information</p>
                    </div>
                </div>
            </div>

            {/* Section Title Configuration */}
            <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800">Section Configuration</h3>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaHeading className="text-indigo-500" />
                        Section Title
                    </label>
                    <input
                        type="text"
                        value={faculty.title}
                        onChange={e => setFaculty({ ...faculty, title: e.target.value })}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Our Faculty"
                    />
                </div>
            </div>
        </motion.div>

        {/* Existing Faculty Items */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUsers className="text-blue-600" />
                        Faculty Departments ({faculty.items.length})
                    </h3>
                </div>
                <p className="text-gray-600 mt-2">Manage individual faculty departments and their information</p>
            </div>

            <div className="p-8">
                {faculty.items.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-6">🎓</div>
                        <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Faculty Departments</h3>
                        <p className="text-gray-500">Add your first faculty department to get started</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {faculty.items.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                                        editingFacultyItem?.id === item.id 
                                            ? 'border-2 border-blue-300 shadow-lg bg-blue-50/30' 
                                            : 'border border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    {editingFacultyItem?.id === item.id ? (
                                        // Edit Mode
                                        <div className="p-8 space-y-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                    <FaEdit className="text-blue-600" />
                                                    Edit Faculty Department
                                                </h4>
                                                <button
                                                    onClick={() => setEditingFacultyItem(null)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">Department Title</label>
                                                    <input
                                                        type="text"
                                                        value={editingFacultyItem.title}
                                                        onChange={e => setEditingFacultyItem({ ...editingFacultyItem, title: e.target.value })}
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        placeholder="Computer Science Department"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">URL Slug</label>
                                                    <input
                                                        type="text"
                                                        value={editingFacultyItem.slug}
                                                        onChange={e => setEditingFacultyItem({ ...editingFacultyItem, slug: e.target.value })}
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        placeholder="computer-science"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Department Content</label>
                                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                                                    <RichTextEditor
                                                        value={editingFacultyItem.content}
                                                        onChange={content => setEditingFacultyItem({ ...editingFacultyItem, content })}
                                                        placeholder="Enter department information, faculty members, courses offered..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Faculty Images Management */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                        <FaImages className="text-purple-600" />
                                                        Faculty Images ({(editingFacultyItem?.images || []).length})
                                                    </h5>
                                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                                                        <MultiImageUpload
                                                            onUpload={(urls: string[]) => {
                                                                const toAdd = urls.map(url => ({ url, caption: '', subtitle: '' }));
                                                                setEditingFacultyItem((prev: any) => ({ 
                                                                    ...(prev as any), 
                                                                    images: [ ...((prev as any).images || []), ...toAdd ] 
                                                                }));
                                                            }}
                                                            label="Upload Faculty Images"
                                                        />
                                                    </div>
                                                </div>

                                                {(editingFacultyItem?.images || []).length > 0 && (
                                                    <div className="space-y-4">
                                                        <AnimatePresence>
                                                            {(editingFacultyItem?.images || []).map((img: any, idx: number) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    className="group bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
                                                                    draggable
                                                                    onDragStart={() => { facultyEditImageDragIndexRef.current = idx; }}
                                                                    onDragOver={(e) => e.preventDefault()}
                                                                    onDrop={(e) => {
                                                                        e.preventDefault();
                                                                        const from = facultyEditImageDragIndexRef.current;
                                                                        const to = idx;
                                                                        if (from === null || from === to) return;
                                                                        const reordered = [...(editingFacultyItem.images || [])];
                                                                        const [moved] = reordered.splice(from, 1);
                                                                        reordered.splice(to, 0, moved);
                                                                        setEditingFacultyItem({ ...editingFacultyItem, images: reordered });
                                                                        facultyEditImageDragIndexRef.current = null;
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex-shrink-0">
                                                                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                                                                                {img.url ? (
                                                                                    <img src={img.url} alt="" className="object-cover w-full h-full" />
                                                                                ) : (
                                                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                                                        <FaImage className="text-gray-400" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Image URL"
                                                                                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                                                                value={img.url || ''}
                                                                                onChange={e => {
                                                                                    const updated = [...(editingFacultyItem.images || [])];
                                                                                    updated[idx].url = e.target.value;
                                                                                    setEditingFacultyItem({ ...editingFacultyItem, images: updated });
                                                                                }}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Faculty Name"
                                                                                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                                                                value={img.caption || ''}
                                                                                onChange={e => {
                                                                                    const updated = [...(editingFacultyItem.images || [])];
                                                                                    updated[idx].caption = e.target.value;
                                                                                    setEditingFacultyItem({ ...editingFacultyItem, images: updated });
                                                                                }}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Designation"
                                                                                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                                                                value={img.subtitle || ''}
                                                                                onChange={e => {
                                                                                    const updated = [...(editingFacultyItem.images || [])];
                                                                                    updated[idx].subtitle = e.target.value;
                                                                                    setEditingFacultyItem({ ...editingFacultyItem, images: updated });
                                                                                }}
                                                                            />
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <FaGripVertical className="text-gray-400 cursor-grab" />
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                type="button"
                                                                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                                                onClick={() => setEditingFacultyItem({ 
                                                                                    ...editingFacultyItem, 
                                                                                    images: (editingFacultyItem.images || []).filter((_: any, i: number) => i !== idx) 
                                                                                })}
                                                                            >
                                                                                <FaTrash />
                                                                            </motion.button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Settings */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">Display Order</label>
                                                    <input
                                                        type="number"
                                                        value={editingFacultyItem.order}
                                                        onChange={e => setEditingFacultyItem({ ...editingFacultyItem, order: Number(e.target.value) })}
                                                        className="w-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">Publication Status</label>
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={editingFacultyItem.published}
                                                            onChange={e => setEditingFacultyItem({ ...editingFacultyItem, published: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                                            {editingFacultyItem.published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={async () => {
                                                        const updatedFaculty = ((): any => {
                                                            const current = typeof faculty === 'object' ? faculty : { title: 'Faculty', items: [] };
                                                            return {
                                                                ...current,
                                                                items: (current.items || []).map((f: any) => f.id === editingFacultyItem.id ? editingFacultyItem : f)
                                                            };
                                                        })();
                                                        setFaculty(updatedFaculty);
                                                        setEditingFacultyItem(null);
                                                        if (siteSettings) {
                                                            const updatedSettings: SiteSettings = { ...siteSettings, faculty: updatedFaculty } as SiteSettings;
                                                            const saved = await saveSiteSettings(updatedSettings);
                                                            if (saved) setFaculty(saved.faculty);
                                                        }
                                                    }}
                                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <FaSave />
                                                    Save Changes
                                                </motion.button>
                                                <button
                                                    onClick={() => setEditingFacultyItem(null)}
                                                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors duration-200"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h4 className="text-xl font-bold text-gray-800">{item.title}</h4>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            item.published 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {item.published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                        <span className="flex items-center gap-1">
                                                            <FaLink />
                                                            /{item.slug}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FaSort />
                                                            Order {item.order}
                                                        </span>
                                                        {item.images && (
                                                            <span className="flex items-center gap-1">
                                                                <FaImages />
                                                                {item.images.length} images
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.content && (
                                                        <div 
                                                            className="text-gray-600 text-sm line-clamp-3"
                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setEditingFacultyItem(item)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Department"
                                                    >
                                                        <FaEdit />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={async () => {
                                                            if (!confirm('Are you sure you want to delete this faculty department?')) return;
                                                            const updatedFaculty = ((): any => ({
                                                                ...faculty,
                                                                items: (faculty.items || []).filter((f: any) => f.id !== item.id)
                                                            }))();
                                                            setFaculty(updatedFaculty);
                                                            if (siteSettings) {
                                                                const updatedSettings: SiteSettings = { ...siteSettings, faculty: updatedFaculty } as SiteSettings;
                                                                const saved = await saveSiteSettings(updatedSettings);
                                                                if (saved) setFaculty(saved.faculty);
                                                            }
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Department"
                                                    >
                                                        <FaTrash />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>

        {/* Add New Faculty Department */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaPlus className="text-green-600" />
                        Add New Faculty Department
                    </h3>
                </div>
            </div>

            <div className="p-8 space-y-6">
                {/* Similar structure as edit mode but for new items */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Department Title</label>
                        <input
                            type="text"
                            value={newFacultyItem.title}
                            onChange={e => setNewFacultyItem({ ...newFacultyItem, title: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            placeholder="Computer Science Department"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">URL Slug</label>
                        <input
                            type="text"
                            value={newFacultyItem.slug}
                            onChange={e => setNewFacultyItem({ ...newFacultyItem, slug: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            placeholder="computer-science"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Department Content</label>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <RichTextEditor
                            value={newFacultyItem.content}
                            onChange={content => setNewFacultyItem({ ...newFacultyItem, content })}
                            placeholder="Enter department information, faculty members, courses offered..."
                        />
                    </div>
                </div>

                {/* New Faculty Images Management - Similar to edit mode */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h5 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaImages className="text-purple-600" />
                            Faculty Images ({((newFacultyItem as any).images || []).length})
                        </h5>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                            <MultiImageUpload
                                onUpload={(urls: string[]) => {
                                    const toAdd = urls.map(url => ({ url, caption: '', subtitle: '' }));
                                    setNewFacultyItem(prev => ({ ...(prev as any), images: [ ...((prev as any).images || []), ...toAdd ] }));
                                }}
                                label="Upload Faculty Images"
                            />
                        </div>
                    </div>

                    {/* Image list similar to edit mode */}
                    {/* ... (similar implementation as edit mode) ... */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Display Order</label>
                        <input
                            type="number"
                            value={newFacultyItem.order}
                            onChange={e => setNewFacultyItem({ ...newFacultyItem, order: Number(e.target.value) })}
                            className="w-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Publication Status</label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newFacultyItem.published}
                                onChange={e => setNewFacultyItem({ ...newFacultyItem, published: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {newFacultyItem.published ? 'Published' : 'Draft'}
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                            const id = `${Date.now()}`;
                            const newItem = { id, designation: (newFacultyItem as any).designation || '', ...newFacultyItem } as any;
                            const updatedFaculty = ((): any => ({
                                ...faculty,
                                items: [...(faculty.items || []), newItem]
                            }))();
                            setFaculty(updatedFaculty);
                            setNewFacultyItem({ title: '', slug: '', content: '', order: 1, published: true });
                            if (siteSettings) {
                                const updatedSettings: SiteSettings = { ...siteSettings, faculty: updatedFaculty } as SiteSettings;
                                const saved = await saveSiteSettings(updatedSettings);
                                if (saved) setFaculty(saved.faculty);
                            }
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Faculty Department
                    </motion.button>
                </div>
            </div>
        </motion.div>

        {/* Save All Changes */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
        >
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveFaculty}
                disabled={saving}
                className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
                    saving 
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl'
                }`}
            >
                {saving ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                        />
                        Saving Faculty Data...
                    </>
                ) : (
                    <>
                        <FaSave />
                        Save All Faculty Changes
                    </>
                )}
            </motion.button>
        </motion.div>
    </motion.div>
)}

            </main>


        </div>
    );
}

// Handlers moved inside component
// Handlers moved inside component