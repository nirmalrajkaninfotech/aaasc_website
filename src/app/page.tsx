'use client';

import HashRouter from '@/components/HashRouter';
import AuthGuard from '@/components/AuthGuard';

// Import all your page components
import HomePage from '@/components/pages/HomePage';
import AboutPage from '@/components/pages/AboutPage';
import AcademicsPage from '@/components/pages/AcademicsPage';
import FacultiesPage from '@/components/pages/FacultiesPage';
import GalleryPage from '@/components/pages/GalleryPage';
import ContactPage from '@/components/pages/ContactPage';
import PlacementsPage from '@/components/pages/PlacementsPage';
import AchievementsPage from '@/components/pages/AchievementsPage';
import AdmissionFormsPage from '@/components/pages/AdmissionFormsPage';
import AlumniPage from '@/components/pages/AlumniPage';
import CategoriesPage from '@/components/pages/CategoriesPage';
import ExamCellPage from '@/components/pages/ExamCellPage';
import IQACPage from '@/components/pages/IQACPage';
import LoginPage from '@/components/pages/LoginPage';
import OthersPage from '@/components/pages/OthersPage';
import AdminPage from '@/components/pages/AdminPage';
import CollageDetailPage from '@/components/pages/CollageDetailPage';
import { useEffect } from 'react';


export default function App() {
  const GalleryDetailRoute = ({ params }: { params?: { id?: string } }) => (
    <CollageDetailPage id={params?.id ?? ''} />
  );

  const routes = [
    { path: '/', component: <HomePage /> },
    { path: '/about', component: <AboutPage /> },
    { path: '/academics', component: <AcademicsPage /> },
    { path: '/facilities', component: <FacultiesPage /> },
    { path: '/faculty', component: <FacultiesPage /> },
    { path: '/gallery', component: <GalleryPage /> },
    // Dynamic gallery detail page (hash-based): #/gallery/123
    { path: '/gallery/:id', component: GalleryDetailRoute },
    { path: '/contact', component: <ContactPage /> },
    { path: '/placements', component: <PlacementsPage /> },
    { path: '/achievements', component: <AchievementsPage /> },
    { path: '/admission-forms', component: <AdmissionFormsPage /> },
    { path: '/alumni-association', component: <AlumniPage /> },
    { path: '/categories', component: <CategoriesPage /> },
    { path: '/exam-cell', component: <ExamCellPage /> },
    { path: '/iqac', component: <IQACPage /> },
    { path: '/login', component: <LoginPage /> },
    { path: '/others', component: <OthersPage /> },
    // Use real server route for admin dashboard
    { 
      path: '/admin', 
      component: (
        <AuthGuard>
          <AdminPage />
        </AuthGuard>
      )
    },
  ];

  const fallback = (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <button 
        onClick={() => window.location.hash = '/'}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Home
      </button>
    </div>
  );

  return <HashRouter routes={routes} fallback={fallback} />;
}