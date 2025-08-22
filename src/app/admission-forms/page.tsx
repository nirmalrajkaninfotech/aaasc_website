'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';

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

export default function AdmissionFormsPage() {
  const [admissionForms, setAdmissionForms] = useState<AdmissionForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissionForms();
  }, []);

  const fetchAdmissionForms = async () => {
    try {
      console.log('Admission forms page: Fetching admission forms...');
      const response = await fetch('/api/admission-forms');
      console.log('Admission forms page: Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Admission forms page: Received data:', data);
        // Only show active forms, sorted by order
        const activeForms = data
          .filter((form: AdmissionForm) => form.isActive)
          .sort((a: AdmissionForm, b: AdmissionForm) => b.order - a.order);
        console.log('Admission forms page: Active forms:', activeForms);
        setAdmissionForms(activeForms);
      } else {
        console.error('Admission forms page: Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Admission forms page: Failed to fetch admission forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfDownload = (form: AdmissionForm) => {
    const link = document.createElement('a');
    link.href = form.fileUrl;
    link.download = form.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading admission forms...</div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Admission Forms
          </h1>
          <p className="text-xl text-gray-600">
            Download the latest admission forms and applications
          </p>
        </div>

        {admissionForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No admission forms available</h3>
            <p className="text-gray-500">
              Please check back later or contact the college office for admission information.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admissionForms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-800 text-center mb-3 line-clamp-2">
                    {form.title}
                  </h3>
                  
                  {/* Description */}
                  {form.description && (
                    <p className="text-gray-600 text-sm text-center mb-4 line-clamp-3">
                      {form.description}
                    </p>
                  )}
                  
                  {/* File Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        File Size
                      </span>
                      <span>{formatFileSize(form.fileSize)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Uploaded
                      </span>
                      <span>{formatDate(form.uploadDate)}</span>
                    </div>
                  </div>
                  
                  {/* Download Button */}
                  <button
                    onClick={() => handlePdfDownload(form)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Need Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
              <div className="space-y-2 text-gray-600">
                <p>Phone: 04288 – 260333</p>
                <p>Email: aaascollege2021@gmail.com</p>
                <p>Office Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Important Notes</h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>• Please read all instructions carefully before filling</p>
                <p>• Ensure all required documents are attached</p>
                <p>• Submit completed forms before the deadline</p>
                <p>• Keep a copy of your submitted form</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
