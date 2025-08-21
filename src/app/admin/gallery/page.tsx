'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaSave, FaTimes, FaImage } from 'react-icons/fa';
import { Collage } from '@/types';

export default function GalleryAdmin() {
  const [collages, setCollages] = useState<Collage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCollage, setEditingCollage] = useState<Collage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Collage>>({
    title: '',
    description: '',
    category: '',
    images: [],
    featured: false,
    tags: [],
    date: new Date().toISOString().split('T')[0]
  });

  const [deleteImageLoading, setDeleteImageLoading] = useState(false);

  useEffect(() => {
    fetchCollages();
  }, []);

  const fetchCollages = async () => {
    try {
      const res = await fetch('/api/collages');
      if (res.ok) {
        const data = await res.json();
        setCollages(data);
      }
    } catch (error) {
      console.error('Failed to fetch collages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const uploadedImages: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          uploadedImages.push(url);
        } else {
          throw new Error('Upload failed');
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedImages]
      }));

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCollage 
        ? `/api/collages/${editingCollage.id}`
        : '/api/collages';
      
      const method = editingCollage ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        resetForm();
        fetchCollages();
      } else {
        throw new Error('Failed to save collage');
      }
    } catch (error) {
      console.error('Error saving collage:', error);
      alert('Failed to save collage. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this collage?')) return;
    
    try {
      const res = await fetch(`/api/collages/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCollages();
      } else {
        throw new Error('Failed to delete collage');
      }
    } catch (error) {
      console.error('Error deleting collage:', error);
      alert('Failed to delete collage. Please try again.');
    }
  };

  const handleEdit = (collage: Collage) => {
    setEditingCollage(collage);
    setFormData({
      id: collage.id,
      title: collage.title,
      description: collage.description || '',
      category: collage.category,
      images: collage.images,
      featured: collage.featured || false,
      tags: collage.tags || [],
      date: collage.date || new Date().toISOString().split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      images: [],
      featured: false,
      tags: [],
      date: new Date().toISOString().split('T')[0]
    });
    setEditingCollage(null);
    setPreviewImage(null);
  };

  const removeImage = async (index: number) => {
    if (!editingCollage) return;
    setDeleteImageLoading(true);
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    const updatedFormData = {
      ...formData,
      images: newImages
    };
    setFormData(updatedFormData);
    try {
      const res = await fetch(`/api/collages/${editingCollage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });
      if (!res.ok) throw new Error('Failed to update collage');
      // Optionally update collages list or editingCollage state here
      alert('Image deleted and collage updated successfully.');
    } catch (error) {
      alert('Failed to update collage after deleting image.');
    } finally {
      setDeleteImageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gallery Management</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Back to Site
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingCollage ? 'Edit Collage' : 'Add New Collage'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured Collage
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images *
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                {formData.images?.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-200"
                      onMouseEnter={() => setPreviewImage(image)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 transition-opacity"
                      disabled={deleteImageLoading}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
                
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  {isUploading ? (
                    <span className="text-gray-500">Uploading...</span>
                  ) : (
                    <>
                      <FaUpload className="text-gray-400 mb-1" />
                      <span className="text-sm text-gray-500">Add Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </label>
              </div>

              {previewImage && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
                  onClick={() => setPreviewImage(null)}
                >
                  <div className="max-w-4xl max-h-[90vh] overflow-auto">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-w-full max-h-[80vh] object-contain"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !formData.images?.length}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isUploading || !formData.images?.length
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingCollage ? 'Update Collage' : 'Add Collage'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Collages</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {collages.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No collages found. Create your first collage above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Images
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collages.map((collage) => (
                      <tr key={collage.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {collage.images?.[0] ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={collage.images[0]}
                                alt={collage.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaImage className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{collage.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{collage.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {collage.images?.length || 0} images
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            collage.featured 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {collage.featured ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(collage)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => collage.id && handleDelete(collage.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="inline mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
