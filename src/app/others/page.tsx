import { OthersSection } from '@/types';
import fs from 'fs';
import path from 'path';

async function getOthers(): Promise<OthersSection> {
  const filePath = path.join(process.cwd(), 'data', 'site.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const siteData = JSON.parse(data);
    return siteData.others;
  } catch (error) {
    console.error('Error reading site settings:', error);
    // Return default values if file reading fails
    return {
      aishe: { title: "AISHE", subtitle: "All India Survey on Higher Education", content: "AISHE content will be displayed here." },
      academicCoordinator: { title: "Academic Coordinator", subtitle: "Academic coordination details", content: "Academic coordinator information will be displayed here." }
    };
  }
}

export default async function OthersPage() {
  let others: OthersSection;
  
  try {
    others = await getOthers();
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Content</h1>
              <p className="text-gray-600">
                We couldn't load the requested information. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Additional Information
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Important institutional information and coordination details
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12">
            {/* AISHE Section */}
            <section 
              aria-labelledby="aishe-heading" 
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="aishe-heading" className="text-2xl font-bold text-white">
                      {others.aishe.title}
                    </h2>
                    <p className="text-blue-100 text-lg">
                      {others.aishe.subtitle}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-8">
                <div 
                  className="prose prose-lg max-w-none prose-blue"
                  dangerouslySetInnerHTML={{ __html: others.aishe.content }}
                />
              </div>
            </section>

            {/* Academic Coordinator Section */}
            <section 
              aria-labelledby="academic-coordinator-heading" 
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="academic-coordinator-heading" className="text-2xl font-bold text-white">
                      {others.academicCoordinator.title}
                    </h2>
                    <p className="text-green-100 text-lg">
                      {others.academicCoordinator.subtitle}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-8">
                <div 
                  className="prose prose-lg max-w-none prose-green"
                  dangerouslySetInnerHTML={{ __html: others.academicCoordinator.content }}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
