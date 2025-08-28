import PlacementSection from '@/components/PlacementSection';

async function getPlacements() {
  const res = await fetch('http://serveraasc.veetusaapadu.in/api/placements', { cache: 'force-cache' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PlacementsPage() {
  const placements = await getPlacements();
  return <PlacementSection placements={placements} />;
}
