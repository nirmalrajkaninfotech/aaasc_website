import PlacementSection from '@/components/PlacementSection';
import UpscrollButton from '@/components/UpscrollButton';

async function getPlacements() {
  const res = await fetch('http://localhost:3000/api/placements', { cache: 'force-cache' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PlacementsPage() {
  const placements = await getPlacements();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <PlacementSection placements={placements} />
      </main>
      <UpscrollButton />
    </div>
  );
}
