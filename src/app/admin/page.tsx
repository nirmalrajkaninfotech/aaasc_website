'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';
import SortableSection from '@/components/SortableSection';
import MultiImageUpload from '@/components/MultiImageUpload';
import { Collage, SiteSettings, RichTextContent, HomepageSection, CarouselItem, AlumniAssociation } from '@/types';

export default function AdminPage() {
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [collages, setCollages] = useState<Collage[]>([]);
    const [activeTab, setActiveTab] = useState<'collages' | 'site' | 'contact' | 'about' | 'placements' | 'achievements' | 'homepage' | 'others' | 'carousel' | 'gallery' | 'homepage_image' | 'alumni'>('collages');
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
    const [newPlacement, setNewPlacement] = useState<Partial<RichTextContent>>({
        title: '',
        content: '',
        image: '',
        alignment: 'left',
        published: true
    });
    const [editingPlacement, setEditingPlacement] = useState<RichTextContent | null>(null);

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
    const handleCreatePlacement = () => {
        if (!newPlacement.title?.trim()) {
            alert('Please enter a title');
            return;
        }

        const placement: RichTextContent = {
            id: `placement-${Date.now()}`,
            title: newPlacement.title,
            content: newPlacement.content || '',
            image: newPlacement.image,
            alignment: newPlacement.alignment || 'left',
            order: (siteSettings?.placements.items.length || 0) + 1,
            published: newPlacement.published || true
        };

        const updatedSettings = {
            ...siteSettings!,
            placements: {
                ...siteSettings!.placements,
                items: [...siteSettings!.placements.items, placement]
            }
        };

        setSiteSettings(updatedSettings);
        setNewPlacement({ title: '', content: '', image: '', alignment: 'left', published: true });
    };

    const handleUpdatePlacement = () => {
        if (!editingPlacement) return;

        const updatedSettings = {
            ...siteSettings!,
            placements: {
                ...siteSettings!.placements,
                items: siteSettings!.placements.items.map(item =>
                    item.id === editingPlacement.id ? editingPlacement : item
                )
            }
        };

        setSiteSettings(updatedSettings);
        setEditingPlacement(null);
    };

    const handleDeletePlacement = (id: string) => {
        if (!confirm('Are you sure you want to delete this placement?')) return;

        const updatedSettings = {
            ...siteSettings!,
            placements: {
                ...siteSettings!.placements,
                items: siteSettings!.placements.items.filter(item => item.id !== id)
            }
        };

        setSiteSettings(updatedSettings);
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
            <Header siteSettings={siteSettings} />

            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

                {/* Tab Navigation */}
                <nav className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('collages')}
                        className={`px-4 py-2 rounded ${activeTab === 'collages' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Manage Collages
                    </button>
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
                    <button
                        onClick={() => setActiveTab('placements')}
                        className={`px-4 py-2 rounded ${activeTab === 'placements' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Placements
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
                        onClick={() => setActiveTab('homepage_image')}
                        className={`px-4 py-2 rounded ${activeTab === 'homepage_image' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Homepage Image
                    </button>
                    <button onClick={() => setActiveTab('alumni')} className={`px-4 py-2 rounded ${activeTab === 'alumni' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Alumni Association</button>
                </nav>

                {/* Collages Tab */}
                {activeTab === 'collages' && (
                    <div className="space-y-8">
                        {/* Create New Collage */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Create New Collage</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newCollage.title}
                                        onChange={(e) => setNewCollage({ ...newCollage, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter collage title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newCollage.description}
                                        onChange={(e) => setNewCollage({ ...newCollage, description: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter collage description"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <input
                                            type="text"
                                            value={newCollage.category}
                                            onChange={(e) => setNewCollage({ ...newCollage, category: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="e.g., Campus Life, Academics, Sports"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={newCollage.tags}
                                            onChange={(e) => setNewCollage({ ...newCollage, tags: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="e.g., campus, students, activities"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={newCollage.featured}
                                        onChange={(e) => setNewCollage({ ...newCollage, featured: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                                        Mark as Featured
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image URLs
                                    </label>
                                    {newCollage.images.map((image, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={image}
                                                onChange={(e) => {
                                                    const newImages = [...newCollage.images];
                                                    newImages[index] = e.target.value;
                                                    setNewCollage({ ...newCollage, images: newImages });
                                                }}
                                                className="flex-1 p-2 border border-gray-300 rounded-md"
                                                placeholder="Enter image URL"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newImages = newCollage.images.filter((_, i) => i !== index);
                                                    setNewCollage({ ...newCollage, images: newImages });
                                                }}
                                                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setNewCollage({ ...newCollage, images: [...newCollage.images, ''] })}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Add Image
                                    </button>
                                </div>
                                <button
                                    onClick={handleCreateCollage}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Collage
                                </button>
                            </div>
                        </div>

                        {/* Existing Collages */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Existing Collages</h2>
                            {collages.length === 0 ? (
                                <p className="text-gray-500">No collages yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {collages.map((collage) => (
                                        <div key={collage.id} className="border border-gray-200 p-4 rounded-md">
                                            {editingCollage?.id === collage.id ? (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={editingCollage.title}
                                                        onChange={(e) => setEditingCollage({ ...editingCollage, title: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    />
                                                    {editingCollage.images.map((image, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={image}
                                                                onChange={(e) => {
                                                                    const newImages = [...editingCollage.images];
                                                                    newImages[index] = e.target.value;
                                                                    setEditingCollage({ ...editingCollage, images: newImages });
                                                                }}
                                                                className="flex-1 p-2 border border-gray-300 rounded-md"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newImages = editingCollage.images.filter((_, i) => i !== index);
                                                                    setEditingCollage({ ...editingCollage, images: newImages });
                                                                }}
                                                                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingCollage({ ...editingCollage, images: [...editingCollage.images, ''] })}
                                                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                                        >
                                                            Add Image
                                                        </button>
                                                        <button
                                                            onClick={handleUpdateCollage}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingCollage(null)}
                                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{collage.title}</h3>
                                                        <p className="text-sm text-gray-600">{collage.images.length} images</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingCollage(collage)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCollage(collage.id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                    <RichTextEditor
                                        value={siteSettings.about.content}
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
                                        label="About Image"
                                    />
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
                                            placeholder="Write committee details..."
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
                                            placeholder="Write temple administration details..."
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
                                            placeholder="Write secretary's message..."
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
                                            placeholder="Write principal's message..."
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
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
                        <div className="space-y-6">
                            {/* Basic Settings */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Title
                                </label>
                                <input
                                    type="text"
                                    value={siteSettings.siteTitle}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo URL
                                </label>
                                <input
                                    type="text"
                                    value={siteSettings.logo}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, logo: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Navigation Links */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Navigation Links
                                </label>
                                {siteSettings.navLinks.map((link, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newNavLinks = [...siteSettings.navLinks];
                                                newNavLinks[index] = { ...link, label: e.target.value };
                                                setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                            }}
                                            className="flex-1 p-2 border border-gray-300 rounded-md"
                                            placeholder="Label"
                                        />
                                        <input
                                            type="text"
                                            value={link.href}
                                            onChange={(e) => {
                                                const newNavLinks = [...siteSettings.navLinks];
                                                newNavLinks[index] = { ...link, href: e.target.value };
                                                setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                            }}
                                            className="flex-1 p-2 border border-gray-300 rounded-md"
                                            placeholder="URL"
                                        />
                                        <button
                                            onClick={() => {
                                                const newNavLinks = siteSettings.navLinks.filter((_, i) => i !== index);
                                                setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                            }}
                                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newNavLinks = [...siteSettings.navLinks, { label: '', href: '' }];
                                        setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Add Nav Link
                                </button>
                            </div>

                            {/* Footer Settings */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Footer Text
                                </label>
                                <input
                                    type="text"
                                    value={siteSettings.footer.text}
                                    onChange={(e) => setSiteSettings({
                                        ...siteSettings,
                                        footer: { ...siteSettings.footer, text: e.target.value }
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Social Links */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Social Links
                                </label>
                                {siteSettings.footer.socialLinks.map((link, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
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
                                            className="flex-1 p-2 border border-gray-300 rounded-md"
                                            placeholder="Platform"
                                        />
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
                                            className="flex-1 p-2 border border-gray-300 rounded-md"
                                            placeholder="URL"
                                        />
                                        <button
                                            onClick={() => {
                                                const newSocialLinks = siteSettings.footer.socialLinks.filter((_, i) => i !== index);
                                                setSiteSettings({
                                                    ...siteSettings,
                                                    footer: { ...siteSettings.footer, socialLinks: newSocialLinks }
                                                });
                                            }}
                                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newSocialLinks = [...siteSettings.footer.socialLinks, { label: '', href: '' }];
                                        setSiteSettings({
                                            ...siteSettings,
                                            footer: { ...siteSettings.footer, socialLinks: newSocialLinks }
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Add Social Link
                                </button>
                            </div>

                            <button
                                onClick={handleSaveSiteSettings}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Site Settings'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Contact Info Tab */}
                {activeTab === 'contact' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Contact Info</h2>
                        <p className="text-gray-600 mb-6">Update contact details for your site.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={siteSettings.contact.address}
                                    onChange={(e) =>
                                        setSiteSettings({
                                            ...siteSettings,
                                            contact: { ...siteSettings.contact, address: e.target.value },
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.contact.phone}
                                        onChange={(e) =>
                                            setSiteSettings({
                                                ...siteSettings,
                                                contact: { ...siteSettings.contact, phone: e.target.value },
                                            })
                                        }
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={siteSettings.contact.email}
                                        onChange={(e) =>
                                            setSiteSettings({
                                                ...siteSettings,
                                                contact: { ...siteSettings.contact, email: e.target.value },
                                            })
                                        }
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Office Hours
                                </label>
                                <textarea
                                    value={siteSettings.contact.officeHours}
                                    onChange={(e) =>
                                        setSiteSettings({
                                            ...siteSettings,
                                            contact: { ...siteSettings.contact, officeHours: e.target.value },
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Google Maps Embed URL
                                </label>
                                <input
                                    type="text"
                                    value={siteSettings.contact.googleMapsUrl || ''}
                                    onChange={(e) =>
                                        setSiteSettings({
                                            ...siteSettings,
                                            contact: { ...siteSettings.contact, googleMapsUrl: e.target.value },
                                        })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter Google Maps embed URL"
                                />
                            </div>

                            <button
                                onClick={handleSaveSiteSettings}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Contact Information'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Placements Tab */}
                {activeTab === 'placements' && (
                    <div className="space-y-8">
                        {/* Section Settings */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Placements Section Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section Title
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.placements?.title || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            placements: { ...siteSettings.placements, title: e.target.value }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.placements?.subtitle || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            placements: { ...siteSettings.placements, subtitle: e.target.value }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Create New Placement */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Create New Placement</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newPlacement.title || ''}
                                        onChange={(e) => setNewPlacement({ ...newPlacement, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter placement title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <RichTextEditor
                                        value={newPlacement.content || ''}
                                        onChange={(content) => setNewPlacement({ ...newPlacement, content })}
                                        placeholder="Enter placement content with rich formatting..."
                                    />
                                </div>

                                <div>
                                    <ImageUpload
                                        value={newPlacement.image || ''}
                                        onChange={(image) => setNewPlacement({ ...newPlacement, image })}
                                        label="Placement Image"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Text Alignment
                                        </label>
                                        <select
                                            value={newPlacement.alignment || 'left'}
                                            onChange={(e) => setNewPlacement({ ...newPlacement, alignment: e.target.value as 'left' | 'center' | 'right' })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="placement-published"
                                            checked={newPlacement.published || false}
                                            onChange={(e) => setNewPlacement({ ...newPlacement, published: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label htmlFor="placement-published" className="text-sm font-medium text-gray-700">
                                            Published
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreatePlacement}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Placement
                                </button>
                            </div>
                        </div>

                        {/* Existing Placements */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Existing Placements</h2>
                            {siteSettings.placements?.items.length === 0 ? (
                                <p className="text-gray-500">No placements yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {siteSettings.placements?.items.map((placement) => (
                                        <div key={placement.id} className="border border-gray-200 p-4 rounded-md">
                                            {editingPlacement?.id === placement.id ? (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={editingPlacement.title}
                                                        onChange={(e) => setEditingPlacement({ ...editingPlacement, title: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    />
                                                    <RichTextEditor
                                                        value={editingPlacement.content}
                                                        onChange={(content) => setEditingPlacement({ ...editingPlacement, content })}
                                                    />
                                                    <ImageUpload
                                                        value={editingPlacement.image || ''}
                                                        onChange={(image) => setEditingPlacement({ ...editingPlacement, image })}
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={editingPlacement.alignment}
                                                            onChange={(e) => setEditingPlacement({ ...editingPlacement, alignment: e.target.value as 'left' | 'center' | 'right' })}
                                                            className="p-2 border border-gray-300 rounded-md"
                                                        >
                                                            <option value="left">Left</option>
                                                            <option value="center">Center</option>
                                                            <option value="right">Right</option>
                                                        </select>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={editingPlacement.published}
                                                                onChange={(e) => setEditingPlacement({ ...editingPlacement, published: e.target.checked })}
                                                                className="mr-2"
                                                            />
                                                            Published
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleUpdatePlacement}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingPlacement(null)}
                                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{placement.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {placement.alignment} aligned • {placement.published ? 'Published' : 'Draft'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingPlacement(placement)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePlacement(placement.id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={handleSaveSiteSettings}
                                disabled={saving}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                    <div className="space-y-8">
                        {/* Section Settings */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Achievements Section Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section Title
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.achievements?.title || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            achievements: { ...siteSettings.achievements, title: e.target.value }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.achievements?.subtitle || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            achievements: { ...siteSettings.achievements, subtitle: e.target.value }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Create New Achievement */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Create New Achievement</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newAchievement.title || ''}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter achievement title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <RichTextEditor
                                        value={newAchievement.content || ''}
                                        onChange={(content) => setNewAchievement({ ...newAchievement, content })}
                                        placeholder="Enter achievement content with rich formatting..."
                                    />
                                </div>

                                <div>
                                    <ImageUpload
                                        value={newAchievement.image || ''}
                                        onChange={(image) => setNewAchievement({ ...newAchievement, image })}
                                        label="Achievement Image"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Text Alignment
                                        </label>
                                        <select
                                            value={newAchievement.alignment || 'left'}
                                            onChange={(e) => setNewAchievement({ ...newAchievement, alignment: e.target.value as 'left' | 'center' | 'right' })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="achievement-published"
                                            checked={newAchievement.published || false}
                                            onChange={(e) => setNewAchievement({ ...newAchievement, published: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label htmlFor="achievement-published" className="text-sm font-medium text-gray-700">
                                            Published
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateAchievement}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Achievement
                                </button>
                            </div>
                        </div>

                        {/* Existing Achievements */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Existing Achievements</h2>
                            {siteSettings.achievements?.items.length === 0 ? (
                                <p className="text-gray-500">No achievements yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {siteSettings.achievements?.items.map((achievement) => (
                                        <div key={achievement.id} className="border border-gray-200 p-4 rounded-md">
                                            {editingAchievement?.id === achievement.id ? (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={editingAchievement.title}
                                                        onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    />
                                                    <RichTextEditor
                                                        value={editingAchievement.content}
                                                        onChange={(content) => setEditingAchievement({ ...editingAchievement, content })}
                                                    />
                                                    <ImageUpload
                                                        value={editingAchievement.image || ''}
                                                        onChange={(image) => setEditingAchievement({ ...editingAchievement, image })}
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={editingAchievement.alignment}
                                                            onChange={(e) => setEditingAchievement({ ...editingAchievement, alignment: e.target.value as 'left' | 'center' | 'right' })}
                                                            className="p-2 border border-gray-300 rounded-md"
                                                        >
                                                            <option value="left">Left</option>
                                                            <option value="center">Center</option>
                                                            <option value="right">Right</option>
                                                        </select>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={editingAchievement.published}
                                                                onChange={(e) => setEditingAchievement({ ...editingAchievement, published: e.target.checked })}
                                                                className="mr-2"
                                                            />
                                                            Published
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleUpdateAchievement}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingAchievement(null)}
                                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{achievement.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {achievement.alignment} aligned • {achievement.published ? 'Published' : 'Draft'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingAchievement(achievement)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAchievement(achievement.id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={handleSaveSiteSettings}
                                disabled={saving}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Homepage Layout Tab */}
                {activeTab === 'homepage' && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Homepage Layout Management</h2>
                            <p className="text-gray-600 mb-6">
                                Control which sections appear on your homepage and in what order.
                                Drag and drop to reorder sections, and use the toggle switches to show or hide them.
                            </p>

                            {siteSettings.homepage?.sections ? (
                                <SortableSection
                                    sections={siteSettings.homepage.sections}
                                    onSectionsChange={handleHomepageSectionsChange}
                                />
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No homepage sections configured.
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleSaveSiteSettings}
                                    disabled={saving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Homepage Layout'}
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Current Homepage Layout Preview</h3>
                            <div className="space-y-2">
                                {siteSettings.homepage?.sections
                                    ?.filter(section => section.enabled)
                                    ?.sort((a, b) => a.order - b.order)
                                    ?.map((section: HomepageSection, index: number) => (
                                        <div
                                            key={section.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium text-gray-800">
                                                    {section.name}
                                                </span>
                                            </div>
                                            <span className="text-green-600 text-sm font-medium">
                                                Visible
                                            </span>
                                        </div>
                                    ))}

                                {siteSettings.homepage?.sections?.filter(section => section.enabled).length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No sections are currently enabled for the homepage.
                                    </div>
                                )}
                            </div>

                            {siteSettings.homepage?.sections?.some(section => !section.enabled) && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Hidden Sections:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {siteSettings.homepage.sections
                                            .filter(section => !section.enabled)
                                            .map((section: HomepageSection) => (
                                                <span
                                                    key={section.id}
                                                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                                                >
                                                    {section.name}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Carousel Tab */}
                {activeTab === 'carousel' && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Manage Carousel</h2>
                            {/* Multi-image upload */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Add Images</h3>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="mb-2"
                                    onChange={e => handleMultiImageUpload(e.target.files)}
                                    disabled={uploading}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    disabled={uploading}
                                >{uploading ? 'Uploading...' : 'Upload Images'}</button>
                            </div>
                            {/* Sortable carousel list */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Carousel Images (Drag to reorder)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {carouselOrder.map(item => (
                                        <div
                                            key={item.id}
                                            className="relative border rounded-lg p-4 flex flex-col gap-2 bg-gray-50 cursor-move"
                                            draggable
                                            onDragStart={e => handleDragStart(e, item.id)}
                                            onDrop={e => handleDrop(e, item.id)}
                                            onDragOver={handleDragOver}
                                        >
                                            <img src={item.image} alt={item.caption || 'carousel'} className="w-full h-40 object-cover rounded" />
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold">{item.caption}</span>
                                                {item.link && <a href={item.link} className="text-blue-600 text-xs" target="_blank" rel="noopener noreferrer">{item.link}</a>}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => handleEditCarousel(item)} className="px-2 py-1 bg-yellow-400 text-white rounded">Edit</button>
                                                <button onClick={() => handleDeleteCarousel(item.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSaveOrder}
                                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >Save Order</button>
                            </div>
                            {/* Edit Carousel Modal */}
                            {editingCarousel && (
                                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                        <h3 className="text-lg font-semibold mb-4">Edit Carousel Item</h3>
                                        <ImageUpload value={editingCarousel.image} onChange={img => setEditingCarousel(c => c ? { ...c, image: img } : null)} />
                                        <input
                                            type="text"
                                            placeholder="Caption (optional)"
                                            value={editingCarousel.caption || ''}
                                            onChange={e => setEditingCarousel(c => c ? { ...c, caption: e.target.value } : null)}
                                            className="border p-2 rounded w-full my-2"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Link (optional)"
                                            value={editingCarousel.link || ''}
                                            onChange={e => setEditingCarousel(c => c ? { ...c, link: e.target.value } : null)}
                                            className="border p-2 rounded w-full my-2"
                                        />
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={handleUpdateCarousel} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                                            <button onClick={() => setEditingCarousel(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Others Tab */}
                {activeTab === 'others' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Manage Others Links</h2>
                        <div className="space-y-6">
                            {siteSettings.navLinks.find(link => link.label === 'Others')?.subLinks?.map((subLink, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={subLink.label}
                                        onChange={(e) => {
                                            const newNavLinks = [...siteSettings.navLinks];
                                            const othersLink = newNavLinks.find(link => link.label === 'Others');
                                            if (othersLink && othersLink.subLinks) {
                                                othersLink.subLinks[index] = { ...subLink, label: e.target.value };
                                                setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                            }
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                        placeholder="Label"
                                    />
                                    <input
                                        type="text"
                                        value={subLink.href}
                                        onChange={(e) => {
                                            const newNavLinks = [...siteSettings.navLinks];
                                            const othersLink = newNavLinks.find(link => link.label === 'Others');
                                            if (othersLink && othersLink.subLinks) {
                                                othersLink.subLinks[index] = { ...subLink, href: e.target.value };
                                                setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                            }
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                        placeholder="URL"
                                    />
                                    <button
                                        onClick={() => {
                                            const newNavLinks = [...siteSettings.navLinks];
                                            const othersLink = newNavLinks.find(link => link.label === 'Others');
                                            if (othersLink && othersLink.subLinks) {
                                                othersLink.subLinks = othersLink.subLinks.filter((_, i) => i !== index);
                                                setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                            }
                                        }}
                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newNavLinks = [...siteSettings.navLinks];
                                    const othersLink = newNavLinks.find(link => link.label === 'Others');
                                    if (othersLink) {
                                        if (!othersLink.subLinks) {
                                            othersLink.subLinks = [];
                                        }
                                        othersLink.subLinks.push({ label: '', href: '' });
                                        setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                    }
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Add Other Link
                            </button>
                        </div>
                         <button
                                onClick={handleSaveSiteSettings}
                                disabled={saving}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </button>
                    </div>
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
                                <textarea
                                    className="border p-2 rounded w-full mb-2"
                                    placeholder="Content (HTML allowed)"
                                    rows={5}
                                    value={alumni.content}
                                    onChange={e => handleAlumniChange('content', e.target.value)}
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
            </main>

            <Footer siteSettings={siteSettings} />
        </div>
    );
}