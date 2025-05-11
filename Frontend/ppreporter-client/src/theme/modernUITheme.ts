import { createTheme, Theme, alpha } from '@mui/material/styles';

// Modern UI theme inspired by the dashboard image
const modernUITheme: Theme = createTheme({
  palette: {
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
  },
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
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)',
    '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
    '0px 10px 15px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1)',
    '0px 20px 25px rgba(0, 0, 0, 0.05), 0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.05), 0px 30px 60px rgba(0, 0, 0, 0.15)',
    '0px 30px 60px rgba(0, 0, 0, 0.05), 0px 35px 70px rgba(0, 0, 0, 0.15)',
    '0px 35px 70px rgba(0, 0, 0, 0.05), 0px 40px 80px rgba(0, 0, 0, 0.15)',
    '0px 40px 80px rgba(0, 0, 0, 0.05), 0px 45px 90px rgba(0, 0, 0, 0.15)',
    '0px 45px 90px rgba(0, 0, 0, 0.05), 0px 50px 100px rgba(0, 0, 0, 0.15)',
    '0px 50px 100px rgba(0, 0, 0, 0.05), 0px 55px 110px rgba(0, 0, 0, 0.15)',
    '0px 55px 110px rgba(0, 0, 0, 0.05), 0px 60px 120px rgba(0, 0, 0, 0.15)',
    '0px 60px 120px rgba(0, 0, 0, 0.05), 0px 65px 130px rgba(0, 0, 0, 0.15)',
    '0px 65px 130px rgba(0, 0, 0, 0.05), 0px 70px 140px rgba(0, 0, 0, 0.15)',
    '0px 70px 140px rgba(0, 0, 0, 0.05), 0px 75px 150px rgba(0, 0, 0, 0.15)',
    '0px 75px 150px rgba(0, 0, 0, 0.05), 0px 80px 160px rgba(0, 0, 0, 0.15)',
    '0px 80px 160px rgba(0, 0, 0, 0.05), 0px 85px 170px rgba(0, 0, 0, 0.15)',
    '0px 85px 170px rgba(0, 0, 0, 0.05), 0px 90px 180px rgba(0, 0, 0, 0.15)',
    '0px 90px 180px rgba(0, 0, 0, 0.05), 0px 95px 190px rgba(0, 0, 0, 0.15)',
    '0px 95px 190px rgba(0, 0, 0, 0.05), 0px 100px 200px rgba(0, 0, 0, 0.15)',
    '0px 100px 200px rgba(0, 0, 0, 0.05), 0px 105px 210px rgba(0, 0, 0, 0.15)',
    '0px 105px 210px rgba(0, 0, 0, 0.05), 0px 110px 220px rgba(0, 0, 0, 0.15)',
    '0px 110px 220px rgba(0, 0, 0, 0.05), 0px 115px 230px rgba(0, 0, 0, 0.15)',
    '0px 115px 230px rgba(0, 0, 0, 0.05), 0px 120px 240px rgba(0, 0, 0, 0.15)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F3F4F6',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F3F4F6',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#9CA3AF',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#6B7280',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#FFFFFF',
          color: '#111827',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: 'none',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
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
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E5E7EB',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha('#00A3A3', 0.08),
            '&:hover': {
              backgroundColor: alpha('#00A3A3', 0.12),
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha('#00A3A3', 0.08),
            '&:hover': {
              backgroundColor: alpha('#00A3A3', 0.12),
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: alpha('#00A3A3', 0.08),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid #E5E7EB`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha('#00A3A3', 0.04),
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
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
        },
        elevation4: {
          boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1)',
        },
        elevation5: {
          boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.05), 0px 25px 50px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
});

export default modernUITheme;
