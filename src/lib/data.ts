// Static data utilities for static export
// This replaces API calls with direct JSON imports

import academicsData from '../../data/academics.json';
import alumniData from '../../data/alumni.json';
import carouselData from '../../data/carousel.json';
import collagesData from '../../data/collages.json';
import iqacData from '../../data/iqac.json';
import placementsData from '../../data/placements.json';
import siteData from '../../data/site.json';

// Export all data
export const getAcademicsData = () => academicsData;
export const getAlumniData = () => alumniData;
export const getCarouselData = () => carouselData;
export const getCollagesData = () => collagesData;
export const getIqacData = () => iqacData;
export const getPlacementsData = () => placementsData;
export const getSiteData = () => siteData;

// Generic data getter by type
export const getData = (type: string) => {
  switch (type) {
    case 'academics':
      return getAcademicsData();
    case 'alumni':
      return getAlumniData();
    case 'carousel':
      return getCarouselData();
    case 'collages':
      return getCollagesData();
    case 'iqac':
      return getIqacData();
    case 'placements':
      return getPlacementsData();
    case 'site':
      return getSiteData();
    default:
      return null;
  }
};