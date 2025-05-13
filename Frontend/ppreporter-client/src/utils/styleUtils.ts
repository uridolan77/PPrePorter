import { SxProps, Theme } from '@mui/material';

/**
 * A utility function to create sx props without TypeScript union type complexity issues.
 * This function simply returns the input object but with a type assertion that avoids
 * the "union type too complex to represent" error.
 *
 * @param styles The styles object to be used as sx props
 * @returns The same styles object with the correct type
 */
export const createSx = (styles: Record<string, any>): any => {
  return styles;
};

/**
 * A utility function to create a style function that returns an object
 * This approach avoids TypeScript's complex union type issues
 *
 * @param stylesFn A function that returns a styles object
 * @returns A function that returns the styles object
 */
export const createStyleFn = <T extends any[]>(stylesFn: (...args: T) => Record<string, any>) => {
  return (...args: T): any => stylesFn(...args);
};

/**
 * Style functions for common components
 * These functions return style objects directly to avoid TypeScript union type issues
 */
export const styles = {
  card: () => ({
    bgcolor: 'background.paper',
    p: 2,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    boxShadow: 1,
  }),

  panel: () => ({
    bgcolor: 'background.paper',
    p: 1.5,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    boxShadow: 1,
  }),

  flexRow: () => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  }),

  flexColumn: () => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  }),

  flexBetween: () => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  flexCenter: () => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  marginBottom: (value: number) => ({
    mb: value,
  }),

  padding: (value: number) => ({
    p: value,
  }),

  fullWidth: () => ({
    width: '100%',
  }),

  fullHeight: () => ({
    height: '100%',
  }),
};
