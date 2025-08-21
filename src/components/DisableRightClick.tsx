'use client';

import { useDisableRightClick } from '@/hooks/useDisableRightClick';

/**
 * Component that disables right-click functionality for its children
 * Wrap your app with this component to apply the right-click disable globally
 */
const DisableRightClick = ({ children }: { children: React.ReactNode }) => {
  useDisableRightClick();
  return <>{children}</>;
};

export default DisableRightClick;
