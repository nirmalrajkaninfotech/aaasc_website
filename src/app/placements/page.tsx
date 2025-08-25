import PlacementSection from '@/components/PlacementSection';
import { getPlacementsData } from '@/lib/data';

function getPlacements() {
  return getPlacementsData();
}

export default function PlacementsPage() {
  const placements = getPlacements();
  return <PlacementSection placements={placements} />;
}
