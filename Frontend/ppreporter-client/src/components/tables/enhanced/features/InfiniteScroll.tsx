import React, { useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { InfiniteScrollConfig } from '../types';

interface InfiniteScrollProps {
  config: InfiniteScrollConfig;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}

/**
 * Infinite scroll component
 */
const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  config,
  loading,
  hasMore,
  onLoadMore,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  
  // Intersection observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );
  
  // Set up intersection observer
  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(handleObserver, options);
    
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    
    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [handleObserver]);
  
  // Handle scroll events for older browsers
  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = config.loadMoreThreshold || 200;
    
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore, config.loadMoreThreshold]);
  
  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);
  
  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        position: 'relative'
      }}
    >
      {children}
      
      {(hasMore || loading) && (
        <Box
          ref={loadingRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: 2,
            width: '100%'
          }}
        >
          {loading && <CircularProgress size={24} />}
        </Box>
      )}
    </Box>
  );
};

export default InfiniteScroll;
