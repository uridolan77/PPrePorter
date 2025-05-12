import { alpha } from '@mui/material/styles';
import { SxProps, Theme } from '@mui/material';
import { AccentPosition, AccentVariant } from '../components/common/CardAccent';

/**
 * Apply flat modern styling to a card component
 * @param variant Color variant for the accent
 * @param accentPosition Position of the accent stripe
 * @param deepShadow Whether to apply a deep shadow
 * @param additionalSx Additional sx props to apply
 * @returns SxProps object with styling
 */
export const getFlatModernCardSx = (
  variant: AccentVariant = 'teal',
  accentPosition: AccentPosition = 'left',
  deepShadow: boolean = true,
  additionalSx: SxProps<Theme> = {}
): SxProps<Theme> => {
  // Get color based on variant
  const getColor = (theme: Theme): string => {
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

  // Get position styles for accent
  const getAccentStyles = () => {
    const thickness = 4;

    switch (accentPosition) {
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

  return {
    position: 'relative',
    borderRadius: 2,
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    ...(deepShadow ? {
      boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.12), 0px 24px 32px rgba(0, 0, 0, 0.16)',
    } : {
      boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.14)',
    }),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.16), 0px 32px 48px rgba(0, 0, 0, 0.2)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      ...getAccentStyles(),
      backgroundColor: (theme) => getColor(theme),
      zIndex: 1
    },
    ...additionalSx
  };
};

/**
 * Apply flat modern styling to a button
 * @param variant Color variant for the button
 * @param additionalSx Additional sx props to apply
 * @returns SxProps object with styling
 */
export const getFlatModernButtonSx = (
  variant: AccentVariant = 'teal',
  additionalSx: SxProps<Theme> = {}
): SxProps<Theme> => {
  return {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: 1,
    padding: '8px 16px',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.12)',
    '&:hover': {
      boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(0, 0, 0, 0.14)',
      transform: 'translateY(-2px)',
    },
    '&.MuiButton-outlined': {
      borderWidth: '2px',
      '&:hover': {
        borderWidth: '2px',
      },
    },
    ...additionalSx
  };
};

/**
 * Apply flat modern styling to a table
 * @param variant Color variant for the table header
 * @param additionalSx Additional sx props to apply
 * @returns SxProps object with styling
 */
export const getFlatModernTableSx = (
  variant: AccentVariant = 'teal',
  additionalSx: SxProps<Theme> = {}
): SxProps<Theme> => {
  // Get color based on variant
  const getColor = (theme: Theme): string => {
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

  return {
    '& .MuiTableHead-root': {
      '& .MuiTableCell-head': {
        fontWeight: 600,
        backgroundColor: (theme) => alpha(getColor(theme), 0.08),
      }
    },
    '& .MuiTableRow-root': {
      '&:nth-of-type(odd)': {
        backgroundColor: (theme) => alpha(getColor(theme), 0.02),
      },
      '&:hover': {
        backgroundColor: (theme) => alpha(getColor(theme), 0.04),
      }
    },
    '& .MuiTableCell-root': {
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
    },
    ...additionalSx
  };
};

/**
 * Apply flat modern styling to a paper component
 * @param deepShadow Whether to apply a deep shadow
 * @param additionalSx Additional sx props to apply
 * @returns SxProps object with styling
 */
export const getFlatModernPaperSx = (
  deepShadow: boolean = true,
  additionalSx: SxProps<Theme> = {}
): SxProps<Theme> => {
  return {
    borderRadius: 2,
    border: '1px solid rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    ...(deepShadow ? {
      boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.12), 0px 24px 32px rgba(0, 0, 0, 0.16)',
    } : {
      boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.14)',
    }),
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.16), 0px 32px 48px rgba(0, 0, 0, 0.2)',
    },
    ...additionalSx
  };
};
