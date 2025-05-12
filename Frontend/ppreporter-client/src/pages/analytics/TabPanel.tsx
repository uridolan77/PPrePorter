import React, { memo, Suspense, lazy, useState, useEffect } from 'react';
import { CircularProgress, styled } from '@mui/material';
import { SPACING } from './styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id: string;
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
