import React, { memo, Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { CircularProgress, styled } from '@mui/material';
import { SPACING } from './styles';

/**
 * TabPanel component props
 */
interface TabPanelProps {
  /** Content to display when the tab is active */
  children?: React.ReactNode;
  /** The index of this tab panel */
  index: number;
  /** The current active tab value */
  value: number;
  /** The unique identifier for this tab panel */
  id: string;
  /** Whether to lazy load the tab content (default: false) */
  lazyLoad?: boolean;
  /** Additional props */
  [key: string]: any;
}

// Styled components to avoid complex style objects
const TabPanelContainer = styled('div')({
  width: '100%',
});

const TabPanelContent = styled('div')({
  paddingTop: SPACING.lg,
});

const LoadingContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: SPACING.lg,
});

/**
 * TabPanel component for handling tab content
 * Displays the content only when the tab is active
 * Supports lazy loading of tab content for better performance
 *
 * @param children - The content to display when the tab is active
 * @param value - The current active tab value
 * @param index - The index of this tab panel
 * @param id - The unique identifier for this tab panel
 * @param lazyLoad - Whether to lazy load the tab content (default: false)
 */
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  id,
  lazyLoad = false,
  ...other
}) => {
  const isActive = value === index;
  const [hasBeenActive, setHasBeenActive] = useState(isActive);

  // Track if this tab has ever been active
  useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [isActive, hasBeenActive]);

  // If lazy loading is enabled, only render the content if the tab has been active
  // Memoized to prevent unnecessary recalculations
  const shouldRenderContent = useMemo(() => !lazyLoad || hasBeenActive, [lazyLoad, hasBeenActive]);

  if (!isActive) {
    return (
      <TabPanelContainer
        role="tabpanel"
        hidden
        id={`tabpanel-${id}`}
        aria-labelledby={`tab-${id}`}
        aria-hidden="true"
        {...other}
      />
    );
  }

  return (
    <TabPanelContainer
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      aria-hidden="false"
      {...other}
    >
      <TabPanelContent>
        {shouldRenderContent ? (
          <Suspense fallback={
            <LoadingContainer>
              <CircularProgress size={40} />
            </LoadingContainer>
          }>
            {children}
          </Suspense>
        ) : (
          <LoadingContainer>
            <CircularProgress size={40} />
          </LoadingContainer>
        )}
      </TabPanelContent>
    </TabPanelContainer>
  );
};

export default memo(TabPanel);
