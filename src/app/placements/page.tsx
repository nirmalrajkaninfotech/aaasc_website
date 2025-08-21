import PlacementSection from '@/components/PlacementSection';
import fs from 'fs';
import path from 'path';

async function getPlacements() {
  const filePath = path.join(process.cwd(), 'data', 'placements.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading placements data:', error);
    return null;
  }
}

export default async function PlacementsPage() {
  const placements = await getPlacements();
  return <PlacementSection placements={placements} />;
}
