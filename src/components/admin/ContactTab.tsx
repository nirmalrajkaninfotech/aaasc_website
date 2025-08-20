'use client';

import { motion } from 'framer-motion';
import { SiteSettings } from '@/types';

interface ContactTabProps {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  saveSiteSettings: (settings: SiteSettings) => Promise<any>;
  saving: boolean;
}

export default function ContactTab({ siteSettings, setSiteSettings, saveSiteSettings, saving }: ContactTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Contact Information
        </h2>
        <p className="text-gray-600 text-lg">Update your contact details and office hours</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <textarea
              value={siteSettings.contact.address}
              onChange={(e) => setSiteSettings({ ...siteSettings, contact: { ...siteSettings.contact, address: e.target.value } })}
              rows={3}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={siteSettings.contact.phone}
              onChange={(e) => setSiteSettings({ ...siteSettings, contact: { ...siteSettings.contact, phone: e.target.value } })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={siteSettings.contact.email}
              onChange={(e) => setSiteSettings({ ...siteSettings, contact: { ...siteSettings.contact, email: e.target.value } })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Office Hours</label>
            <textarea
              value={siteSettings.contact.officeHours}
              onChange={(e) => setSiteSettings({ ...siteSettings, contact: { ...siteSettings.contact, officeHours: e.target.value } })}
              rows={3}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </motion.div>
      </div>
      
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
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Contact Info'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
