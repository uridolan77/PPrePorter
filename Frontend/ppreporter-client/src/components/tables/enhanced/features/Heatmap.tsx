import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { HeatmapConfig } from '../types';

interface HeatmapCellProps {
  value: number;
  config: HeatmapConfig;
  children: React.ReactNode;
}

/**
 * Interpolate between two colors
 */
const interpolateColor = (
  color1: string,
  color2: string,
  factor: number
): string => {
  // Parse hex colors
  const parseColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  };
  
  // Ensure factor is between 0 and 1
  const clampedFactor = Math.max(0, Math.min(1, factor));
  
  // Parse colors
  const color1Rgb = parseColor(color1);
  const color2Rgb = parseColor(color2);
  
  // Interpolate RGB values
  const r = Math.round(color1Rgb.r + (color2Rgb.r - color1Rgb.r) * clampedFactor);
  const g = Math.round(color1Rgb.g + (color2Rgb.g - color1Rgb.g) * clampedFactor);
  const b = Math.round(color1Rgb.b + (color2Rgb.b - color1Rgb.b) * clampedFactor);
  
  // Convert back to hex
  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Calculate color for heatmap cell
 */
const calculateHeatmapColor = (
  value: number,
  config: HeatmapConfig
): string => {
  // Get min and max values
  const minValue = config.minValue !== undefined ? config.minValue : 0;
  const maxValue = config.maxValue !== undefined ? config.maxValue : 100;
  
  // Get colors
  const minColor = config.minColor || '#FFFFFF';
  const midColor = config.midColor;
  const maxColor = config.maxColor || '#FF0000';
  
  // Normalize value between 0 and 1
  const range = maxValue - minValue;
  const normalizedValue = range !== 0 ? (value - minValue) / range : 0.5;
  
  // Clamp normalized value between 0 and 1
  const clampedValue = Math.max(0, Math.min(1, normalizedValue));
  
  // If we have a mid color, we need to interpolate twice
  if (midColor) {
    const midPoint = config.midPoint !== undefined ? config.midPoint : 0.5;
    
    if (clampedValue <= midPoint) {
      // Interpolate between min and mid
      const factor = midPoint !== 0 ? clampedValue / midPoint : 0;
      return interpolateColor(minColor, midColor, factor);
    } else {
      // Interpolate between mid and max
      const factor = midPoint !== 1 ? (clampedValue - midPoint) / (1 - midPoint) : 1;
      return interpolateColor(midColor, maxColor, factor);
    }
  } else {
    // Simple interpolation between min and max
    return interpolateColor(minColor, maxColor, clampedValue);
  }
};

/**
 * Calculate text color for contrast
 */
const calculateTextColor = (backgroundColor: string): string => {
  // Parse hex color
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Heatmap cell component
 */
const HeatmapCell: React.FC<HeatmapCellProps> = ({
  value,
  config,
  children
}) => {
  const theme = useTheme();
  
  // Calculate background color
  const backgroundColor = useMemo(() => {
    return calculateHeatmapColor(value, config);
  }, [value, config]);
  
  // Calculate text color for contrast
  const textColor = useMemo(() => {
    return config.adaptiveText ? calculateTextColor(backgroundColor) : undefined;
  }, [backgroundColor, config.adaptiveText]);
  
  return (
    <Box
      sx={{
        backgroundColor,
        color: textColor,
        padding: config.padding || theme.spacing(1),
        borderRadius: config.borderRadius || theme.shape.borderRadius,
        transition: 'background-color 0.3s ease',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: config.align || 'center'
      }}
    >
      {children}
    </Box>
  );
};

/**
 * Process data for heatmap visualization
 */
export const processHeatmapData = (
  data: any[],
  columnId: string,
  config: HeatmapConfig
): { minValue: number; maxValue: number } => {
  if (!data.length) {
    return { minValue: 0, maxValue: 0 };
  }
  
  // Extract values
  const values = data.map(row => {
    const value = row[columnId];
    return typeof value === 'number' ? value : 0;
  });
  
  // Calculate min and max
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  return { minValue, maxValue };
};

export default HeatmapCell;
