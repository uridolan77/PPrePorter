import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  ThemeProvider
} from '@mui/material';
import flatModernTheme from '../../theme/flatModernTheme';
import {
  getFlatModernCardSx,
  getFlatModernButtonSx,
  getFlatModernTableSx,
  getFlatModernPaperSx
} from '../../utils/applyFlatModernStyle';
import CardAccent from '../../components/common/CardAccent';

/**
 * Example of how to apply flat modern styling to existing components
 */
const FlatModernStyleExample: React.FC = () => {
  // Sample data for the table
  const createData = (
    name: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number
  ) => {
    return { name, calories, fat, carbs, protein };
  };

  const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  return (
    <ThemeProvider theme={flatModernTheme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Applying Flat Modern Style to Existing Components
        </Typography>
        <Typography variant="body1" paragraph>
          This example shows how to apply the flat modern styling to existing components
          using the utility functions and CardAccent component.
        </Typography>

        <Grid container spacing={4}>
          {/* Example 1: Using CardAccent component */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Method 1: Using CardAccent Component
            </Typography>
            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardAccent position="left" variant="teal" />
              <CardContent>
                <Typography variant="h5" component="div">
                  Card with Left Accent
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This card uses the CardAccent component to add a teal accent stripe on the left side.
                </Typography>
              </CardContent>
            </Card>

            <Box mt={3}>
              <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardAccent position="top" variant="purple" showWavePattern />
                <CardContent>
                  <Typography variant="h5" component="div">
                    Card with Top Accent and Wave Pattern
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This card uses the CardAccent component to add a purple accent stripe on the top
                    and a wave pattern background.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Example 2: Using utility functions */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Method 2: Using Utility Functions
            </Typography>
            <Card sx={getFlatModernCardSx('blue', 'left')}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Card with Left Accent
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This card uses the getFlatModernCardSx utility function to add a blue accent stripe on the left side.
                </Typography>
              </CardContent>
            </Card>

            <Box mt={3}>
              <Card sx={getFlatModernCardSx('amber', 'bottom')}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Card with Bottom Accent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This card uses the getFlatModernCardSx utility function to add an amber accent stripe on the bottom.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Example 3: Buttons */}
          <Grid item xs={12}>
            <Paper sx={getFlatModernPaperSx(true, { p: 3 })}>
              <Typography variant="h6" gutterBottom>
                Flat Modern Buttons
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" sx={getFlatModernButtonSx('teal')}>
                  Teal Button
                </Button>
                <Button variant="contained" sx={getFlatModernButtonSx('purple')}>
                  Purple Button
                </Button>
                <Button variant="contained" sx={getFlatModernButtonSx('blue')}>
                  Blue Button
                </Button>
                <Button variant="contained" sx={getFlatModernButtonSx('green')}>
                  Green Button
                </Button>
                <Button variant="contained" sx={getFlatModernButtonSx('amber')}>
                  Amber Button
                </Button>
                <Button variant="contained" sx={getFlatModernButtonSx('red')}>
                  Red Button
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Example 4: Table */}
          <Grid item xs={12}>
            <Paper sx={getFlatModernPaperSx(true, { p: 0, overflow: 'hidden' })}>
              <TableContainer>
                <Table sx={getFlatModernTableSx('teal')}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dessert (100g serving)</TableCell>
                      <TableCell align="right">Calories</TableCell>
                      <TableCell align="right">Fat&nbsp;(g)</TableCell>
                      <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                      <TableCell align="right">Protein&nbsp;(g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.calories}</TableCell>
                        <TableCell align="right">{row.fat}</TableCell>
                        <TableCell align="right">{row.carbs}</TableCell>
                        <TableCell align="right">{row.protein}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default FlatModernStyleExample;
