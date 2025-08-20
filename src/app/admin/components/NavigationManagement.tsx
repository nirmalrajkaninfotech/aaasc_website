import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableNavItem } from '@/components/SortableNavItem';

interface NavigationItem {
  label: string;
  href: string;
}

interface NavigationManagementProps {
  siteSettings: any;
  setSiteSettings: (settings: any) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
}

export const NavigationManagement: React.FC<NavigationManagementProps> = ({
  siteSettings,
  setSiteSettings,
  saving,
  setSaving
}) => {
  const [newNavItem, setNewNavItem] = useState<NavigationItem>({ label: '', href: '' });
  const [editingNavItem, setEditingNavItem] = useState<{ index: number; item: NavigationItem } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveSiteSettings = async (updatedSettings: any) => {
    try {
      setSaving(true);
      const response = await fetch('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) throw new Error('Failed to save navigation changes');
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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && siteSettings) {
      const oldIndex = siteSettings.navLinks.findIndex((item: NavigationItem) => item.label === active.id);
      const newIndex = siteSettings.navLinks.findIndex((item: NavigationItem) => item.label === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newNavLinks = arrayMove([...siteSettings.navLinks], oldIndex, newIndex);
        const updatedSettings = { ...siteSettings, navLinks: newNavLinks };
        const savedSettings = await saveSiteSettings(updatedSettings);
        if (savedSettings) setSiteSettings(savedSettings);
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
      const updatedSettings = { ...siteSettings, navLinks: updatedNavLinks };
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
      
      const updatedSettings = { ...siteSettings, navLinks: updatedNavLinks };
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

  return (
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
                items={siteSettings.navLinks.map((item: NavigationItem) => item.label)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {siteSettings.navLinks.map((item: NavigationItem, index: number) => (
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
  );
};
