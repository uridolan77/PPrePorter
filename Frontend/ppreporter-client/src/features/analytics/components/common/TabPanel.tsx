import React, { memo, Suspense, useState, useEffect } from 'react';
import { CircularProgress, styled } from '@mui/material';
import { SPACING } from '../../constants';

interface TabPanelProps {
  /**
   * Content to display when the tab is active
   */
  children?: React.ReactNode;
  
  /**
   * Current active tab index
   */
  value: number;
  
  /**
   * This tab's index
   */
  index: number;
  
  /**
   * Unique identifier for this tab
   */
  id: string;
  
  /**
   * Whether to lazy load the tab content
   */
  lazyLoad?: boolean;
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
  const shouldRenderContent = !lazyLoad || hasBeenActive;

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
