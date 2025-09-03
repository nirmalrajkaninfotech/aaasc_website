// Client-side navigation utilities for SPA

export const navigate = (path: string) => {
  window.location.hash = path;
  // Trigger a custom event to update the router
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

export const getCurrentPath = () => {
  return window.location.hash.slice(1) || '/';
};

export const createLink = (href: string) => {
  return `#${href}`;
};