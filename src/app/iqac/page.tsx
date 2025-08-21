import IQACSection from '@/components/IQACSection';
import fs from 'fs';
import path from 'path';

async function getIQACData() {
  const filePath = path.join(process.cwd(), 'data', 'iqac.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading IQAC data:', error);
    return null;
  }
}

export default async function IQACPage() {
  const iqacData = await getIQACData();
  return <IQACSection iqacData={iqacData} />;
}