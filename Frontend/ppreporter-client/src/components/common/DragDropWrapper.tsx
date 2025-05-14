import React, { forwardRef } from 'react';
import SimpleBox from './SimpleBox';
import { createSx } from '../../utils/styleUtils';

/**
 * DragDropWrapper component
 * 
 * This component is a wrapper for react-beautiful-dnd to fix the innerRef issue
 * It ensures that the ref is properly passed to a DOM element
 */
interface DragDropWrapperProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  sx?: any;
  [key: string]: any;
}

const DragDropWrapper = forwardRef<HTMLDivElement, DragDropWrapperProps>(
  ({ children, style, className, sx, ...props }, ref) => {
    return (
      <SimpleBox
        ref={ref}
        sx={createSx(sx || {})}
        style={style}
        className={className}
        {...props}
      >
        {children}
      </SimpleBox>
    );
  }
);

DragDropWrapper.displayName = 'DragDropWrapper';

export default DragDropWrapper;
