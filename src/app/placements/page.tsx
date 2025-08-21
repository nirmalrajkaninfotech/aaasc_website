import PlacementSection from '@/components/PlacementSection';

async function getPlacements() {
  const res = await fetch(`/api/placements`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PlacementsPage() {
  const placements = await getPlacements();
  return <PlacementSection placements={placements} />;
}
