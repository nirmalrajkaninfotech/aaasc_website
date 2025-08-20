export interface Header3Content {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  updatedAt: string;
}

export const defaultHeader3Content: Header3Content = {
  id: 'header3',
  title: 'Welcome to Our Website',
  subtitle: 'Your compelling subtitle goes here',
  imageUrl: '/images/header-banner.jpg',
  updatedAt: new Date().toISOString()
};
