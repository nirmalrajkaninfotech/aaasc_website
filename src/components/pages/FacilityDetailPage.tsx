'use client';

interface FacilityDetailPageProps {
  id: string;
}

export default function FacilityDetailPage({ id }: FacilityDetailPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Facility Detail</h1>
        <p className="text-gray-600">ID: {id}</p>
        <p className="text-gray-600 mt-2">This page will be implemented with client-side routing.</p>
      </div>
    </div>
  );
}