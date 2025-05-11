import React from 'react';
import {
  createTheme,
  ThemeProvider,
  Theme,
  useTheme,
  SxProps
} from '@mui/material';
import { ThemingConfig } from '../types';

// Default themes
export const tableThemes = {
  light: {
    header: {
      backgroundColor: '#f5f5f5',
      textColor: '#333333',
      borderColor: '#e0e0e0'
    },
    row: {
      evenBackgroundColor: '#ffffff',
      oddBackgroundColor: '#fafafa',
      hoverBackgroundColor: '#f0f0f0',
      selectedBackgroundColor: '#e3f2fd',
      textColor: '#333333',
      borderColor: '#e0e0e0'
    },
    footer: {
      backgroundColor: '#f5f5f5',
      textColor: '#333333',
      borderColor: '#e0e0e0'
    },
    pagination: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      activeColor: '#1976d2'
    },
    scrollbar: {
      trackColor: '#f5f5f5',
      thumbColor: '#c1c1c1',
      thumbHoverColor: '#a1a1a1'
    }
  },
  dark: {
    header: {
      backgroundColor: '#333333',
      textColor: '#ffffff',
      borderColor: '#444444'
    },
    row: {
      evenBackgroundColor: '#424242',
      oddBackgroundColor: '#383838',
      hoverBackgroundColor: '#505050',
      selectedBackgroundColor: '#1e3a5f',
      textColor: '#ffffff',
      borderColor: '#444444'
    },
    footer: {
      backgroundColor: '#333333',
      textColor: '#ffffff',
      borderColor: '#444444'
    },
    pagination: {
      backgroundColor: '#424242',
      textColor: '#ffffff',
      activeColor: '#90caf9'
    },
    scrollbar: {
      trackColor: '#333333',
      thumbColor: '#666666',
      thumbHoverColor: '#888888'
    }
  },
  highContrast: {
    header: {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      borderColor: '#ffffff'
    },
    row: {
      evenBackgroundColor: '#000000',
      oddBackgroundColor: '#0a0a0a',
      hoverBackgroundColor: '#333333',
      selectedBackgroundColor: '#0000aa',
      textColor: '#ffffff',
      borderColor: '#ffffff'
    },
    footer: {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      borderColor: '#ffffff'
    },
    pagination: {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      activeColor: '#ffff00'
    },
    scrollbar: {
      trackColor: '#000000',
      thumbColor: '#ffffff',
      thumbHoverColor: '#cccccc'
    }
  }
};

/**
 * Create a Material-UI theme from table theme
 */
export const createTableTheme = (
  baseTheme: Theme,
  tableTheme: any
): Theme => {
  return createTheme({
    ...baseTheme,
    components: {
      ...baseTheme.components,
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: tableTheme.header.backgroundColor,
            '& .MuiTableCell-head': {
              color: tableTheme.header.textColor,
              borderColor: tableTheme.header.borderColor,
              fontWeight: 'bold'
            }
          }
        }
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              '&:nth-of-type(even)': {
                backgroundColor: tableTheme.row.evenBackgroundColor
              },
              '&:nth-of-type(odd)': {
                backgroundColor: tableTheme.row.oddBackgroundColor
              },
              '&:hover': {
                backgroundColor: tableTheme.row.hoverBackgroundColor
              },
              '&.Mui-selected': {
                backgroundColor: tableTheme.row.selectedBackgroundColor,
                '&:hover': {
                  backgroundColor: tableTheme.row.selectedBackgroundColor
                }
              }
            },
            '& .MuiTableCell-body': {
              color: tableTheme.row.textColor,
              borderColor: tableTheme.row.borderColor
            }
          }
        }
      },
      MuiTableFooter: {
        styleOverrides: {
          root: {
            backgroundColor: tableTheme.footer.backgroundColor,
            '& .MuiTableCell-footer': {
              color: tableTheme.footer.textColor,
              borderColor: tableTheme.footer.borderColor
            }
          }
        }
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            backgroundColor: tableTheme.pagination.backgroundColor,
            color: tableTheme.pagination.textColor
          },
          select: {
            color: tableTheme.pagination.textColor
          },
          selectIcon: {
            color: tableTheme.pagination.textColor
          }
        }
      }
    }
  });
};

interface ThemingProviderProps {
  config: ThemingConfig;
  children: React.ReactNode;
}

/**
 * Theming provider component
 */
const ThemingProvider: React.FC<ThemingProviderProps> = ({
  config,
  children
}) => {
  const baseTheme = useTheme();

  if (!config.enabled) {
    return <>{children}</>;
  }

  // Get theme based on config
  let tableTheme;

  if (config.customTheme) {
    tableTheme = config.customTheme;
  } else {
    const themeName = config.theme || 'light';
    tableTheme = (typeof themeName === 'string' && Object.prototype.hasOwnProperty.call(tableThemes, themeName))
      ? tableThemes[themeName as keyof typeof tableThemes]
      : tableThemes.light;
  }

  // Create theme
  const theme = createTableTheme(baseTheme, tableTheme);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

/**
 * Get component styles based on config
 */
export const getComponentStyles = (
  config: ThemingConfig,
  componentName: string,
  props: any
): SxProps => {
  if (!config.enabled || !config.componentStyles || !config.componentStyles[componentName]) {
    return {};
  }

  const styleFunction = config.componentStyles[componentName];
  return styleFunction(props);
};

/**
 * Create scrollbar styles
 */
export const createScrollbarStyles = (
  config: ThemingConfig
): React.CSSProperties => {
  if (!config.enabled) {
    return {};
  }

  // Get theme
  let tableTheme;

  if (config.customTheme) {
    tableTheme = config.customTheme;
  } else {
    const themeName = config.theme || 'light';
    tableTheme = (typeof themeName === 'string' && Object.prototype.hasOwnProperty.call(tableThemes, themeName))
      ? tableThemes[themeName as keyof typeof tableThemes]
      : tableThemes.light;
  }

  // Ensure scrollbar exists with default values if not
  const scrollbar = tableTheme.scrollbar || {
    trackColor: '#f5f5f5',
    thumbColor: '#c1c1c1',
    thumbHoverColor: '#a1a1a1'
  };

  return {
    scrollbarWidth: 'thin',
    scrollbarColor: `${scrollbar.thumbColor} ${scrollbar.trackColor}`,
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px'
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: scrollbar.trackColor
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: scrollbar.thumbColor,
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: scrollbar.thumbHoverColor
      }
    }
  } as React.CSSProperties;
};

export default ThemingProvider;
