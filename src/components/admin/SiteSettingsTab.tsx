'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SiteSettings } from '@/types';

interface SiteSettingsTabProps {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  saveSiteSettings: (settings: SiteSettings) => Promise<any>;
  saving: boolean;
}

const PRESET_COLORS = [
  { label: 'Navy', value: '#1e293b' },
  { label: 'Indigo', value: '#4338ca' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Orange', value: '#ea580c' },
];

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generateShades(hex: string): Record<string, string> {
  const { h, s } = hexToHsl(hex);
  const shades: Record<string, string> = {};
  const lightnesses: Record<string, number> = {
    50: 97, 100: 94, 200: 86, 300: 74, 400: 62,
    500: 50, 600: 42, 700: 34, 800: 26, 900: 18, 950: 12,
  };
  for (const [step, l] of Object.entries(lightnesses)) {
    shades[step] = `hsl(${h}, ${s}%, ${l}%)`;
  }
  return shades;
}

export default function SiteSettingsTab({ siteSettings, setSiteSettings, saveSiteSettings, saving }: SiteSettingsTabProps) {
  const currentColor = siteSettings.themeColor || '#1e293b';
  const [customColor, setCustomColor] = useState(currentColor);

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    setSiteSettings({ ...siteSettings, themeColor: color });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Site Settings
        </h2>
        <p className="text-gray-600 text-lg">Configure your website's basic information and appearance</p>
      </div>

      {/* Theme Color Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Theme Color</h3>
        <p className="text-sm text-gray-500 mb-4">Choose the primary color for your entire website</p>

        {/* Preset Colors */}
        <div className="flex flex-wrap gap-3 mb-4">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleColorChange(preset.value)}
              className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
                customColor.toLowerCase() === preset.value.toLowerCase()
                  ? 'bg-white shadow-lg ring-2 ring-offset-2'
                  : 'hover:bg-white/60 hover:shadow-md'
              }`}
              style={{
                ringColor: preset.value,
                ...(customColor.toLowerCase() === preset.value.toLowerCase() ? { '--tw-ring-color': preset.value } as React.CSSProperties : {})
              }}
            >
              <div
                className="w-10 h-10 rounded-full shadow-inner transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: preset.value }}
              />
              <span className="text-xs font-medium text-gray-600">{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Color Picker */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-gray-400 transition-colors"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Color</label>
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    handleColorChange(e.target.value);
                  }
                  setCustomColor(e.target.value);
                }}
                onBlur={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    handleColorChange(e.target.value);
                  }
                }}
                className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#1e293b"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="ml-auto">
            <span className="text-xs text-gray-500 mb-1 block">Preview</span>
            <div className="flex gap-2">
              <div className="w-16 h-8 rounded-lg shadow-inner flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: customColor }}>
                Primary
              </div>
              <div className="w-16 h-8 rounded-lg shadow-inner flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: customColor, opacity: 0.8 }}>
                Hover
              </div>
            </div>
          </div>
        </div>

        {/* Shade Preview */}
        <div className="mt-4">
          <span className="text-xs text-gray-500 mb-1 block">Generated Shades</span>
          <div className="flex gap-1 rounded-lg overflow-hidden">
            {Object.entries(generateShades(customColor)).map(([shade, color]) => (
              <div
                key={shade}
                className="flex-1 h-6 flex items-center justify-center text-white text-[9px] font-medium"
                style={{ backgroundColor: color }}
                title={`${shade}: ${color}`}
              >
                {shade}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Site Title</label>
            <input
              type="text"
              value={siteSettings.siteTitle}
              onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Logo URL</label>
            <input
              type="text"
              value={siteSettings.logo}
              onChange={(e) => setSiteSettings({ ...siteSettings, logo: e.target.value })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label>
            <input
              type="text"
              value={siteSettings.hero.title}
              onChange={(e) => setSiteSettings({ ...siteSettings, hero: { ...siteSettings.hero, title: e.target.value } })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={siteSettings.hero.subtitle}
              onChange={(e) => setSiteSettings({ ...siteSettings, hero: { ...siteSettings.hero, subtitle: e.target.value } })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => saveSiteSettings(siteSettings)}
          disabled={saving}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
