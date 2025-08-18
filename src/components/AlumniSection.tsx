import Image from 'next/image';
import { AlumniAssociation } from '@/types';

export default function AlumniSection({ alumni }: { alumni: AlumniAssociation }) {
  if (!alumni) return <div className="p-8 text-center">No alumni data found.</div>;
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">{alumni.title}</h2>
        {alumni.image && (
          <div className="relative h-64 w-full mb-8">
            <Image src={alumni.image} alt={alumni.title} fill className="object-cover rounded-lg" />
          </div>
        )}
        <div className="prose max-w-none text-gray-700 mb-8" dangerouslySetInnerHTML={{ __html: alumni.content }} />
        {alumni.members && alumni.members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {alumni.members.map((member, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                {member.image && <Image src={member.image} alt={member.name} width={80} height={80} className="rounded-full mb-2" />}
                <h4 className="text-lg font-semibold">{member.name}</h4>
                <div className="text-sm text-gray-500 mb-2">{member.year}</div>
                {member.description && <div className="text-gray-700">{member.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
