import IQACSection from '@/components/IQACSection';
import { fetchApi } from '@/lib/api';

async function getIQACData() {
  try {
    return await fetchApi('/api/iqac', { cache: 'no-store' });
  } catch {
    return null;
  }
}

export default async function IQACPage() {
  const iqacData = await getIQACData();
  return <IQACSection iqacData={iqacData} />;
}