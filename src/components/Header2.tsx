'use client';

import Image from 'next/image';
import { Header2 as Header2Type } from '@/types';

interface Header2Props {
  header2Data?: Header2Type;
}

export default function Header2({ header2Data }: Header2Props) {
  if (!header2Data || !header2Data.published) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Image and Text */}
          <div className="flex items-center space-x-4">
            {header2Data.image && (
              <div className="relative w-12 h-12">
                <Image
                  src={header2Data.image}
                  alt={header2Data.title || 'College Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              {header2Data.title && (
                <h2 className="text-lg font-bold">{header2Data.title}</h2>
              )}
              {header2Data.subtitle && (
                <p className="text-sm opacity-90">{header2Data.subtitle}</p>
              )}
              {header2Data.description && (
                <p className="text-xs opacity-75">{header2Data.description}</p>
              )}
            </div>
          </div>

          {/* Right side - Contact and Notice */}
          <div className="text-right">
            {header2Data.noticeText && (
              <div className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-semibold mb-1">
                {header2Data.noticeText}
              </div>
            )}
            <div className="text-sm">
              {header2Data.contactPhone && (
                <span className="mr-4">📞 {header2Data.contactPhone}</span>
              )}
              {header2Data.contactEmail && (
                <span>✉️ {header2Data.contactEmail}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}