'use client';

import { useEffect } from 'react';

/**
 * Hook that disables right-click functionality on the page
 * @example
 * // In your component:
 * useDisableRightClick();
 */
export const useDisableRightClick = (): void => {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Also prevent image drag and drop
    const handleDragStart = (e: DragEvent): void => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    // Clean up
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);
};
