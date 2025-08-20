'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, 
  FaImage, FaSearch, FaFilter, FaEye, 
  FaSort, FaStar, FaBuilding, FaArrowUp,
  FaArrowDown, FaCheck, FaImages
} from 'react-icons/fa';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';

interface Facility {
  id: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  category: string;
  features: string[];
  published: boolean;
  order: number;
}

interface FacilitiesData {
  title: string;
  subtitle: string;
  items: Facility[];
}

export default function Facilities() {
  const [facilities, setFacilities] = useState<FacilitiesData>({ 
    title: 'Facilities', 
    subtitle: '', 
    items: [] 
  });
  const [editingFacilityIndex, setEditingFacilityIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'order' | 'category'>('order');
  
  const [newFacility, setNewFacility] = useState({ 
    id: '', 
    name: '', 
    description: '', 
    image: '', 
    category: '', 
    features: '', 
    published: true, 
    order: 1 
  });
  const [newFacilityImages, setNewFacilityImages] = useState<string[]>([]);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/site');
      if (response.ok) {
        const data = await response.json();
        if (data.facilities) {
          setFacilities(data.facilities);
        }
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      showNotification('Failed to fetch facilities', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // You can implement a proper notification system here
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(`Success: ${message}`);
    }
  };

  const handleSaveFacilities = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilities }),
      });
      if (response.ok) {
        showNotification('Facilities saved successfully!', 'success');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving facilities:', error);
      showNotification('Failed to save facilities', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFacility = () => {
    if (!newFacility.name || !newFacility.category) {
      showNotification('Please fill in required fields (Name and Category)', 'error');
      return;
    }

    const item: Facility = {
      id: crypto.randomUUID(),
      name: newFacility.name,
      description: newFacility.description,
      image: newFacility.image,
      gallery: newFacilityImages,
      category: newFacility.category,
      features: newFacility.features.split(',').map(f=>f.trim()).filter(Boolean),
      published: newFacility.published,
      order: newFacility.order || (facilities.items.length + 1),
    };
    
    setFacilities(prev => ({ ...prev, items: [...(prev.items || []), item] }));
    resetNewFacility();
    setIsAddingNew(false);
    showNotification('Facility added successfully!', 'success');
  };

  const resetNewFacility = () => {
    setNewFacility({ 
      id: '', 
      name: '', 
      description: '', 
      image: '', 
      category: '', 
      features: '', 
      published: true, 
      order: facilities.items.length + 1 
    });
    setNewFacilityImages([]);
  };

  const deleteFacility = (index: number) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    
    setFacilities({ 
      ...facilities, 
      items: facilities.items.filter((_:any, i:number) => i !== index) 
    });
    showNotification('Facility deleted successfully!', 'success');
  };

  const moveFacility = (index: number, direction: 'up' | 'down') => {
    const items = [...facilities.items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex < 0 || swapIndex >= items.length) return;
    
    [items[index].order, items[swapIndex].order] = [items[swapIndex].order, items[index].order];
    setFacilities({ ...facilities, items });
  };

  const filteredAndSortedItems = facilities.items
    ?.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'category': return a.category.localeCompare(b.category);
        case 'order':
        default: return a.order - b.order;
      }
    }) || [];

  const categories = Array.from(new Set(facilities.items?.map(item => item.category) || []));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-white/20 p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white">
              <FaBuilding className="text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Facilities Management
              </h1>
              <p className="text-gray-600 text-lg">Manage your institution's facilities and amenities</p>
            </div>
          </div>

          {/* Section Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Section Title</label>
              <input
                type="text"
                value={facilities.title}
                onChange={(e) => setFacilities({ ...facilities, title: e.target.value })}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter section title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Section Subtitle</label>
              <input
                type="text"
                value={facilities.subtitle}
                onChange={(e) => setFacilities({ ...facilities, subtitle: e.target.value })}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter section subtitle"
              />
            </div>
          </div>
        </motion.div>

        {/* Add New Facility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <span className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
                Add New Facility
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingNew(!isAddingNew)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  isAddingNew 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isAddingNew ? <FaTimes /> : <FaPlus />}
                {isAddingNew ? 'Cancel' : 'Add Facility'}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isAddingNew && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Name *</label>
                    <input
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter facility name"
                      value={newFacility.name}
                      onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Category *</label>
                    <input
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Academic, Sports, Recreation"
                      value={newFacility.category}
                      onChange={(e) => setNewFacility({...newFacility, category: e.target.value})}
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
                    <label className="block text-sm font-semibold text-gray-700">Order</label>
                    <input
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Display order"
                      type="number"
                      value={newFacility.order}
                      onChange={(e) => setNewFacility({...newFacility, order: Number(e.target.value)})}
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Gallery Images</label>
                    <MultiImageUpload
                      onUpload={(urls: string[]) => setNewFacilityImages(prev => [...prev, ...urls])}
                      label="Upload Gallery Images"
                    />
                    {newFacilityImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                        {newFacilityImages.map((img, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group aspect-square"
                          >
                            <img src={img} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                            <button
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                              onClick={() => setNewFacilityImages(prev => prev.filter((_, i) => i !== idx))}
                            >
                              <FaTimes size={12} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                    <RichTextEditor
                      value={newFacility.description}
                      onChange={(content) => setNewFacility(prev => ({ ...prev, description: content }))}
                      placeholder="Enter detailed facility description..."
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Features</label>
                    <input
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter features separated by commas (e.g., Air Conditioned, WiFi, Modern Equipment)"
                      value={newFacility.features}
                      onChange={(e) => setNewFacility({...newFacility, features: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddFacility}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <FaPlus />
                    Add Facility
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-white/20 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[180px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <FaSort className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'order' | 'category')}
                  className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
                >
                  <option value="order">Sort by Order</option>
                  <option value="name">Sort by Name</option>
                  <option value="category">Sort by Category</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Facilities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              Existing Facilities ({filteredAndSortedItems.length})
            </h2>
          </div>

          <div className="p-6">
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No facilities found</h3>
                <p className="text-gray-500">
                  {facilities.items?.length === 0 
                    ? 'Add your first facility using the form above'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredAndSortedItems.map((item, index) => (
                    <FacilityCard
                      key={item.id}
                      facility={item}
                      index={index}
                      originalIndex={facilities.items.findIndex(f => f.id === item.id)}
                      isEditing={editingFacilityIndex === facilities.items.findIndex(f => f.id === item.id)}
                      facilities={facilities}
                      setFacilities={setFacilities}
                      onEdit={(idx) => setEditingFacilityIndex(idx)}
                      onDelete={deleteFacility}
                      onMove={moveFacility}
                      onCancelEdit={() => setEditingFacilityIndex(null)}
                      totalItems={facilities.items.length}
                    />
                  ))}
                </AnimatePresence>
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
            onClick={handleSaveFacilities}
            disabled={isSaving}
            className={`px-12 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-3 ${
              isSaving 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-2xl'
            }`}
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                />
                Saving...
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
    </div>
  );
}

// Facility Card Component
function FacilityCard({
  facility,
  index,
  originalIndex,
  isEditing,
  facilities,
  setFacilities,
  onEdit,
  onDelete,
  onMove,
  onCancelEdit,
  totalItems
}: {
  facility: Facility;
  index: number;
  originalIndex: number;
  isEditing: boolean;
  facilities: FacilitiesData;
  setFacilities: (data: FacilitiesData) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onCancelEdit: () => void;
  totalItems: number;
}) {
  const [editingImages, setEditingImages] = useState<string[]>([]);

  const updateFacility = (field: keyof Facility, value: any) => {
    const copy = { ...facilities };
    (copy.items[originalIndex] as any)[field] = value;
    setFacilities(copy);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isEditing ? 'border-blue-300 shadow-lg bg-blue-50/30' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      {!isEditing ? (
        // View Mode
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Image */}
            <div className="flex-shrink-0">
              {facility.image ? (
                <img 
                  src={facility.image} 
                  alt={facility.name} 
                  className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl shadow-md" 
                />
              ) : (
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{facility.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {facility.category}
                    </span>
                    {facility.published && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <FaCheck size={10} />
                        Published
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FaSort />
                      Order: {facility.order}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaStar />
                      Features: {facility.features.length}
                    </span>
                    {facility.gallery?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FaImages />
                        Gallery: {facility.gallery.length}
                      </span>
                    )}
                  </div>

                  {facility.description && (
                    <div className="text-gray-600 text-sm line-clamp-2" 
                         dangerouslySetInnerHTML={{ __html: facility.description }} />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onMove(originalIndex, 'up')}
                    disabled={originalIndex === 0}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => onMove(originalIndex, 'down')}
                    disabled={originalIndex === totalItems - 1}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    onClick={() => onEdit(originalIndex)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Facility"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(originalIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Facility"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Edit Facility</h3>
            <button
              onClick={onCancelEdit}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Name</label>
              <input
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Facility name"
                value={facility.name}
                onChange={(e) => updateFacility('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <input
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Facility category"
                value={facility.category}
                onChange={(e) => updateFacility('category', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Main Image</label>
              <ImageUpload
                value={facility.image || ''}
                onChange={(url) => updateFacility('image', url)}
                label="Upload Image"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Order</label>
              <input
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Display order"
                type="number"
                value={facility.order}
                onChange={(e) => updateFacility('order', Number(e.target.value))}
              />
            </div>

            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Gallery Images</label>
              <MultiImageUpload
                onUpload={(urls: string[]) => {
                  const current = facility.gallery || [];
                  updateFacility('gallery', [...current, ...urls]);
                }}
                label="Upload Gallery Images"
              />
              {(facility.gallery || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                  {(facility.gallery || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative group aspect-square">
                      <img src={img} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        onClick={() => {
                          const newGallery = (facility.gallery || []).filter((_: any, i: number) => i !== idx);
                          updateFacility('gallery', newGallery);
                        }}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <RichTextEditor
                value={facility.description}
                onChange={(content) => updateFacility('description', content)}
                placeholder="Edit facility description..."
              />
            </div>

            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Features</label>
              <input
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Features (comma separated)"
                value={(facility.features || []).join(', ')}
                onChange={(e) => {
                  const features = e.target.value.split(',').map((f: string) => f.trim()).filter(Boolean);
                  updateFacility('features', features);
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onCancelEdit}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCancelEdit}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <FaCheck />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
