import IQACSection from '@/components/IQACSection';

import { getIQAC } from '@/lib/api-utils';

export default async function IQACPage() {
  const iqacData = await getIQAC();
  return <IQACSection iqacData={iqacData} />;
}