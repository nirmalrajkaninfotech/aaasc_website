import IQACSection from '@/components/IQACSection';
import UpscrollButton from '@/components/UpscrollButton';

import { getIQAC } from '@/lib/api-utils';

export default async function IQACPage() {
  const iqacData = await getIQAC();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <IQACSection iqacData={iqacData} />
      </main>
      <UpscrollButton />
    </div>
  );
}