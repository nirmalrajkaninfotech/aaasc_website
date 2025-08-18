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

	const [activeSlug, setActiveSlug] = useState<string>(items[0]?.slug ?? '');
	const activeItem = useMemo(() => items.find(i => i.slug === activeSlug), [items, activeSlug]);

	if (items.length === 0) return null;

	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-gray-800 mb-4">{faculty.title}</h2>
					<p className="text-xl text-gray-600">Explore departments and staff information</p>
				</div>

				{/* Department chips */}
				<div className="flex flex-wrap justify-center gap-4 mb-10">
					{items.map(item => (
						<button
							key={item.id}
							onClick={() => setActiveSlug(item.slug)}
							className={`px-6 py-2 rounded-full transition-colors duration-200 ${
								activeSlug === item.slug
									? 'bg-blue-600 text-white shadow'
									: 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-50'
							}`}
						>
							{item.title}
						</button>
					))}
				</div>


				{/* Cards grid like Facilities */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{items.map(item => (
						<div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
							{item.image && (
								<div className="relative h-48">
									<Image src={item.image} alt={item.title} fill className="object-cover" />
								</div>
							)}
							<div className="p-6">
								<h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
								<div className="text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.content }} />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}


