import React from 'react';
import { Paper, SxProps, Theme } from '@mui/material';
import { LayoutTemplatesConfig } from '../types';

// Predefined layout templates
export const layoutTemplates = {
  // Standard layout with balanced spacing
  standard: {
    headerHeight: 56,
    rowHeight: 52,
    footerHeight: 56,
    density: 'standard',
    showBorders: true,
    borderRadius: 4,
    elevation: 1,
    padding: 16,
    headerFontSize: 14,
    bodyFontSize: 14,
    footerFontSize: 14,
    headerFontWeight: 600,
    bodyFontWeight: 400,
    footerFontWeight: 400,
    headerTextTransform: 'none',
    rowHoverEffect: 'background',
    rowSelectedEffect: 'background',
    animation: true
  },

  // Compact layout for dense data display
  compact: {
    headerHeight: 40,
    rowHeight: 36,
    footerHeight: 40,
    density: 'compact',
    showBorders: true,
    borderRadius: 2,
    elevation: 0,
    padding: 8,
    headerFontSize: 12,
    bodyFontSize: 12,
    footerFontSize: 12,
    headerFontWeight: 600,
    bodyFontWeight: 400,
    footerFontWeight: 400,
    headerTextTransform: 'uppercase',
    rowHoverEffect: 'background',
    rowSelectedEffect: 'background',
    animation: false
  },

  // Comfortable layout with more spacing
  comfortable: {
    headerHeight: 64,
    rowHeight: 60,
    footerHeight: 64,
    density: 'comfortable',
    showBorders: true,
    borderRadius: 8,
    elevation: 2,
    padding: 24,
    headerFontSize: 16,
    bodyFontSize: 14,
    footerFontSize: 14,
    headerFontWeight: 600,
    bodyFontWeight: 400,
    footerFontWeight: 400,
    headerTextTransform: 'none',
    rowHoverEffect: 'shadow',
    rowSelectedEffect: 'border',
    animation: true
  },

  // Dashboard layout optimized for dashboards
  dashboard: {
    headerHeight: 48,
    rowHeight: 48,
    footerHeight: 48,
    density: 'standard',
    showBorders: false,
    borderRadius: 8,
    elevation: 0,
    padding: 16,
    headerFontSize: 13,
    bodyFontSize: 13,
    footerFontSize: 13,
    headerFontWeight: 600,
    bodyFontWeight: 400,
    footerFontWeight: 400,
    headerTextTransform: 'uppercase',
    rowHoverEffect: 'background',
    rowSelectedEffect: 'background',
    animation: true
  },

  // Report layout optimized for reports
  report: {
    headerHeight: 56,
    rowHeight: 48,
    footerHeight: 56,
    density: 'standard',
    showBorders: true,
    borderRadius: 0,
    elevation: 0,
    padding: 16,
    headerFontSize: 14,
    bodyFontSize: 14,
    footerFontSize: 14,
    headerFontWeight: 700,
    bodyFontWeight: 400,
    footerFontWeight: 400,
    headerTextTransform: 'none',
    rowHoverEffect: 'none',
    rowSelectedEffect: 'background',
    animation: false
  },

  // Admin layout optimized for admin interfaces
  admin: {
    headerHeight: 56,
    rowHeight: 52,
    footerHeight: 56,
    density: 'standard',
    showBorders: true,
    borderRadius: 4,
    elevation: 1,
    padding: 16,
    headerFontSize: 14,
    bodyFontSize: 14,
    footerFontSize: 14,
    headerFontWeight: 600,
    bodyFontWeight: 400,
    footerFontWeight: 400,
    headerTextTransform: 'uppercase',
    rowHoverEffect: 'background',
    rowSelectedEffect: 'border',
    animation: true
  },

  // Minimal layout with minimal styling
  minimal: {
    headerHeight: 48,
    rowHeight: 40,
    footerHeight: 48,
    density: 'compact',
    showBorders: false,
    borderRadius: 0,
    elevation: 0,
    padding: 8,
    headerFontSize: 13,
    bodyFontSize: 13,
    footerFontSize: 13,
    headerFontWeight: 600,
    bodyFontWeight: 400,
    footerFontWeight: 400,
    headerTextTransform: 'none',
    rowHoverEffect: 'background',
    rowSelectedEffect: 'none',
    animation: false
  }
};

interface LayoutTemplateProps {
  config: LayoutTemplatesConfig;
  children: React.ReactNode;
}

/**
 * Layout template component
 */
const LayoutTemplate: React.FC<LayoutTemplateProps> = ({
  config,
  children
}) => {
  if (!config.enabled) {
    return <>{children}</>;
  }

  // Get template
  let template;

  if (config.customLayouts && config.template && config.customLayouts[config.template]) {
    template = config.customLayouts[config.template];
  } else if (config.template && typeof config.template === 'string' &&
             Object.prototype.hasOwnProperty.call(layoutTemplates, config.template)) {
    template = layoutTemplates[config.template as keyof typeof layoutTemplates];
  } else {
    template = layoutTemplates.standard;
  }

  // Create a simplified style object
  const paperStyle: SxProps<Theme> = {
    borderRadius: `${template.borderRadius}px`,
    overflow: 'hidden',
    border: template.showBorders ? '1px solid rgba(224, 224, 224, 1)' : 'none'
  };

  return (
    <Paper elevation={template.elevation || 0} sx={paperStyle}>
      {children}
    </Paper>
  );
};

/**
 * Get styles for a specific component based on template
 */
export const getTemplateStyles = (
  config: LayoutTemplatesConfig,
  component: 'container' | 'header' | 'row' | 'cell' | 'footer'
): SxProps<Theme> => {
  if (!config.enabled) {
    return {};
  }

  // Get template
  let template;

  if (config.customLayouts && config.template && config.customLayouts[config.template]) {
    template = config.customLayouts[config.template];
  } else if (config.template && typeof config.template === 'string' &&
             Object.prototype.hasOwnProperty.call(layoutTemplates, config.template)) {
    template = layoutTemplates[config.template as keyof typeof layoutTemplates];
  } else {
    template = layoutTemplates.standard;
  }

  // Return styles based on component
  switch (component) {
    case 'container':
      return {
        borderRadius: `${template.borderRadius}px`,
        overflow: 'hidden',
        border: template.showBorders ? '1px solid rgba(224, 224, 224, 1)' : 'none'
      };

    case 'header':
      return {
        height: `${template.headerHeight}px`,
        fontSize: `${template.headerFontSize}px`,
        fontWeight: String(template.headerFontWeight || 600),
        textTransform: template.headerTextTransform as any,
        padding: template.padding ? `${template.padding / 2}px ${template.padding}px` : '8px 16px'
      };

    case 'row':
      return {
        height: `${template.rowHeight}px`,
        ...(template.rowHoverEffect === 'shadow' && {
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }
        }),
        ...(template.rowHoverEffect === 'none' && {
          '&:hover': {
            backgroundColor: 'inherit'
          }
        }),
        ...(template.rowSelectedEffect === 'border' && {
          '&.Mui-selected': {
            border: '2px solid',
            borderColor: 'primary.main',
            backgroundColor: 'inherit',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }
        }),
        ...(template.rowSelectedEffect === 'none' && {
          '&.Mui-selected': {
            backgroundColor: 'inherit',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }
        })
      };

    case 'cell':
      return {
        fontSize: `${template.bodyFontSize}px`,
        fontWeight: String(template.bodyFontWeight || 400),
        padding: template.padding ? `${template.padding / 2}px ${template.padding}px` : '8px 16px'
      };

    case 'footer':
      return {
        height: `${template.footerHeight}px`,
        fontSize: `${template.footerFontSize}px`,
        fontWeight: String(template.footerFontWeight || 400),
        padding: template.padding ? `${template.padding / 2}px ${template.padding}px` : '8px 16px'
      };

    default:
      return {};
  }
};

export default LayoutTemplate;
