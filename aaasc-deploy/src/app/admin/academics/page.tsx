'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicProgram, AcademicSection } from '@/types';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

export default function AcademicsAdmin() {
  const [academic, setAcademic] = useState<AcademicSection>({
    title: 'Academic Programs',
    subtitle: 'Explore our diverse range of academic programs',
    programs: [],
    additionalInfo: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'programs'>('programs');
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/academics', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data) setAcademic(data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching academic data:', error);
      showNotification('Failed to load academic data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAll = async (payload: AcademicSection = academic) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save academic data');
      await fetchAcademicData();
      showNotification('Changes saved successfully', 'success');
    } catch (error) {
      console.error('Error saving academic data:', error);
      showNotification('Failed to save academic data', 'error');
    } finally {
      setIsSaving(false);
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

  const sortedPrograms = useMemo(() => {
    return [...(academic.programs || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [academic.programs]);

  const filteredPrograms = useMemo(() => {
    return sortedPrograms.filter(program => {
      const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection = filterSection === 'all' || program.section === filterSection;
      return matchesSearch && matchesSection;
    });
  }, [sortedPrograms, searchTerm, filterSection]);

  const availableSections = useMemo(() => {
    const sections = new Set(academic.programs.map(p => p.section).filter(Boolean));
    return Array.from(sections);
  }, [academic.programs]);

  const createBlankProgram = (): AcademicProgram => ({
    id: `prog_${Date.now()}`,
    title: '',
    section: '',
    description: '',
    content: '',
    duration: '',
    eligibility: '',
    syllabus: '',
    careerProspects: [],
    image: '',
    order: (academic.programs?.length || 0) + 1,
    published: true,
  });

  const upsertProgram = (program: AcademicProgram) => {
    const exists = academic.programs.findIndex(p => p.id === program.id);
    let nextPrograms: AcademicProgram[];
    if (exists >= 0) {
      nextPrograms = academic.programs.map(p => (p.id === program.id ? program : p));
    } else {
      nextPrograms = [...academic.programs, program];
    }
    setAcademic({ ...academic, programs: nextPrograms });
  };

  const deleteProgram = (id: string) => {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) return;
    const nextPrograms = academic.programs.filter(p => p.id !== id);
    setAcademic({ ...academic, programs: nextPrograms });
  };

  const moveProgram = (id: string, direction: 'up' | 'down') => {
    const programs = sortedPrograms;
    const idx = programs.findIndex(p => p.id === id);
    if (idx < 0) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= programs.length) return;
    const reordered = [...programs];
    [reordered[idx].order, reordered[swapWith].order] = [reordered[swapWith].order, reordered[idx].order];
    setAcademic({ ...academic, programs: reordered });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Academic Programs Management
              </h1>
              <p className="text-gray-600 text-lg">Manage your institution's academic programs and content</p>
            </div>
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAcademicData} 
                disabled={isLoading}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200 disabled:opacity-50"
              >
                <RefreshIcon />
                Reload
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveAll()} 
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <LoadingIcon /> : <SaveIcon />}
                {isSaving ? 'Saving...' : 'Save All'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 inline-flex gap-2 mb-8"
        >
          <div className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg flex items-center gap-2">
            <span>📚</span>
            <span>Programs</span>
          </div>
        </motion.div>

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Programs Header */}
              <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Programs Management</h2>
                    <p className="text-gray-600">Add, edit, and organize your academic programs</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingProgram(createBlankProgram())}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <PlusIcon />
                    Add Program
                  </motion.button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col lg:flex-row gap-4 mt-6">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search programs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Sections</option>
                    {availableSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Program Form */}
              <AnimatePresence>
                {editingProgram && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-gray-100"
                  >
                    <ProgramForm
                      key={editingProgram.id}
                      program={editingProgram}
                      onCancel={() => setEditingProgram(null)}
                      onSave={async (p) => {
                        const exists = academic.programs.findIndex(x => x.id === p.id);
                        const nextPrograms = exists >= 0
                          ? academic.programs.map(x => (x.id === p.id ? p : x))
                          : [...academic.programs, p];
                        const nextPayload: AcademicSection = { ...academic, programs: nextPrograms };
                        setAcademic(nextPayload);
                        await saveAll(nextPayload);
                        setEditingProgram(null);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Programs Table */}
              <div className="p-8">
                {filteredPrograms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No programs found</h3>
                    <p className="text-gray-500">
                      {searchTerm || filterSection !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Start by adding your first academic program'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Program</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Section</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <AnimatePresence>
                          {filteredPrograms.map((p, idx) => (
                            <motion.tr 
                              key={p.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => moveProgram(p.id, 'up')} 
                                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors" 
                                    disabled={idx === 0}
                                  >
                                    <ChevronUpIcon />
                                  </button>
                                  <button 
                                    onClick={() => moveProgram(p.id, 'down')} 
                                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors" 
                                    disabled={idx === filteredPrograms.length - 1}
                                  >
                                    <ChevronDownIcon />
                                  </button>
                                  <input
                                    type="number"
                                    value={p.order}
                                    onChange={(e) => {
                                      const order = parseInt(e.target.value || '0', 10);
                                      upsertProgram({ ...p, order });
                                    }}
                                    className="w-16 p-1 text-center border border-gray-200 rounded"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  {p.image && (
                                    <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {p.title || <span className="text-gray-400 italic">Untitled Program</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 line-clamp-2">
                                      {p.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {p.section || 'No Section'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={p.published}
                                    onChange={(e) => upsertProgram({ ...p, published: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                  />
                                  <span className="ml-2 text-sm text-gray-600">
                                    {p.published ? 'Published' : 'Draft'}
                                  </span>
                                </label>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex gap-2">
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setEditingProgram(p)} 
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Program"
                                  >
                                    <EditIcon />
                                  </motion.button>
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteProgram(p.id)} 
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Program"
                                  >
                                    <TrashIcon />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Removed Section Info and Additional Info tabs */}
      </div>
    </div>
  );
}

function ProgramForm({ program, onSave, onCancel }: {
  program: AcademicProgram;
  onSave: (program: AcademicProgram) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<AcademicProgram>(program);
  const [newProspect, setNewProspect] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!draft.title.trim()) {
      alert('Please enter a program title');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {program.id.startsWith('prog_') && program.title === '' ? 'Add New Program' : 'Edit Program'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program Title *</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter program title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <input
              type="text"
              placeholder="e.g., Undergraduate, Postgraduate, Certificate"
              value={draft.section || ''}
              onChange={(e) => setDraft({ ...draft, section: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              value={draft.duration}
              onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 4 years, 2 years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility</label>
            <input
              type="text"
              value={draft.eligibility}
              onChange={(e) => setDraft({ ...draft, eligibility: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 12th Pass, Graduate"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Brief description of the program"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Content</label>
          <RichTextEditor
            value={draft.content || ''}
            onChange={(html: string) => setDraft({ ...draft, content: html })}
          />
        </div>

        {/* Syllabus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus</label>
          <textarea
            value={draft.syllabus}
            onChange={(e) => setDraft({ ...draft, syllabus: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            rows={6}
            placeholder="Enter syllabus details..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <ImageUpload
            value={draft.image || ''}
            onChange={(url) => setDraft({ ...draft, image: url })}
            label="Program Image"
          />
        </div>

        {/* Career Prospects */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Career Prospects</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newProspect}
              onChange={(e) => setNewProspect(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a career prospect"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (!newProspect.trim()) return;
                  setDraft({ ...draft, careerProspects: [...draft.careerProspects, newProspect.trim()] });
                  setNewProspect('');
                }
              }}
            />
            <button
              onClick={() => {
                if (!newProspect.trim()) return;
                setDraft({ ...draft, careerProspects: [...draft.careerProspects, newProspect.trim()] });
                setNewProspect('');
              }}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
            >
              Add
            </button>
          </div>
          {draft.careerProspects.length > 0 && (
            <div className="space-y-2">
              {draft.careerProspects.map((prospect, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
                >
                  <span className="text-gray-700">{prospect}</span>
                  <button
                    onClick={() => setDraft({ 
                      ...draft, 
                      careerProspects: draft.careerProspects.filter((_, idx) => idx !== i) 
                    })}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Published Status */}
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Publish this program
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <LoadingIcon /> : <SaveIcon />}
            {isSaving ? 'Saving...' : 'Save Program'}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel} 
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200"
          >
            Cancel
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Icon Components
function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LoadingIcon() {
  return (
    <motion.svg
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3"/>
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </motion.svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="18,15 12,9 6,15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
