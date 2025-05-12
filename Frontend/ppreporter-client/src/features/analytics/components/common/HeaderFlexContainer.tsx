import React from 'react';
import { styled } from '@mui/material';

/**
 * Props for the HeaderFlexContainer component
 */
interface HeaderFlexContainerProps {
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
 * Styled container for header content
 * Displays content in a flex layout with space between items
 */
const Container = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

/**
 * HeaderFlexContainer component
 * Displays content in a flex layout with space between items
 * 
 * @param props - Component props
 * @returns HeaderFlexContainer component
 */
const HeaderFlexContainer: React.FC<HeaderFlexContainerProps> = ({ children, className }) => {
  return (
    <Container className={className}>
      {children}
    </Container>
  );
};

export default HeaderFlexContainer;
