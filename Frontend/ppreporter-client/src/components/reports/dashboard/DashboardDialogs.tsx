import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import RadarIcon from '@mui/icons-material/Radar';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SpeedIcon from '@mui/icons-material/Speed';
import GridOnIcon from '@mui/icons-material/GridOn';
import ShareIcon from '@mui/icons-material/Share';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import { WidgetType } from './DashboardWidget';

// Save Configuration Dialog Props
interface SaveConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  configName: string;
  configDescription: string;
  setConfigName: (name: string) => void;
  setConfigDescription: (description: string) => void;
}

// Add Widget Dialog Props
interface AddWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType, title: string, dataSource: string) => void;
}

// Share Dialog Props
interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * SaveConfigDialog component
 * Dialog for saving dashboard configuration
 */
export const SaveConfigDialog: React.FC<SaveConfigDialogProps> = ({
  open,
  onClose,
  onSave,
  configName,
  configDescription,
  setConfigName,
  setConfigDescription
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Save Dashboard Configuration
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Dashboard Name"
            fullWidth
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Description (Optional)"
            fullWidth
            value={configDescription}
            onChange={(e) => setConfigDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={!configName.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * AddWidgetDialog component
 * Dialog for adding a new widget to the dashboard
 */
export const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({
  open,
  onClose,
  onAddWidget
}) => {
  const [widgetType, setWidgetType] = useState<WidgetType>('areaChart');
  const [widgetTitle, setWidgetTitle] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('dailyActions');
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleAddWidget = () => {
    onAddWidget(widgetType, widgetTitle, dataSource);
    // Reset form
    setWidgetType('areaChart');
    setWidgetTitle('');
    setDataSource('dailyActions');
    setActiveTab(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add Widget
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Widget Title"
            fullWidth
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            margin="normal"
            required
          />

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Widget Type</Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="widget type tabs">
                  <Tab label="Basic" />
                  <Tab label="Advanced" />
                </Tabs>
              </Box>

              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'areaChart' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'areaChart' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'areaChart' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('areaChart')}
                    >
                      <TimelineIcon color={widgetType === 'areaChart' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Area Chart</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'barChart' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'barChart' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'barChart' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('barChart')}
                    >
                      <BarChartIcon color={widgetType === 'barChart' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Bar Chart</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'pieChart' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'pieChart' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'pieChart' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('pieChart')}
                    >
                      <PieChartIcon color={widgetType === 'pieChart' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Pie Chart</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'table' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'table' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'table' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('table')}
                    >
                      <TableChartIcon color={widgetType === 'table' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Table</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'summary' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'summary' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'summary' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('summary')}
                    >
                      <DashboardIcon color={widgetType === 'summary' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Summary</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'scatterChart' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'scatterChart' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'scatterChart' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('scatterChart')}
                    >
                      <ScatterPlotIcon color={widgetType === 'scatterChart' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Scatter Chart</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'lassoScatter' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'lassoScatter' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'lassoScatter' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('lassoScatter')}
                    >
                      <ScatterPlotIcon color={widgetType === 'lassoScatter' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Lasso Scatter</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'radarChart' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'radarChart' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'radarChart' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('radarChart')}
                    >
                      <RadarIcon color={widgetType === 'radarChart' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Radar Chart</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'treemapChart' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'treemapChart' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'treemapChart' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('treemapChart')}
                    >
                      <AccountTreeIcon color={widgetType === 'treemapChart' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Treemap</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'gaugeChart' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'gaugeChart' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'gaugeChart' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('gaugeChart')}
                    >
                      <SpeedIcon color={widgetType === 'gaugeChart' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Gauge Chart</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'heatmap' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'heatmap' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'heatmap' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('heatmap')}
                    >
                      <GridOnIcon color={widgetType === 'heatmap' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Heatmap</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'zoomableTimeSeries' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'zoomableTimeSeries' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'zoomableTimeSeries' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('zoomableTimeSeries')}
                    >
                      <TimelineIcon color={widgetType === 'zoomableTimeSeries' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Zoomable Time Series</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'networkGraph' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'networkGraph' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'networkGraph' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('networkGraph')}
                    >
                      <ShareIcon color={widgetType === 'networkGraph' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Network Graph</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'sankeyDiagram' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'sankeyDiagram' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'sankeyDiagram' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('sankeyDiagram')}
                    >
                      <AccountTreeIcon color={widgetType === 'sankeyDiagram' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Sankey Diagram</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === '3dScatter' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === '3dScatter' ? '2px solid' : '1px solid',
                        borderColor: widgetType === '3dScatter' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('3dScatter')}
                    >
                      <ScatterPlotIcon color={widgetType === '3dScatter' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>3D Scatter</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === '3dBar' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === '3dBar' ? '2px solid' : '1px solid',
                        borderColor: widgetType === '3dBar' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('3dBar')}
                    >
                      <BarChartIcon color={widgetType === '3dBar' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>3D Bar Chart</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Paper
                      elevation={widgetType === 'surfacePlot' ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: widgetType === 'surfacePlot' ? '2px solid' : '1px solid',
                        borderColor: widgetType === 'surfacePlot' ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => setWidgetType('surfacePlot')}
                    >
                      <BubbleChartIcon color={widgetType === 'surfacePlot' ? 'primary' : 'action'} sx={{ fontSize: 40 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>Surface Plot</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Data Source</Typography>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="data-source-label">Data Source</InputLabel>
                <Select
                  labelId="data-source-label"
                  value={dataSource}
                  label="Data Source"
                  onChange={(e) => setDataSource(e.target.value)}
                >
                  <MenuItem value="dailyActions">Daily Actions</MenuItem>
                  <MenuItem value="players">Players</MenuItem>
                  <MenuItem value="games">Games</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {dataSource === 'dailyActions' ?
                    'Daily actions data includes player activity, deposits, withdrawals, bets, and revenue metrics over time.' :
                   dataSource === 'players' ?
                    'Player data includes player profiles, activity, deposits, bets, and revenue metrics.' :
                    'Game data includes game performance, popularity, bets, wins, and revenue metrics.'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddWidget}
          variant="contained"
          color="primary"
          disabled={!widgetTitle.trim()}
        >
          Add Widget
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * ShareDialog component
 * Dialog for sharing dashboard configuration
 */
export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose
}) => {
  const [email, setEmail] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>(`https://ppreporter.com/share/${Math.random().toString(36).substring(2, 15)}`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    // Show success message (would be implemented with a snackbar in a real app)
    console.log('Link copied to clipboard');
  };

  const handleShare = () => {
    // Implementation would go here
    console.log('Sharing dashboard with:', email);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Share Dashboard
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Share via Email</Typography>
          <TextField
            label="Email Address"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            type="email"
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" gutterBottom>Share via Link</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              value={shareLink}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <Button variant="outlined" onClick={handleCopyLink}>
              Copy
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleShare}
          variant="contained"
          color="primary"
          disabled={!email.trim()}
        >
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );
};
