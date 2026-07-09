import IQACSection from '@/components/IQACSection';
import { readIQACData } from '@/lib/data';

async function getIQACData() {
  try {
    return readIQACData();
  } catch {
    return null;
  }
}

export default async function IQACPage() {
  const iqacData = await getIQACData();
  return <IQACSection iqacData={iqacData} />;
}