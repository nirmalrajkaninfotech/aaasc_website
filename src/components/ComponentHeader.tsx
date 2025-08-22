'use client';

import { Phone, Mail, Megaphone, FileText, Download } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface AdmissionForm {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  isActive: boolean;
  order: number;
}

const ComponentHeader: React.FC = () => {
  const [admissionForms, setAdmissionForms] = useState<AdmissionForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissionForms();
  }, []);

  const fetchAdmissionForms = async () => {
    try {
      console.log('Fetching admission forms...');
      const response = await fetch('/api/admission-forms');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        // Only show active forms
        const activeForms = data.filter((form: AdmissionForm) => form.isActive);
        console.log('Active forms:', activeForms);
        setAdmissionForms(activeForms);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch admission forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfDownload = (form: AdmissionForm) => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = form.fileUrl;
    link.download = form.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="w-full overflow-hidden">
      {/* Top bar */}
      <div className="bg-blue-600 text-white text-sm flex flex-col sm:flex-row justify-between items-center px-4 py-1 gap-2 w-full">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Phone size={16} /> 04288 – 260333
          </span>
          <span className="flex items-center gap-2">
            <Mail size={16} /> aaascollege2021@gmail.com
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Megaphone size={16} />
          <span>Notice:</span>
          {loading ? (
            <span className="text-blue-200">Loading...</span>
          ) : admissionForms.length > 0 ? (
            <div className="flex items-center gap-2">
              {admissionForms.map((form) => (
                <button 
                  key={form.id}
                  onClick={() => handlePdfDownload(form)}
                  className="underline font-semibold hover:text-blue-200 transition-colors flex items-center gap-1"
                  title={form.description || form.title}
                >
                  <Download size={14} />
                  {form.title}
                </button>
              ))}
              <span className="text-gray-300 mx-2">|</span>
              <a 
                href="/admission-forms"
                className="text-blue-200 hover:text-white transition-colors text-sm"
              >
                View All Forms →
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-300">No admission forms available</span>
              <a 
                href="/admission-forms"
                className="text-blue-200 hover:text-white transition-colors text-sm"
              >
                Check Forms →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Full-width image with optimized height */}
      <div className="relative h-28 md:h-28 w-full overflow-hidden">
        <Image
          src="/uploads/image.png"
          alt="College Campus"
          width={1000}
          height={400}
          className="w-full h-full object-cover object-center"
          priority
          quality={100}
        />
      </div>
    </header>
  );
};

export default ComponentHeader;
