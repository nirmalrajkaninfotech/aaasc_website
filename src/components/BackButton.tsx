'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 text-base"
    >
      ← Back to Gallery
    </button>
  );
}
