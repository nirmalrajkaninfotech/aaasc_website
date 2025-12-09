'use client';
import { Phone, Mail, Megaphone, FileText, Download } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { API_BASE_URL } from '@/lib/api-utils';
import { getImageUrl } from '@/config';
// Remove trailing slash for concatenation with '/api/...'
const apiurl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;


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
    <header className="w-full overflow-hidden bg-[#2D5073]">
      {/* Top bar */}
      <div className="bg-[#2D5073] text-white text-sm flex flex-col sm:flex-row justify-between items-center px-4 py-1 gap-2 w-full">
        <div className="flex flex-wrap items-center gap-2 sm:gap-6">
          <span className="flex items-center gap-1 sm:gap-2">
            <Phone size={14} className="hidden xs:block" /> 04288 – 260333
          </span>
          <span className="flex items-center gap-1 sm:gap-2">
            <Mail size={14} className="hidden xs:block" /> aaascollege2021@gmail.com
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Megaphone size={14} className="hidden xs:block" />
          <span className="hidden sm:inline">Notice:</span>
          {loading ? (
            <span className="text-blue-200">Loading...</span>
          ) : admissionForms.length > 0 ? (
            <div className="flex items-center gap-2">
              {admissionForms.map((form) => (
      <>
      </>
              ))}
             
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

      {/* Full-width image - ensure not cropped */}
      <div className="relative w-full">
        <Image
          src={getImageUrl('/uploads/uploadsx.png')}
          alt="College Campus"
          width={1900}
          height={450}
          className="w-full h-auto object-contain"
          priority
          quality={100}
        />
      </div>
    </header>
  );
};

export default ComponentHeader;
