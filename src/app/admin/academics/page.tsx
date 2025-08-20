'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'programs' | 'section' | 'additional'>('programs');
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      const response = await fetch('/api/academics', { cache: 'no-store' });
      const data = await response.json();
      if (data) setAcademic(data);
    } catch (error) {
      console.error('Error fetching academic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAll = async (payload: AcademicSection = academic) => {
    try {
      const response = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save academic data');
      await fetchAcademicData();
      alert('Changes saved successfully');
    } catch (error) {
      console.error('Error saving academic data:', error);
      alert('Failed to save academic data');
    }
  };

  const sortedPrograms = useMemo(() => {
    return [...(academic.programs || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Programs Management</h1>
        <div className="flex gap-2">
          <button onClick={() => saveAll()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save All</button>
          <button onClick={fetchAcademicData} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Reload</button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className={`px-3 py-2 rounded ${activeTab === 'programs' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('programs')}
        >Programs</button>
        <button
          className={`px-3 py-2 rounded ${activeTab === 'section' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('section')}
        >Section</button>
        <button
          className={`px-3 py-2 rounded ${activeTab === 'additional' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('additional')}
        >Additional Info</button>
      </div>

      {activeTab === 'section' && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={academic.title}
                onChange={(e) => setAcademic({ ...academic, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={academic.subtitle}
                onChange={(e) => setAcademic({ ...academic, subtitle: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveAll()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </div>
      )}

      {activeTab === 'additional' && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info (HTML)</label>
          <RichTextEditor
            value={academic.additionalInfo || ''}
            onChange={(html: string) => setAcademic({ ...academic, additionalInfo: html })}
          />
          <div className="flex gap-2">
            <button onClick={() => saveAll()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Programs</h2>
            <button
              onClick={() => setEditingProgram(createBlankProgram())}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >Add Program</button>
          </div>

          {editingProgram && (
            <ProgramForm
              key={editingProgram.id}
              program={editingProgram}
              onCancel={() => setEditingProgram(null)}
              onSave={async (p) => {
                // compute next programs and persist immediately
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
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Order</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Published</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedPrograms.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => moveProgram(p.id, 'up')} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={idx === 0}>↑</button>
                        <button onClick={() => moveProgram(p.id, 'down')} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={idx === sortedPrograms.length - 1}>↓</button>
                        <input
                          type="number"
                          value={p.order}
                          onChange={(e) => {
                            const order = parseInt(e.target.value || '0', 10);
                            upsertProgram({ ...p, order });
                          }}
                          className="w-20 p-1 border rounded"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">{p.title || <span className="text-gray-400">Untitled</span>}</td>
                    <td className="px-4 py-2 text-sm">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={p.published}
                          onChange={(e) => upsertProgram({ ...p, published: e.target.checked })}
                        />
                        <span>{p.published ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProgram(p)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                        <button onClick={() => { if (confirm('Delete this program?')) deleteProgram(p.id); }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button onClick={() => saveAll()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
          </div>
        </div>
      )}
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

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <input
            type="text"
            placeholder="e.g., Undergraduate, Postgraduate, Certificate"
            value={draft.section || ''}
            onChange={(e) => setDraft({ ...draft, section: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Published</label>
          <select
            value={draft.published ? '1' : '0'}
            onChange={(e) => setDraft({ ...draft, published: e.target.value === '1' })}
            className="w-full p-2 border rounded"
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="w-full p-2 border rounded min-h-[80px]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
          <RichTextEditor
            value={draft.content || ''}
            onChange={(html: string) => setDraft({ ...draft, content: html })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input
            type="text"
            value={draft.duration}
            onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
          <input
            type="text"
            value={draft.eligibility}
            onChange={(e) => setDraft({ ...draft, eligibility: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus (plain text)</label>
          <textarea
            value={draft.syllabus}
            onChange={(e) => setDraft({ ...draft, syllabus: e.target.value })}
            className="w-full p-2 border rounded min-h-[120px] whitespace-pre"
          />
        </div>
        <div className="md:col-span-2">
          <ImageUpload
            value={draft.image || ''}
            onChange={(url) => setDraft({ ...draft, image: url })}
            label="Program Image"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Career Prospects</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newProspect}
            onChange={(e) => setNewProspect(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Add a prospect"
          />
          <button
            onClick={() => {
              if (!newProspect.trim()) return;
              setDraft({ ...draft, careerProspects: [...draft.careerProspects, newProspect.trim()] });
              setNewProspect('');
            }}
            className="px-3 py-2 bg-gray-200 rounded"
          >Add</button>
        </div>
        {draft.careerProspects.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {draft.careerProspects.map((c, i) => (
              <li key={`${c}-${i}`} className="flex items-center justify-between">
                <span>{c}</span>
                <button
                  onClick={() => setDraft({ ...draft, careerProspects: draft.careerProspects.filter((_, idx) => idx !== i) })}
                  className="text-red-600 text-xs"
                >Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(draft)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >Save Program</button>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
      </div>
    </div>
  );
}
