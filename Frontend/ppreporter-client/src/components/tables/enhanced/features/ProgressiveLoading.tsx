import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';
import { ProgressiveLoadingConfig } from '../types';

interface ProgressiveLoadingProps {
  config: ProgressiveLoadingConfig;
  children: React.ReactNode;
  visible: boolean;
  priority?: boolean;
}

/**
 * Progressive loading component for lazy loading cell content
 */
const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  config,
  children,
  visible,
  priority = false
}) => {
  const [loaded, setLoaded] = useState(false);
  const [intersecting, setIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up intersection observer
  useEffect(() => {
    if (!config.enabled || priority || loaded) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIntersecting(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [config.enabled, priority, loaded]);
  
  // Load content when visible or intersecting
  useEffect(() => {
    if (!config.enabled || loaded) {
      return;
    }
    
    if (priority) {
      // Load immediately for priority content
      setLoaded(true);
      return;
    }
    
    if (intersecting && visible) {
      // Delay loading for non-priority content
      const timeout = setTimeout(() => {
        setLoaded(true);
      }, config.loadDelay || 100);
      
      return () => clearTimeout(timeout);
    }
  }, [config.enabled, config.loadDelay, intersecting, visible, priority, loaded]);
  
  if (!config.enabled || loaded) {
    return <>{children}</>;
  }
  
  return (
    <Box ref={ref}>
      <Skeleton variant="rectangular" width="100%" height={24} />
    </Box>
  );
};

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  config: ProgressiveLoadingConfig;
  priority?: boolean;
}

/**
 * Progressive image loading component
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  width,
  height,
  config,
  priority = false
}) => {
  const [loaded, setLoaded] = useState(false);
  const [intersecting, setIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up intersection observer
  useEffect(() => {
    if (!config.enabled || priority) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIntersecting(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [config.enabled, priority]);
  
  // Load image when intersecting
  useEffect(() => {
    if (!config.enabled || loaded) {
      return;
    }
    
    if (priority || intersecting) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.src = src;
    }
  }, [config.enabled, src, intersecting, priority, loaded]);
  
  return (
    <Box ref={ref} width={width} height={height} sx={{ position: 'relative' }}>
      {loaded ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Skeleton
          variant="rectangular"
          width={width || '100%'}
          height={height || 100}
          animation="wave"
        />
      )}
    </Box>
  );
};

/**
 * Process data for progressive loading
 */
export const processDataForProgressiveLoading = (
  data: any[],
  columns: any[],
  config: ProgressiveLoadingConfig
): any[] => {
  if (!config.enabled || !data.length) {
    return data;
  }
  
  // Identify priority and deferred columns
  const priorityColumns = new Set(config.priorityColumns || []);
  const deferredColumns = new Set(config.deferredColumns || []);
  
  // If no columns are specified, use defaults
  if (priorityColumns.size === 0 && deferredColumns.size === 0) {
    // Default: first 2-3 columns are priority
    columns.slice(0, 3).forEach(col => priorityColumns.add(col.id));
    
    // Rest are deferred
    columns.slice(3).forEach(col => {
      if (col.type === 'image' || col.type === 'chart' || col.type === 'microChart') {
        deferredColumns.add(col.id);
      }
    });
  }
  
  // Mark columns for progressive loading
  return data.map(row => {
    const newRow = { ...row };
    
    // Mark deferred columns
    deferredColumns.forEach(columnId => {
      if (columnId in newRow) {
        newRow[`${columnId}_deferred`] = true;
      }
    });
    
    // Mark priority columns
    priorityColumns.forEach(columnId => {
      if (columnId in newRow) {
        newRow[`${columnId}_priority`] = true;
      }
    });
    
    return newRow;
  });
};

export default ProgressiveLoading;
