import IQACSection from '@/components/IQACSection';
import { getIqacData } from '@/lib/data';

function getIQACData() {
  return getIqacData();
}

export default function IQACPage() {
  const iqacData = getIQACData();
  return <IQACSection iqacData={iqacData} />;
}