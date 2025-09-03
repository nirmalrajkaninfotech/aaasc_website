'use client';

interface FacultyDetailPageProps {
  slug: string;
}

export default function FacultyDetailPage({ slug }: FacultyDetailPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Faculty Detail</h1>
        <p className="text-gray-600">SLUG: {slug}</p>
        <p className="text-gray-600 mt-2">This page will be implemented with client-side routing.</p>
      </div>
    </div>
  );
}