import { createTheme, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';

// Teal color palette inspired by the dashboard image
const tealPalette = {
  primary: {
    main: '#00A3A3', // Teal main color
    light: '#33B7B7',
    dark: '#007A7A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#4B56D2', // Purple accent color
    light: '#6F78DB',
    dark: '#343C93',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981', // Green
    light: '#3FC79A',
    dark: '#0B825A',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444', // Red
    light: '#F26969',
    dark: '#A72F2F',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B', // Amber
    light: '#F7B13A',
    dark: '#AB6E08',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#3B82F6', // Blue
    light: '#629BF8',
    dark: '#295BAC',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    default: '#F3F4F6',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
  },
};

// Card gradient backgrounds
export const cardGradients = {
  teal: 'linear-gradient(135deg, #00A3A3 0%, #00C2C2 100%)',
  purple: 'linear-gradient(135deg, #4B56D2 0%, #5A67E8 100%)',
  blue: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  green: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  amber: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  red: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
};

// Create the theme
const tealTheme: Theme = createTheme({
  palette: tealPalette,
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontSize: 14,
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04)',
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: alpha(tealPalette.primary.main, 0.08),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${tealPalette.grey[200]}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(tealPalette.primary.main, 0.04),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default tealTheme;
