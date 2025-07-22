import { NextPage } from 'next';
import ImageGallery from '@/components/Imagew';

const GalleryPage: NextPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">College Gallery</h1>
      <ImageGallery />
    </div>
  );
};

export default GalleryPage;
