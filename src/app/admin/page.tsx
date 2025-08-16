'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';
import SortableSection from '@/components/SortableSection';
import { Collage, SiteSettings, RichTextContent, HomepageSection } from '@/types';

export default function AdminPage() {
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [collages, setCollages] = useState<Collage[]>([]);
    const [activeTab, setActiveTab] = useState<'collages' | 'site' | 'contact' | 'placements' | 'achievements' | 'homepage' | 'others'>('collages');
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

                            {/* Others Links */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Others Links
                                </label>
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
                        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={siteSettings.contact?.address || ''}
                                    onChange={(e) => setSiteSettings({
                                        ...siteSettings,
                                        contact: { ...siteSettings.contact, address: e.target.value }
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="123 University Avenue&#10;College Town, ST 12345"
                                />
                                <p className="text-xs text-gray-500 mt-1">Use line breaks for multi-line addresses</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={siteSettings.contact?.phone || ''}
                                    onChange={(e) => setSiteSettings({
                                        ...siteSettings,
                                        contact: { ...siteSettings.contact, phone: e.target.value }
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="(555) 123-4567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={siteSettings.contact?.email || ''}
                                    onChange={(e) => setSiteSettings({
                                        ...siteSettings,
                                        contact: { ...siteSettings.contact, email: e.target.value }
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="info@university.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Office Hours
                                </label>
                                <textarea
                                    value={siteSettings.contact?.officeHours || ''}
                                    onChange={(e) => setSiteSettings({
                                        ...siteSettings,
                                        contact: { ...siteSettings.contact, officeHours: e.target.value }
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="Monday - Friday: 9:00 AM - 5:00 PM&#10;Saturday: 10:00 AM - 2:00 PM"
                                />
                                <p className="text-xs text-gray-500 mt-1">Use line breaks for multi-line hours</p>
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
                                    ?.map((section, index) => (
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
                                            .map(section => (
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
            </main>

            <Footer siteSettings={siteSettings} />
        </div>
    );
}