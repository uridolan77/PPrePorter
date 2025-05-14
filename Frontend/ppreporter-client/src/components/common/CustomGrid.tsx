import React from 'react';
import { styled } from '@mui/material/styles';

// Define types for the Grid components
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

// Create a styled div for the Grid container
const GridContainer = styled('div')<GridProps>(({ theme, spacing = 0 }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  margin: spacing ? `-${theme.spacing(spacing / 2)}` : 0,
}));

// Create a styled div for the Grid item
const GridItem = styled('div')<GridProps>(({ theme, xs, sm, md, lg, xl, spacing = 0 }) => {
  // Helper function to calculate width based on breakpoint value
  const getWidth = (value: number | boolean | undefined) => {
    if (value === undefined || value === false) return 'auto';
    if (value === true) return '100%';
    return `${(value / 12) * 100}%`;
  };

  return {
    padding: spacing ? theme.spacing(spacing / 2) : 0,
    flexGrow: 0,
    maxWidth: '100%',
    flexBasis: '100%',
    [theme.breakpoints.up('xs')]: {
      flexBasis: getWidth(xs),
      maxWidth: getWidth(xs),
    },
    [theme.breakpoints.up('sm')]: {
      flexBasis: getWidth(sm),
      maxWidth: getWidth(sm),
    },
    [theme.breakpoints.up('md')]: {
      flexBasis: getWidth(md),
      maxWidth: getWidth(md),
    },
    [theme.breakpoints.up('lg')]: {
      flexBasis: getWidth(lg),
      maxWidth: getWidth(lg),
    },
    [theme.breakpoints.up('xl')]: {
      flexBasis: getWidth(xl),
      maxWidth: getWidth(xl),
    },
  };
});

/**
 * Custom Grid component that doesn't rely on @mui/material/Grid
 * This is a simplified version that supports the basic Grid functionality
 */
const CustomGrid: React.FC<GridProps> = (props) => {
  const { container, item, children, ...rest } = props;

  if (container) {
    return <GridContainer {...rest}>{children}</GridContainer>;
  }

  if (item) {
    return <GridItem {...rest}>{children}</GridItem>;
  }

  // Default to container if neither container nor item is specified
  return <GridContainer {...rest}>{children}</GridContainer>;
};

export default CustomGrid;
