import { API_BASE_URL } from '@/config';
import { ExamCellSection } from '@/types';
import { ChevronRight, Calendar, FileText, Users, Clock, Award } from 'lucide-react';

async function getExamCell(): Promise<ExamCellSection> {
  const res = await fetch(`${API_BASE_URL}/api/site`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site settings');
  const data = await res.json();
  return data.examCell;
}

export default async function ExamCellPage() {
  const examCell = await getExamCell();

  const examFeatures = [
    {
      icon: Calendar,
      title: "Exam Schedule",
      description: "Comprehensive timetable for all examinations"
    },
    {
      icon: FileText,
      title: "Exam Forms",
      description: "Online application and registration portal"
    },
    {
      icon: Users,
      title: "Student Support",
      description: "Dedicated assistance for exam-related queries"
    },
    {
      icon: Clock,
      title: "Timely Updates",
      description: "Real-time notifications and announcements"
    },
    {
      icon: Award,
      title: "Results & Certificates",
      description: "Quick access to results and documentation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      {examCell.showHero && (
        <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
              {examCell.title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {examCell.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                {examCell.heroButtonText || "View Schedule"}
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
                Contact Us
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {examCell.showFeatures && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Services
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive examination management system designed for student success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {examFeatures.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Section - Always shown */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: examCell.content }} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      {examCell.showQuickLinks && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                Quick Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="#" className="group bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">Exam Schedule</h3>
                      <p className="text-sm text-gray-600">View upcoming examinations</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
                
                <a href="#" className="group bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600">Results Portal</h3>
                      <p className="text-sm text-gray-600">Check your examination results</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
                
                <a href="#" className="group bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600">Forms & Downloads</h3>
                      <p className="text-sm text-gray-600">Access exam-related forms</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
                
                <a href="#" className="group bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600">Contact Support</h3>
                      <p className="text-sm text-gray-600">Get help with exam queries</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      {examCell.showCTA && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Need Assistance?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our exam cell team is here to help you with any questions or concerns
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
              {examCell.ctaButtonText || "Contact Exam Cell"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
