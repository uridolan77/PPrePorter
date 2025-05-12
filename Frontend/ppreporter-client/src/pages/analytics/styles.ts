/**
 * Common styles for Analytics components
 */

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

export const COLORS = {
  divider: 'rgba(0, 0, 0, 0.12)',
  placeholder: 'rgba(0, 0, 0, 0.08)',
};

export const CARD_STYLE = {
  padding: SPACING.lg,
  borderRadius: BORDER_RADIUS.md,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
};

export const HEADING_STYLE = {
  marginBottom: SPACING.xs,
};

export const SECTION_STYLE = {
  marginBottom: SPACING.lg,
};

export const CHART_CONTAINER_STYLE = {
  height: 300,
  border: `1px dashed ${COLORS.divider}`,
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.lg,
};

export const TAB_CONTAINER_STYLE = {
  borderBottom: `1px solid ${COLORS.divider}`,
  marginBottom: SPACING.lg,
};

export const ERROR_CONTAINER_STYLE = {
  marginBottom: SPACING.lg,
};

export const PLACEHOLDER_STYLE = {
  backgroundColor: COLORS.placeholder,
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.lg,
  minHeight: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
