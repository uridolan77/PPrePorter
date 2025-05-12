import { Box, styled, Theme } from '@mui/material';
import { CHART_CONTAINER_STYLE } from './styles';

/**
 * Header flex container component using MUI Box
 * Displays content in a flex layout with space between items
 */
export const HeaderFlexContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

/**
 * Chart placeholder container component using MUI Box
 * Displays a placeholder for charts with a dashed border
 */
export const ChartPlaceholderContainer = styled(Box)({
  ...CHART_CONTAINER_STYLE,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});
