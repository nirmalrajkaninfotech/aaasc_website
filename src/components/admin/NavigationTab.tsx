'use client';

import { motion } from 'framer-motion';
import { SiteSettings, NavLink } from '@/types';
import { useState } from 'react';

interface NavigationTabProps {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  saveSiteSettings: (settings: SiteSettings) => Promise<any>;
  saving: boolean;
}

export default function NavigationTab({ siteSettings, setSiteSettings, saveSiteSettings, saving }: NavigationTabProps) {
  const [newNavItem, setNewNavItem] = useState({ label: '', href: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addNavItem = () => {
    if (!newNavItem.label || !newNavItem.href) return;
    
    const updatedNavLinks = [...siteSettings.navLinks, newNavItem];
    const updatedSettings = { ...siteSettings, navLinks: updatedNavLinks };
    setSiteSettings(updatedSettings);
    setNewNavItem({ label: '', href: '' });
  };

  const updateNavItem = (index: number, updatedItem: NavLink) => {
    const updatedNavLinks = [...siteSettings.navLinks];
    updatedNavLinks[index] = updatedItem;
    const updatedSettings = { ...siteSettings, navLinks: updatedNavLinks };
    setSiteSettings(updatedSettings);
    setEditingIndex(null);
  };

  const removeNavItem = (index: number) => {
    const updatedNavLinks = siteSettings.navLinks.filter((_, i) => i !== index);
    const updatedSettings = { ...siteSettings, navLinks: updatedNavLinks };
    setSiteSettings(updatedSettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Navigation Management
        </h2>
        <p className="text-gray-600 text-lg">Manage your website's navigation menu structure</p>
      </div>

      {/* Add New Navigation Item */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-50 rounded-2xl p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Menu Item</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
            <input
              type="text"
              value={newNavItem.label}
              onChange={(e) => setNewNavItem({ ...newNavItem, label: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Menu item label"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL</label>
            <input
              type="text"
              value={newNavItem.href}
              onChange={(e) => setNewNavItem({ ...newNavItem, href: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="/page-url"
            />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addNavItem}
          disabled={!newNavItem.label || !newNavItem.href}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          Add Menu Item
        </motion.button>
      </motion.div>

      {/* Current Navigation Items */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Menu Items</h3>
        {siteSettings.navLinks.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {editingIndex === index ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateNavItem(index, { ...item, label: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL</label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => updateNavItem(index, { ...item, href: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="lg:col-span-2 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingIndex(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{item.label}</h4>
                  <p className="text-sm text-gray-600">{item.href}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingIndex(index)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeNavItem(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            )}
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
          className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Navigation Changes'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
