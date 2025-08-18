'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';
import SortableSection from '@/components/SortableSection';
import { Collage, SiteSettings, RichTextContent, HomepageSection, ImageWithAlignment, ImageOrString } from '@/types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Navigation Item Component
function SortableNavItem({ 
    link, 
    index, 
    onUpdate, 
    onRemove 
}: { 
    link: { label: string; href: string }, 
    index: number, 
    onUpdate: (index: number, field: 'label' | 'href', value: string) => void,
    onRemove: (index: number) => void 
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `nav-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex gap-2 mb-2 p-2 bg-white border rounded-md ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded cursor-grab active:cursor-grabbing hover:bg-gray-200"
            >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
            </div>
            <input
                type="text"
                value={link.label}
                onChange={(e) => onUpdate(index, 'label', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="Label"
            />
            <input
                type="text"
                value={link.href}
                onChange={(e) => onUpdate(index, 'href', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="URL"
            />
            <button
                onClick={() => onRemove(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
                Remove
            </button>
        </div>
    );
}

export default function AdminPage() {
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [collages, setCollages] = useState<Collage[]>([]);
    const [activeTab, setActiveTab] = useState<'collages' | 'site' | 'contact' | 'about' | 'temple' | 'placements' | 'achievements' | 'alumni' | 'homepage' | 'others'>('collages');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag end for navigation links
    const handleNavDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id && siteSettings) {
            const activeIndex = parseInt(active.id.toString().replace('nav-', ''));
            const overIndex = parseInt(over?.id.toString().replace('nav-', '') || '0');

            const newNavLinks = arrayMove(siteSettings.navLinks, activeIndex, overIndex);
            setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
        }
    };

    // Navigation link helper functions
    const handleNavUpdate = (index: number, field: 'label' | 'href', value: string) => {
        if (!siteSettings) return;
        const newNavLinks = [...siteSettings.navLinks];
        newNavLinks[index] = { ...newNavLinks[index], [field]: value };
        setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
    };

    const handleNavRemove = (index: number) => {
        if (!siteSettings) return;
        const newNavLinks = siteSettings.navLinks.filter((_, i) => i !== index);
        setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
    };

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

    const [newAlumni, setNewAlumni] = useState<Partial<RichTextContent>>({
        title: '',
        content: '',
        image: '',
        alignment: 'left',
        published: true
    });
    const [editingAlumni, setEditingAlumni] = useState<RichTextContent | null>(null);

    const [newAboutStat, setNewAboutStat] = useState<{ label: string; value: string }>({
        label: '',
        value: ''
    });

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

    // Alumni management functions
    const handleCreateAlumni = () => {
        if (!newAlumni.title?.trim()) {
            alert('Please enter a title');
            return;
        }

        const item: RichTextContent = {
            id: `alumni-${Date.now()}`,
            title: newAlumni.title!,
            content: newAlumni.content || '',
            image: newAlumni.image,
            alignment: newAlumni.alignment || 'left',
            order: ((siteSettings?.alumni?.items.length) || 0) + 1,
            published: newAlumni.published || true
        };

        const updatedSettings = {
            ...siteSettings!,
            alumni: {
                title: siteSettings!.alumni?.title || 'Alumni Association',
                subtitle: siteSettings!.alumni?.subtitle || 'Stay connected with our alumni network',
                items: [...(siteSettings!.alumni?.items || []), item]
            }
        };

        setSiteSettings(updatedSettings);
        setNewAlumni({ title: '', content: '', image: '', alignment: 'left', published: true });
    };

    const handleUpdateAlumni = () => {
        if (!editingAlumni) return;

        const updatedSettings = {
            ...siteSettings!,
            alumni: {
                title: siteSettings!.alumni?.title || 'Alumni Association',
                subtitle: siteSettings!.alumni?.subtitle || 'Stay connected with our alumni network',
                items: (siteSettings!.alumni?.items || []).map(item =>
                    item.id === editingAlumni.id ? editingAlumni : item
                )
            }
        };

        setSiteSettings(updatedSettings);
        setEditingAlumni(null);
    };

    const handleDeleteAlumni = (id: string) => {
        if (!confirm('Are you sure you want to delete this alumni item?')) return;

        const updatedSettings = {
            ...siteSettings!,
            alumni: {
                title: siteSettings!.alumni?.title || 'Alumni Association',
                subtitle: siteSettings!.alumni?.subtitle || 'Stay connected with our alumni network',
                items: (siteSettings!.alumni?.items || []).filter(item => item.id !== id)
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
                <div className="flex space-x-4 mb-8 border-b">
                    <button
                        onClick={() => setActiveTab('collages')}
                        className={`pb-2 px-1 ${activeTab === 'collages'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Manage Collages
                    </button>
                    <button
                        onClick={() => setActiveTab('site')}
                        className={`pb-2 px-1 ${activeTab === 'site'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Site Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`pb-2 px-1 ${activeTab === 'contact'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Contact Info
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`pb-2 px-1 ${activeTab === 'about'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        About
                    </button>
                    <button
                        onClick={() => setActiveTab('temple')}
                        className={`pb-2 px-1 ${activeTab === 'temple'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Temple Admin
                    </button>
                    <button
                        onClick={() => setActiveTab('placements')}
                        className={`pb-2 px-1 ${activeTab === 'placements'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Placements
                    </button>
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`pb-2 px-1 ${activeTab === 'achievements'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Achievements
                    </button>
                    <button
                        onClick={() => setActiveTab('alumni')}
                        className={`pb-2 px-1 ${activeTab === 'alumni'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Alumni
                    </button>
                    <button
                        onClick={() => setActiveTab('homepage')}
                        className={`pb-2 px-1 ${activeTab === 'homepage'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Homepage Layout
                    </button>
                    <button
                        onClick={() => setActiveTab('others')}
                        className={`pb-2 px-1 ${activeTab === 'others'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Others
                    </button>
                </div>

                {/* Temple Admin Tab */}
                {activeTab === 'temple' && siteSettings && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Temple Administration</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.about.templeAdministration?.title || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            about: {
                                                ...siteSettings.about,
                                                templeAdministration: {
                                                    ...(siteSettings.about.templeAdministration || { title: '', content: '' }),
                                                    title: e.target.value
                                                }
                                            }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <RichTextEditor
                                        value={siteSettings.about.templeAdministration?.content || ''}
                                        onChange={(content) => setSiteSettings({
                                            ...siteSettings,
                                            about: {
                                                ...siteSettings.about,
                                                templeAdministration: {
                                                    ...(siteSettings.about.templeAdministration || { title: '', content: '' }),
                                                    content
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Images
                                    </label>
                                    <div className="space-y-2">
                                        {(siteSettings.about.templeAdministration?.images || []).map((img, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={img}
                                                    onChange={(e) => {
                                                        const newImages = [...(siteSettings.about.templeAdministration?.images || [])];
                                                        newImages[index] = e.target.value;
                                                        setSiteSettings({
                                                            ...siteSettings,
                                                            about: {
                                                                ...siteSettings.about,
                                                                templeAdministration: {
                                                                    ...(siteSettings.about.templeAdministration || { title: '', content: '' }),
                                                                    images: newImages
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    className="flex-1 p-2 border border-gray-300 rounded-md"
                                                    placeholder="Image URL"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newImages = (siteSettings.about.templeAdministration?.images || []).filter((_, i) => i !== index);
                                                        setSiteSettings({
                                                            ...siteSettings,
                                                            about: {
                                                                ...siteSettings.about,
                                                                templeAdministration: {
                                                                    ...(siteSettings.about.templeAdministration || { title: '', content: '' }),
                                                                    images: newImages
                                                                }
                                                            }
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
                                                const currentImages = siteSettings.about.templeAdministration?.images || [];
                                                setSiteSettings({
                                                    ...siteSettings,
                                                    about: {
                                                        ...siteSettings.about,
                                                        templeAdministration: {
                                                            ...(siteSettings.about.templeAdministration || { title: '', content: '' }),
                                                            images: [...currentImages, '']
                                                        }
                                                    }
                                                });
                                            }}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Add Another Image
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image Alignment
                                    </label>
                                    <select
                                        value={siteSettings.about.templeAdministration?.alignment || 'left'}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            about: {
                                                ...siteSettings.about,
                                                templeAdministration: {
                                                    ...(siteSettings.about.templeAdministration || { title: '', content: '' }),
                                                    alignment: e.target.value as 'left' | 'right'
                                                }
                                            }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alumni Tab */}
                {activeTab === 'alumni' && (
                    <div className="space-y-8">
                        {/* Section Settings */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Alumni Section Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section Title
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.alumni?.title || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            alumni: { ...(siteSettings.alumni || { title: '', subtitle: '', items: [] }), title: e.target.value }
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
                                        value={siteSettings.alumni?.subtitle || ''}
                                        onChange={(e) => setSiteSettings({
                                            ...siteSettings,
                                            alumni: { ...(siteSettings.alumni || { title: '', subtitle: '', items: [] }), subtitle: e.target.value }
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Create New Alumni Item */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Create New Alumni Item</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newAlumni.title || ''}
                                        onChange={(e) => setNewAlumni({ ...newAlumni, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter alumni item title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <RichTextEditor
                                        value={newAlumni.content || ''}
                                        onChange={(content) => setNewAlumni({ ...newAlumni, content })}
                                        placeholder="Enter alumni content with rich formatting..."
                                    />
                                </div>

                                <div>
                                    <ImageUpload
                                        value={newAlumni.image || ''}
                                        onChange={(image) => setNewAlumni({ ...newAlumni, image })}
                                        label="Alumni Image"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Text Alignment
                                        </label>
                                        <select
                                            value={newAlumni.alignment || 'left'}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, alignment: e.target.value as 'left' | 'center' | 'right' })}
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
                                            id="alumni-published"
                                            checked={newAlumni.published || false}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, published: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label htmlFor="alumni-published" className="text-sm font-medium text-gray-700">
                                            Published
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateAlumni}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Alumni Item
                                </button>
                            </div>
                        </div>

                        {/* Existing Alumni Items */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Existing Alumni Items</h2>
                            {(siteSettings.alumni?.items || []).length === 0 ? (
                                <p className="text-gray-500">No alumni items yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {(siteSettings.alumni?.items || []).map((item) => (
                                        <div key={item.id} className="border border-gray-200 p-4 rounded-md">
                                            {editingAlumni?.id === item.id ? (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={editingAlumni.title}
                                                        onChange={(e) => setEditingAlumni({ ...editingAlumni, title: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    />
                                                    <RichTextEditor
                                                        value={editingAlumni.content}
                                                        onChange={(content) => setEditingAlumni({ ...editingAlumni, content })}
                                                    />
                                                    <ImageUpload
                                                        value={editingAlumni.image || ''}
                                                        onChange={(image) => setEditingAlumni({ ...editingAlumni, image })}
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={editingAlumni.alignment}
                                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, alignment: e.target.value as 'left' | 'center' | 'right' })}
                                                            className="p-2 border border-gray-300 rounded-md"
                                                        >
                                                            <option value="left">Left</option>
                                                            <option value="center">Center</option>
                                                            <option value="right">Right</option>
                                                        </select>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={editingAlumni.published}
                                                                onChange={(e) => setEditingAlumni({ ...editingAlumni, published: e.target.checked })}
                                                                className="mr-2"
                                                            />
                                                            Published
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleUpdateAlumni}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingAlumni(null)}
                                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{item.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {item.alignment} aligned • {item.published ? 'Published' : 'Draft'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingAlumni(item)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAlumni(item.id)}
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
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Temple Images</label>
                                                <div className="space-y-4">
                                                    {(siteSettings.about.templeAdministration?.images || []).map((img, index) => {
                                                        const imageData: { url: string; alignment: 'left' | 'right'; caption?: string; subCaption?: string } =
                                                            typeof img === 'string'
                                                                ? { url: img, alignment: 'left', caption: '', subCaption: '' }
                                                                : {
                                                                    url: img.url || '',
                                                                    alignment: (img.alignment || 'left') as 'left' | 'right',
                                                                    caption: img.caption || '',
                                                                    subCaption: img.subCaption || ''
                                                                  };
                                                        
                                                        return (
                                                            <div key={index} className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-1">
                                                                        <ImageUpload
                                                                            value={imageData.url}
                                                                            onChange={(newImage) => {
                                                                                const currentImages = [...(siteSettings.about.templeAdministration?.images || [])] as ImageOrString[];
                                                                                currentImages[index] = {
                                                                                    ...imageData,
                                                                                    url: newImage,
                                                                                } as ImageWithAlignment;
                                                                                setSiteSettings({
                                                                                    ...siteSettings,
                                                                                    about: {
                                                                                        ...siteSettings.about,
                                                                                        templeAdministration: {
                                                                                            ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', images: [] }),
                                                                                            images: currentImages
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }}
                                                                            label={`Image ${index + 1}`}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-3 w-56">
                                                                        <div className="flex items-center gap-2">
                                                                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Align:</label>
                                                                            <select
                                                                                value={imageData.alignment}
                                                                                onChange={(e) => {
                                                                                    const currentImages = [...(siteSettings.about.templeAdministration?.images || [])] as ImageOrString[];
                                                                                    currentImages[index] = {
                                                                                        ...imageData,
                                                                                        alignment: e.target.value as 'left' | 'right',
                                                                                    } as ImageWithAlignment;
                                                                                    setSiteSettings({
                                                                                        ...siteSettings,
                                                                                        about: {
                                                                                            ...siteSettings.about,
                                                                                            templeAdministration: {
                                                                                                ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', images: [] }),
                                                                                                images: currentImages
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className="block w-full pl-2 pr-8 py-1 text-sm border-gray-300 rounded-md"
                                                                            >
                                                                                <option value="left">Left</option>
                                                                                <option value="right">Right</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs text-gray-600 mb-1">Caption</label>
                                                                            <input
                                                                                type="text"
                                                                                value={(typeof (siteSettings.about.templeAdministration?.images?.[index]) === 'object' && (siteSettings.about.templeAdministration?.images?.[index] as ImageWithAlignment).caption) || ''}
                                                                                onChange={(e) => {
                                                                                    const currentImages = [...(siteSettings.about.templeAdministration?.images || [])] as ImageOrString[];
                                                                                    currentImages[index] = {
                                                                                        ...imageData,
                                                                                        caption: e.target.value,
                                                                                    } as ImageWithAlignment;
                                                                                    setSiteSettings({
                                                                                        ...siteSettings,
                                                                                        about: {
                                                                                            ...siteSettings.about,
                                                                                            templeAdministration: {
                                                                                                ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', images: [] }),
                                                                                                images: currentImages
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className="block w-full p-2 text-sm border border-gray-300 rounded-md"
                                                                                placeholder="Enter caption"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs text-gray-600 mb-1">Sub-caption</label>
                                                                            <input
                                                                                type="text"
                                                                                value={(typeof (siteSettings.about.templeAdministration?.images?.[index]) === 'object' && (siteSettings.about.templeAdministration?.images?.[index] as ImageWithAlignment).subCaption) || ''}
                                                                                onChange={(e) => {
                                                                                    const currentImages = [...(siteSettings.about.templeAdministration?.images || [])] as ImageOrString[];
                                                                                    currentImages[index] = {
                                                                                        ...imageData,
                                                                                        subCaption: e.target.value,
                                                                                    } as ImageWithAlignment;
                                                                                    setSiteSettings({
                                                                                        ...siteSettings,
                                                                                        about: {
                                                                                            ...siteSettings.about,
                                                                                            templeAdministration: {
                                                                                                ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', images: [] }),
                                                                                                images: currentImages
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className="block w-full p-2 text-sm border border-gray-300 rounded-md"
                                                                                placeholder="Enter sub-caption"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updatedImages = (siteSettings.about.templeAdministration?.images || []).filter((_, i) => i !== index);
                                                                                setSiteSettings({
                                                                                    ...siteSettings,
                                                                                    about: {
                                                                                        ...siteSettings.about,
                                                                                        templeAdministration: {
                                                                                            ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', images: [] }),
                                                                                            images: updatedImages
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }}
                                                                            className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm font-medium"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentImages = (siteSettings.about.templeAdministration?.images || []) as ImageOrString[];
                                                            setSiteSettings({
                                                                ...siteSettings,
                                                                about: {
                                                                    ...siteSettings.about,
                                                                    templeAdministration: {
                                                                        ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', images: [], alignment: 'left' }),
                                                                        images: [...currentImages, { url: '', alignment: 'left', caption: '', subCaption: '' } as ImageWithAlignment]
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Add Another Image
                                                    </button>
                                                </div>
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
                                                                ...(siteSettings.about.templeAdministration || { title: 'Temple Administration', content: '', images: [], alignment: 'left' }),
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
                                    <span className="text-xs text-gray-500 ml-2">(Drag to reorder)</span>
                                </label>
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleNavDragEnd}
                                >
                                    <SortableContext
                                        items={siteSettings.navLinks.map((_, index) => `nav-${index}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {siteSettings.navLinks.map((link, index) => (
                                            <SortableNavItem
                                                key={`nav-${index}`}
                                                link={link}
                                                index={index}
                                                onUpdate={handleNavUpdate}
                                                onRemove={handleNavRemove}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                                <button
                                    onClick={() => {
                                        const newNavLinks = [...siteSettings.navLinks, { label: '', href: '' }];
                                        setSiteSettings({ ...siteSettings, navLinks: newNavLinks });
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mt-2"
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
            </main>

            <Footer siteSettings={siteSettings} />
        </div>
    );
}