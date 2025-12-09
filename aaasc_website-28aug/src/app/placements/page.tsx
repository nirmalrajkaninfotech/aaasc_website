import PlacementSection from '@/components/PlacementSection';
import UpscrollButton from '@/components/UpscrollButton';
import { getPlacements } from '@/lib/api-utils';

export default async function PlacementsPage() {
  let placements = null;
  
  try {
    const placementsData = await getPlacements();
    placements = placementsData;
  } catch (error) {
    console.error('Error fetching placements:', error);
    placements = null;
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <PlacementSection placements={placements} />
      </main>
      <UpscrollButton />
    </div>
  );
}
