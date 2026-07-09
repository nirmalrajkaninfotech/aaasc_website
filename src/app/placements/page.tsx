import PlacementSection from '@/components/PlacementSection';
import { readPlacements } from '@/lib/data';

async function getPlacements() {
  try {
    return readPlacements();
  } catch {
    return null;
  }
}

export default async function PlacementsPage() {
  const placements = await getPlacements();
  return <PlacementSection placements={placements} />;
}
