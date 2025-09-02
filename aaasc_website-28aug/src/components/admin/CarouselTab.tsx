'use client';

import { motion } from 'framer-motion';
import { SiteSettings, CarouselItem } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import { useState } from 'react';

interface CarouselTabProps {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  saveSiteSettings: (settings: SiteSettings) => Promise<any>;
  saving: boolean;
}

export default function CarouselTab({ siteSettings, setSiteSettings, saveSiteSettings, saving }: CarouselTabProps) {
  const [newCarousel, setNewCarousel] = useState<Partial<CarouselItem>>({
    image: '',
    title: '',
    description: '',
    published: true
  });

  const addCarouselItem = () => {
    if (!newCarousel.image) return;
    
    const carouselItem: CarouselItem = {
      id: `carousel-${Date.now()}`,
      image: newCarousel.image,
      title: newCarousel.title || '',
      description: newCarousel.description || '',
      order: (siteSettings.carousel.items.length || 0) + 1,
      published: newCarousel.published || true
    };

    const updatedSettings = {
      ...siteSettings,
      carousel: {
        ...siteSettings.carousel,
        items: [...siteSettings.carousel.items, carouselItem]
      }
    };

    setSiteSettings(updatedSettings);
    setNewCarousel({ image: '', title: '', description: '', published: true });
  };

  const removeCarouselItem = (id: string) => {
    const updatedItems = siteSettings.carousel.items.filter(item => item.id !== id);
    const updatedSettings = {
      ...siteSettings,
      carousel: { ...siteSettings.carousel, items: updatedItems }
    };
    setSiteSettings(updatedSettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
          Carousel Management
        </h2>
        <p className="text-gray-600 text-lg">Manage your homepage carousel slides and images</p>
      </div>

      {/* Add New Carousel Item */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-50 rounded-2xl p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Slide</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
            <ImageUpload
              value={newCarousel.image}
              onChange={(url) => setNewCarousel({ ...newCarousel, image: url })}
              className="w-full"
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newCarousel.title}
                onChange={(e) => setNewCarousel({ ...newCarousel, title: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                placeholder="Slide title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={newCarousel.description}
                onChange={(e) => setNewCarousel({ ...newCarousel, description: e.target.value })}
                rows={2}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                placeholder="Slide description"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addCarouselItem}
              disabled={!newCarousel.image}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              Add Slide
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Existing Carousel Items */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Slides</h3>
        {siteSettings.carousel.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{item.title || 'Untitled'}</h4>
                <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                <p className="text-xs text-gray-500">Order: {item.order}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeCarouselItem(item.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Remove
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => saveSiteSettings(siteSettings)}
          disabled={saving}
          className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Carousel Changes'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
