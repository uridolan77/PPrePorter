import React from 'react';
import { Box } from '@mui/material';

/**
 * SimpleBox component
 * A simple div component that replaces MUI Box to avoid TypeScript union type complexity issues
 */
interface SimpleBoxProps {
  component?: any;
  sx?: any;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Convert MUI spacing units to pixels
 * @param value - The spacing value in MUI units
 * @returns The spacing value in pixels
 */
const convertSpacing = (value: any): string | undefined => {
  if (typeof value === 'number') {
    return `${value * 8}px`;
  }
  return value;
};

/**
 * SimpleBox component
 * A simple replacement for MUI Box that avoids TypeScript union type issues
 */
const SimpleBox: React.FC<SimpleBoxProps> = (props) => {
  const { component, sx, style, children, ...otherProps } = props;

  // Create a simplified inline style object from sx prop
  const inlineStyle: React.CSSProperties = {
    ...(style || {}),
    display: sx?.display,
    flexDirection: sx?.flexDirection,
    justifyContent: sx?.justifyContent,
    alignItems: sx?.alignItems,
    flexWrap: sx?.flexWrap,
    gap: convertSpacing(sx?.gap),
    marginBottom: convertSpacing(sx?.mb),
    marginTop: convertSpacing(sx?.mt),
    marginRight: convertSpacing(sx?.mr),
    marginLeft: convertSpacing(sx?.ml),
    padding: convertSpacing(sx?.p),
    paddingTop: convertSpacing(sx?.pt),
    paddingBottom: convertSpacing(sx?.pb),
    paddingLeft: convertSpacing(sx?.pl),
    paddingRight: convertSpacing(sx?.pr),
    height: sx?.height,
    width: sx?.width,
    minWidth: sx?.minWidth,
    maxWidth: sx?.maxWidth,
    minHeight: sx?.minHeight,
    maxHeight: sx?.maxHeight,
    position: sx?.position,
    top: sx?.top,
    left: sx?.left,
    right: sx?.right,
    bottom: sx?.bottom,
    borderRadius: sx?.borderRadius,
    border: sx?.border,
    borderColor: sx?.borderColor,
    borderBottom: sx?.borderBottom,
    backgroundColor: sx?.bgcolor,
    color: sx?.color,
    flexGrow: sx?.flexGrow,
    overflow: sx?.overflow,
    boxSizing: 'border-box',
  };

  // Filter out undefined values
  Object.keys(inlineStyle).forEach(key => {
    if (inlineStyle[key as keyof React.CSSProperties] === undefined) {
      delete inlineStyle[key as keyof React.CSSProperties];
    }
  });

  // If component prop is provided, render a div with the as attribute
  if (component) {
    const elementProps = {
      ...otherProps,
      style: inlineStyle,
      as: component
    };

    return <div {...elementProps}>{children}</div>;
  }

  // Otherwise, render a regular div
  return <div style={inlineStyle} {...otherProps}>{children}</div>;
};

export default SimpleBox;
