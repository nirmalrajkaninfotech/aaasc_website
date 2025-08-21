import IQACSection from '@/components/IQACSection';
import iqacDataJson from '../../../data/iqac.json';

export default function IQACPage() {
  const iqacData = iqacDataJson;
  return <IQACSection iqacData={iqacData} />;
}