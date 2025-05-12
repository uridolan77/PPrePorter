import React from 'react';
import { styled } from '@mui/material';
import { CHART_CONTAINER_STYLE } from '../../constants';

/**
 * Props for the ChartPlaceholderContainer component
 */
interface ChartPlaceholderContainerProps {
  /**
   * Child components to render
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Styled container for chart placeholders
 * Displays a placeholder for charts with a dashed border
 */
const Container = styled('div')(CHART_CONTAINER_STYLE, {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

/**
 * ChartPlaceholderContainer component
 * Displays a placeholder for charts with a dashed border
 * 
 * @param props - Component props
 * @returns ChartPlaceholderContainer component
 */
const ChartPlaceholderContainer: React.FC<ChartPlaceholderContainerProps> = ({ children, className }) => {
  return (
    <Container className={className}>
      {children}
    </Container>
  );
};

export default ChartPlaceholderContainer;
