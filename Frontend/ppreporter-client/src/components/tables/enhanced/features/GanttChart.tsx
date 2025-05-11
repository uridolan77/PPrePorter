import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import TodayIcon from '@mui/icons-material/Today';
import { GanttChartConfig } from '../types';

interface GanttChartProps {
  data: any[];
  config: GanttChartConfig;
}

/**
 * Gantt chart component
 */
const GanttChart: React.FC<GanttChartProps> = ({
  data,
  config
}) => {
  const theme = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollToToday, setScrollToToday] = useState(false);

  // Calculate date range for the chart
  const dateRange = useMemo(() => {
    if (!data.length) {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      return {
        start: oneMonthAgo,
        end: oneMonthLater,
        days: 60
      };
    }

    // Extract start and end dates
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    data.forEach(item => {
      const startDate = new Date(item[config.startField]);
      const endDate = new Date(item[config.endField]);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return;
      }

      if (minDate === null || startDate < minDate) {
        minDate = startDate;
      }

      if (maxDate === null || endDate > maxDate) {
        maxDate = endDate;
      }
    });

    if (minDate === null || maxDate === null) {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      return {
        start: oneMonthAgo,
        end: oneMonthLater,
        days: 60
      };
    }

    // Add padding to date range
    const paddingDays = 7;
    // TypeScript needs non-null assertion here since we've already checked above
    const minDateWithPadding = new Date((minDate as Date).getTime());
    minDateWithPadding.setDate(minDateWithPadding.getDate() - paddingDays);

    const maxDateWithPadding = new Date((maxDate as Date).getTime());
    maxDateWithPadding.setDate(maxDateWithPadding.getDate() + paddingDays);

    // Calculate number of days
    const days = Math.ceil((maxDateWithPadding.getTime() - minDateWithPadding.getTime()) / (1000 * 60 * 60 * 24));

    return {
      start: minDateWithPadding,
      end: maxDateWithPadding,
      days
    };
  }, [data, config.startField, config.endField]);

  // Generate dates for the chart
  const dates = useMemo(() => {
    const result = [];
    const currentDate = new Date(dateRange.start);

    for (let i = 0; i < dateRange.days; i++) {
      result.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }, [dateRange]);

  // Calculate cell width based on zoom level
  const cellWidth = 30 * zoomLevel;

  // Calculate task position and width
  const calculateTaskPosition = (task: any) => {
    const startDate = new Date(task[config.startField]);
    const endDate = new Date(task[config.endField]);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { left: 0, width: 0 };
    }

    // Calculate days from start of chart
    const startDays = Math.floor((startDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const endDays = Math.ceil((endDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, endDays - startDays);

    return {
      left: startDays * cellWidth,
      width: duration * cellWidth
    };
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if a date is a weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  // Scroll to today
  const handleScrollToToday = () => {
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const scrollPosition = daysSinceStart * cellWidth;

    const container = document.getElementById('gantt-chart-container');
    if (container) {
      container.scrollLeft = scrollPosition - container.clientWidth / 2;
    }
  };

  // Zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  // Zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  if (!config.enabled) {
    return null;
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Gantt Chart
        </Typography>

        <Box>
          <Tooltip title="Zoom out">
            <IconButton onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom in">
            <IconButton onClick={handleZoomIn} disabled={zoomLevel >= 3}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Scroll to today">
            <IconButton onClick={handleScrollToToday}>
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'flex' }}>
        {/* Task names column */}
        <Box sx={{ width: 200, flexShrink: 0, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {config.taskField ? config.taskField.charAt(0).toUpperCase() + config.taskField.slice(1) : 'Task'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((task, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ height: 40 }}>
                    {task[config.taskField]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Gantt chart */}
        <Box sx={{ overflow: 'auto', flexGrow: 1 }} id="gantt-chart-container">
          <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {dates.map((date, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{
                      width: cellWidth,
                      padding: 0.5,
                      backgroundColor: isWeekend(date) ? theme.palette.action.hover : undefined,
                      borderRight: isToday(date) ? `2px solid ${theme.palette.primary.main}` : undefined,
                      fontWeight: isToday(date) ? 'bold' : undefined,
                      color: isToday(date) ? theme.palette.primary.main : undefined
                    }}
                  >
                    {formatDate(date)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((task, taskIndex) => (
                <TableRow key={taskIndex} hover>
                  {dates.map((date, dateIndex) => (
                    <TableCell
                      key={dateIndex}
                      sx={{
                        width: cellWidth,
                        height: 40,
                        padding: 0,
                        position: 'relative',
                        backgroundColor: isWeekend(date) ? theme.palette.action.hover : undefined,
                        borderRight: isToday(date) ? `2px solid ${theme.palette.primary.main}` : undefined
                      }}
                    />
                  ))}

                  {/* Task bar */}
                  {(() => {
                    const { left, width } = calculateTaskPosition(task);
                    if (width === 0) return null;

                    const progress = config.progressField ? (task[config.progressField] || 0) : 0;
                    const dependencies = config.dependenciesField ? (task[config.dependenciesField] || []) : [];

                    return (
                      <Box
                        sx={{
                          position: 'absolute',
                          left,
                          top: 5,
                          width,
                          height: 30,
                          backgroundColor: theme.palette.primary.main,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.palette.primary.contrastText,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.9
                          }
                        }}
                      >
                        {/* Progress bar */}
                        {progress > 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              width: `${progress}%`,
                              height: '100%',
                              backgroundColor: theme.palette.success.main,
                              opacity: 0.7
                            }}
                          />
                        )}

                        <Typography variant="caption" sx={{ zIndex: 1, px: 1 }}>
                          {task[config.taskField]}
                          {progress > 0 && ` (${progress}%)`}
                        </Typography>
                      </Box>
                    );
                  })()}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Paper>
  );
};

export default GanttChart;
