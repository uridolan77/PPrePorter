import React from 'react';
import { Box, useTheme } from '@mui/material';
import { getWavePatternBackground } from '../../theme/flatModernTheme';

export type AccentPosition = 'left' | 'top' | 'right' | 'bottom';
export type AccentVariant = 'teal' | 'purple' | 'blue' | 'green' | 'amber' | 'red';

export interface CardAccentProps {
  /**
   * Position of the accent stripe
   */
  position?: AccentPosition;

  /**
   * Color variant of the accent
   */
  variant?: AccentVariant;

  /**
   * Whether to show a wave pattern background
   */
  showWavePattern?: boolean;

  /**
   * Thickness of the accent stripe in pixels
   */
  thickness?: number;

  /**
   * Custom color for the accent (overrides variant)
   */
  color?: string;

  /**
   * Opacity of the wave pattern (0-1)
   */
  patternOpacity?: number;
}

/**
 * CardAccent component
 * Adds an accent stripe and optional wave pattern to cards
 */
const CardAccent: React.FC<CardAccentProps> = ({
  position = 'left',
  variant = 'teal',
  showWavePattern = false,
  thickness = 8,
  color,
  patternOpacity = 0.1
}) => {
  const theme = useTheme();

  // Get color based on variant
  const getColor = (): string => {
    if (color) return color;

    const variantColors = {
      teal: theme.palette.primary.main,
      purple: theme.palette.secondary.main,
      blue: theme.palette.info.main,
      green: theme.palette.success.main,
      amber: theme.palette.warning.main,
      red: theme.palette.error.main
    };

    return variantColors[variant] || theme.palette.primary.main;
  };

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          top: 0,
          left: 0,
          right: 0,
          height: thickness,
          width: '100%'
        };
      case 'right':
        return {
          top: 0,
          right: 0,
          bottom: 0,
          width: thickness,
          height: '100%'
        };
      case 'bottom':
        return {
          bottom: 0,
          left: 0,
          right: 0,
          height: thickness,
          width: '100%'
        };
      case 'left':
      default:
        return {
          top: 0,
          left: 0,
          bottom: 0,
          width: thickness,
          height: '100%'
        };
    }
  };

  const accentColor = getColor();
  // Extract position styles to avoid complex union type
  const positionStyles = getPositionStyles();

  // Create a style object instead of using sx prop
  const accentStyle = {
    position: 'absolute',
    backgroundColor: accentColor,
    zIndex: 1,
    top: positionStyles.top,
    right: positionStyles.right,
    bottom: positionStyles.bottom,
    left: positionStyles.left,
    width: positionStyles.width,
    height: positionStyles.height
  } as React.CSSProperties;

  return (
    <>
      {/* Accent stripe */}
      <div style={accentStyle} />

      {/* Wave pattern background */}
      {showWavePattern && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: patternOpacity,
            backgroundImage: getWavePatternBackground(accentColor),
            backgroundSize: '100px 50px',
            backgroundPosition: 'bottom',
            backgroundRepeat: 'repeat-x',
            zIndex: 0
          }}
        />
      )}
    </>
  );
};

export default CardAccent;
