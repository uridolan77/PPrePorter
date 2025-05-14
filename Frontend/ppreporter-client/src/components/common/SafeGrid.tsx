import React, { useState, useEffect } from 'react';
import CustomGrid from './CustomGrid';

// Import types from CustomGrid
interface GridProps {
  container?: boolean;
  item?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * SafeGrid component that attempts to load the Material-UI Grid component
 * and falls back to a custom implementation if it fails
 */
const SafeGrid: React.FC<GridProps> = (props) => {
  const [GridComponent, setGridComponent] = useState<React.ComponentType<GridProps> | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Try to dynamically import the Grid component
    import('@mui/material/Grid')
      .then((module) => {
        setGridComponent(() => module.default);
      })
      .catch((err) => {
        console.error('Error loading Grid component:', err);
        setError(true);
      });
  }, []);

  // If there was an error loading the Grid component, use the custom implementation
  if (error) {
    return <CustomGrid {...props} />;
  }

  // If the Grid component is still loading, use the custom implementation
  if (!GridComponent) {
    return <CustomGrid {...props} />;
  }

  // If the Grid component loaded successfully, use it
  return <GridComponent {...props} />;
};

export default SafeGrid;
