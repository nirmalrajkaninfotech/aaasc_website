'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { FacultySection as FacultySectionType } from '@/types';

interface FacultySectionProps {
	faculty: FacultySectionType;
}

export default function FacultySection({ faculty }: FacultySectionProps) {
	const items = useMemo(
		() => faculty.items.filter(i => i.published).sort((a, b) => a.order - b.order),
		[faculty.items]
	);

	const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
	const activeItem = useMemo(() => items.find(i => i.id === activeId), [items, activeId]);

	if (items.length === 0) return null;

	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-gray-800 mb-4">{faculty.title}</h2>
					<p className="text-xl text-gray-600">Explore departments and staff information</p>
				</div>

				{/* Department chips */}
				<div className="relative z-10 flex flex-wrap justify-center gap-4 mb-10 pointer-events-auto">
					{items.map(item => (
						<button
							type="button"
							key={item.id}
							onClick={() => setActiveId(item.id)}
							className={`px-6 py-2 rounded-full transition-all duration-200 ${
								activeId === item.id
									? 'bg-blue-600 text-white shadow-lg'
									: 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-50 shadow-sm hover:shadow-md'
							}`}
						>
							{item.title}
						</button>
					))}
				</div>


				{/* Detail view for selected item */}
				{activeItem && (
					<div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row items-stretch">
						{/* Subtitle on the left */}
						<div className="md:w-1/3 flex flex-col justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100">
							{activeItem.subtitle && <div className="text-lg font-semibold text-blue-700 mb-2">{activeItem.subtitle}</div>}
							<h3 className="text-xl font-bold text-gray-800 mb-3">{activeItem.title}</h3>
							<div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: activeItem.content }} />
						</div>
						{/* Images with captions on the right */}
						<div className="md:w-2/3 flex flex-wrap gap-4 p-6 items-center justify-center">
							{(activeItem.images && activeItem.images.length > 0 ? activeItem.images : activeItem.image ? [{ url: activeItem.image }] : []).map((img, idx) => (
								<div key={idx} className="flex flex-col items-center">
									<div className="relative w-32 h-32 mb-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
										<Image src={img.url} alt={activeItem.title} fill className="object-contain rounded" />
									</div>
									{img.caption && <div className="text-xs text-gray-700 font-medium text-center">{img.caption}</div>}
									{img.subtitle && <div className="text-xs text-gray-500 text-center">{img.subtitle}</div>}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}


