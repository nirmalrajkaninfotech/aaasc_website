import IQACSection from '@/components/IQACSection';

async function getIQACData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/iqac`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function IQACPage() {
  const iqacData = await getIQACData();
  return <IQACSection iqacData={iqacData} />;
}