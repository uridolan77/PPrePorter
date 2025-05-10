import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Notes as NotesIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { Annotation } from '../../../types/dataExplorer';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

interface DetailViewProps {
  dataSource: string;
  selectedDataPoint: any;
  metrics: string[];
  data: any;
  annotations: Annotation[];
  onNavigateBack: () => void;
  onCreateAnnotation: (event: React.MouseEvent<HTMLElement>) => void;
  renderCustomTooltip?: (props: any) => React.ReactNode;
}

/**
 * Detail View Component
 */
const DetailView: React.FC<DetailViewProps> = ({
  dataSource,
  selectedDataPoint,
  metrics,
  data,
  annotations,
  onNavigateBack,
  onCreateAnnotation,
  renderCustomTooltip
}) => {
  const theme = useTheme();

  if (!selectedDataPoint) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onNavigateBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          {dataSource === 'gamePerformanceData' && selectedDataPoint.name ?
            `${selectedDataPoint.name} Details` :
            dataSource === 'timeSeriesData' && selectedDataPoint.date ?
              `Details for ${selectedDataPoint.date}` :
              'Data Point Details'
          }
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Key Metrics</Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {Object.entries(selectedDataPoint)
                  .filter(([key]) => key !== 'name' && key !== 'date' && key !== 'color')
                  .map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                        <Typography variant="h5">
                          {typeof value === 'number'
                            ? key === 'returnRate' || key === 'growth'
                              ? `${(value as number * 100).toFixed(2)}%`
                              : (value as number).toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : value as React.ReactNode}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Trend Analysis</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ height: 300 }}>
                {dataSource === 'timeSeriesData' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.timeSeriesData.slice(-10)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis
                        dataKey="date"
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <RechartsTooltip content={renderCustomTooltip} />
                      <Legend />
                      {metrics.slice(0, 2).map((metric, index) => (
                        <Line
                          key={metric}
                          type="monotone"
                          dataKey={metric}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Trend analysis is only available for time series data
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Related Annotations</Typography>
                <Button
                  startIcon={<NotesIcon />}
                  size="small"
                  onClick={onCreateAnnotation}
                >
                  Add Annotation
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {annotations.filter(a => a.dataSource === dataSource).length > 0 ? (
                <Box>
                  {annotations
                    .filter(a => a.dataSource === dataSource)
                    .map((annotation, index) => (
                      <Paper
                        key={annotation.id || index}
                        variant="outlined"
                        sx={{ p: 2, mb: 2 }}
                      >
                        <Typography variant="body2">{annotation.text}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(annotation.timestamp).toLocaleString()}
                          </Typography>
                          <Box>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No annotations yet. Add one to highlight important insights.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default DetailView;
