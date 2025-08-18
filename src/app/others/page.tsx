import { API_BASE_URL } from '@/config';
import { OthersSection } from '@/types';

async function getOthers(): Promise<OthersSection> {
  const res = await fetch(`${API_BASE_URL}/api/site`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site settings');
  const data = await res.json();
  return data.others;
}

export default async function OthersPage() {
  const others = await getOthers();
  return (
    <div className="container mx-auto py-8 space-y-12">
      {/* AISHE Section */}
      <section>
        <h1 className="text-3xl font-bold mb-2">{others.aishe.title}</h1>
        <h2 className="text-xl text-gray-600 mb-4">{others.aishe.subtitle}</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: others.aishe.content }} />
      </section>
      {/* Academic Coordinator Section */}
      <section>
        <h1 className="text-3xl font-bold mb-2">{others.academicCoordinator.title}</h1>
        <h2 className="text-xl text-gray-600 mb-4">{others.academicCoordinator.subtitle}</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: others.academicCoordinator.content }} />
      </section>
    </div>
  );
}
