import PlacementSection from '@/components/PlacementSection';
import placementsData from '../../../data/placements.json';
import { PlacementSection as PlacementSectionType } from '@/types';

export default function PlacementsPage() {
  const placements = placementsData as PlacementSectionType;
  return <PlacementSection placements={placements} />;
}
