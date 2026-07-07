import PlacementSection from '@/components/PlacementSection';
import { fetchApi } from '@/lib/api';

async function getPlacements() {
  try {
    return await fetchApi('/api/placements', { cache: 'no-store' });
  } catch {
    return null;
  }
}

export default async function PlacementsPage() {
  const placements = await getPlacements();
  return <PlacementSection placements={placements} />;
}
