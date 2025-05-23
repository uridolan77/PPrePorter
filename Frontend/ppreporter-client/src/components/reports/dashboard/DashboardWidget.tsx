import React, { useState } from 'react';
import { Paper, Typography, IconButton, Menu, MenuItem, Divider, useTheme } from '@mui/material';
import SimpleBox from '../../common/SimpleBox';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { format as formatDate } from 'date-fns';
import { ReportAreaChart, ReportBarChart, ReportPieChart } from '../charts/ReportCharts';
import { ReportScatterChart, ReportRadarChart, ReportTreemapChart, ReportGaugeChart, ReportHeatmap } from '../charts/AdvancedCharts';
import InteractiveChart from '../interactive/InteractiveChart';
import AdvancedInteractiveChart from '../interactive/AdvancedInteractiveChart';
import ZoomableTimeSeriesChart from '../interactive/ZoomableTimeSeriesChart';
import LassoSelectionScatterChart from '../interactive/LassoSelectionScatterChart';
import DrilldownModal, { DrilldownData } from '../interactive/DrilldownModal';
import { EnhancedTable } from '../../tables/enhanced';
import { ColumnDef } from '../../tables/enhanced/types';
import NetworkGraph from '../visualizations/NetworkGraph';
import SankeyDiagram from '../visualizations/SankeyDiagram';
import Interactive3DChart from '../visualizations/Interactive3DChart';
import Surface3DPlot from '../visualizations/Surface3DPlot';
import AdvancedVisualizationContainer from '../visualizations/AdvancedVisualizationContainer';

// Chart colors
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

// Widget types
export type WidgetType = 'table' | 'lineChart' | 'barChart' | 'pieChart' | 'areaChart' | 'summary' |
                         'scatterChart' | 'radarChart' | 'treemapChart' | 'gaugeChart' | 'heatmap' |
                         'zoomableTimeSeries' | 'lassoScatter' | 'networkGraph' | 'sankeyDiagram' |
                         '3dScatter' | '3dBar' | '3dSurface' | 'surfacePlot';

// Widget interface
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  config?: any;
  data?: any[];
}

interface DashboardWidgetProps {
  widget: Widget;
  data: any;
  loading?: boolean;
  error?: string | null;
  customizeMode?: boolean;
  onMenuOpen?: (event: React.MouseEvent<HTMLElement>, widgetId: string) => void;
  columns?: ColumnDef[];
  enableInteractivity?: boolean;
}

/**
 * DashboardWidget component
 * Renders different types of widgets based on the widget type
 */
const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  data,
  loading = false,
  error = null,
  customizeMode = false,
  onMenuOpen,
  columns = [],
  enableInteractivity = true
}) => {
  const theme = useTheme();
  const [drilldownOpen, setDrilldownOpen] = useState<boolean>(false);
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);

  // Get widget size styles
  const getWidgetSizeStyles = () => {
    switch (widget.size) {
      case 'small':
        return { gridColumn: 'span 4', height: 300 };
      case 'medium':
        return { gridColumn: 'span 6', height: 350 };
      case 'large':
        return { gridColumn: 'span 12', height: 400 };
      default:
        return { gridColumn: 'span 6', height: 350 };
    }
  };

  // Handle drill-down
  const handleDrillDown = (data: any, index: number) => {
    // Generate drilldown data
    let title = widget.title;
    let category = '';
    let value = 0;
    let detailData: any[] = [];

    if (widget.type === 'pieChart') {
      category = data.name;
      value = data.value;
      title = `${widget.title} - ${category}`;
    } else if (widget.dataSource === 'dailyActions') {
      category = formatDate(new Date(data.date), 'MMM dd, yyyy');
      value = data.deposits || data.bets || data.uniquePlayers || 0;
      title = `${widget.title} - ${category}`;

      // For daily actions, filter by date
      if (Array.isArray(widget.data)) {
        detailData = widget.data.filter(item =>
          item.date === data.date
        );
      }
    } else if (widget.dataSource === 'games') {
      category = data.name || '';
      value = data.totalBets || data.netGamingRevenue || 0;
      title = `${widget.title} - ${category}`;

      // For games, filter by name
      if (Array.isArray(widget.data)) {
        detailData = widget.data.filter(item =>
          item.name === data.name
        );
      }
    } else if (widget.dataSource === 'players') {
      category = data.name || '';
      value = data.totalDeposits || data.netGamingRevenue || 0;
      title = `${widget.title} - ${category}`;

      // For players, filter by name
      if (Array.isArray(widget.data)) {
        detailData = widget.data.filter(item =>
          item.name === data.name
        );
      }
    }

    // If no detail data found, use the clicked item
    if (detailData.length === 0) {
      detailData = [data];
    }

    const drillData: DrilldownData = {
      title,
      description: `Detailed view of ${category}`,
      category,
      value,
      data: detailData
    };

    setDrilldownData(drillData);
    setDrilldownOpen(true);
  };

  // Render widget content based on type
  const renderWidgetContent = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <SimpleBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="text.secondary">No data available</Typography>
        </SimpleBox>
      );
    }

    switch (widget.type) {
      case 'areaChart':
        if (enableInteractivity) {
          return (
            <AdvancedInteractiveChart
              id={`widget-${widget.id}`}
              title={widget.title}
              type="area"
              data={Array.isArray(data) ? data : []}
              xKey={widget.dataSource === 'dailyActions' ? 'date' : 'name'}
              yKeys={widget.dataSource === 'dailyActions' ? ['uniquePlayers', 'newRegistrations'] :
                    widget.dataSource === 'games' ? ['totalBets', 'netGamingRevenue'] :
                    ['totalDeposits', 'netGamingRevenue']}
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
              enableDrilldown={true}
              enableTooltip={true}
              enableCrossFiltering={true}
              enableAnnotations={true}
              onClick={handleDrillDown}
            />
          );
        } else {
          return (
            <ReportAreaChart
              data={Array.isArray(data) ? data : []}
              xKey={widget.dataSource === 'dailyActions' ? 'date' : 'name'}
              yKeys={widget.dataSource === 'dailyActions' ? ['uniquePlayers', 'newRegistrations'] :
                    widget.dataSource === 'games' ? ['totalBets', 'netGamingRevenue'] :
                    ['totalDeposits', 'netGamingRevenue']}
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
            />
          );
        }
      case 'barChart':
        if (enableInteractivity) {
          return (
            <AdvancedInteractiveChart
              id={`widget-${widget.id}`}
              title={widget.title}
              type="bar"
              data={Array.isArray(data) ? data : []}
              xKey={widget.dataSource === 'dailyActions' ? 'date' : 'name'}
              yKeys={widget.dataSource === 'dailyActions' ? ['deposits', 'withdrawals'] :
                    widget.dataSource === 'games' ? ['totalBets', 'totalWins'] :
                    ['totalDeposits', 'totalBets']}
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
              enableDrilldown={true}
              enableTooltip={true}
              enableCrossFiltering={true}
              enableAnnotations={true}
              onClick={handleDrillDown}
            />
          );
        } else {
          return (
            <ReportBarChart
              data={Array.isArray(data) ? data : []}
              xKey={widget.dataSource === 'dailyActions' ? 'date' : 'name'}
              yKeys={widget.dataSource === 'dailyActions' ? ['deposits', 'withdrawals'] :
                    widget.dataSource === 'games' ? ['totalBets', 'totalWins'] :
                    ['totalDeposits', 'totalBets']}
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
            />
          );
        }
      case 'pieChart':
        // Transform data for pie chart if needed
        let pieData = Array.isArray(data) ? data : [];
        if (widget.dataSource === 'dailyActions') {
          // Create pie data from daily actions
          pieData = [
            { name: 'Deposits', value: pieData.reduce((sum, item) => sum + (item.deposits || 0), 0) },
            { name: 'Withdrawals', value: pieData.reduce((sum, item) => sum + (item.withdrawals || 0), 0) },
            { name: 'Bets', value: pieData.reduce((sum, item) => sum + (item.bets || 0), 0) },
            { name: 'Wins', value: pieData.reduce((sum, item) => sum + (item.wins || 0), 0) }
          ];
        } else if (widget.dataSource === 'players') {
          // Create pie data from players by country
          const countryMap = new Map<string, number>();
          pieData.forEach((player) => {
            const country = player.country || 'Unknown';
            countryMap.set(country, (countryMap.get(country) || 0) + 1);
          });
          pieData = Array.from(countryMap.entries()).map(([name, value]) => ({ name, value }));
        } else if (widget.dataSource === 'games') {
          // Create pie data from games by category
          const categoryMap = new Map<string, number>();
          pieData.forEach((game) => {
            const category = game.category || 'Unknown';
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
          });
          pieData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
        }

        if (enableInteractivity) {
          return (
            <AdvancedInteractiveChart
              id={`widget-${widget.id}`}
              title={widget.title}
              type="pie"
              data={pieData}
              xKey="name"
              nameKey="name"
              valueKey="value"
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
              enableDrilldown={true}
              enableTooltip={true}
              enableCrossFiltering={true}
              enableAnnotations={true}
              onClick={handleDrillDown}
            />
          );
        } else {
          return (
            <ReportPieChart
              data={pieData}
              nameKey="name"
              valueKey="value"
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
            />
          );
        }

      case 'scatterChart':
      case 'lassoScatter':
        // Transform data for scatter chart if needed
        const scatterData = Array.isArray(data) ? data.map(item => {
          let result: any = { id: item.id || `id-${Math.random().toString(36).substring(2, 9)}` };

          if (widget.dataSource === 'dailyActions') {
            result = {
              ...result,
              x: item.deposits || 0,
              y: item.bets || 0,
              z: item.uniquePlayers || 0,
              name: formatDate(new Date(item.date), 'MMM dd'),
              date: item.date
            };
          } else if (widget.dataSource === 'players') {
            result = {
              ...result,
              x: item.totalDeposits || 0,
              y: item.totalBets || 0,
              z: item.netGamingRevenue || 0,
              name: item.name || 'Unknown'
            };
          } else if (widget.dataSource === 'games') {
            result = {
              ...result,
              x: item.totalBets || 0,
              y: item.netGamingRevenue || 0,
              z: item.uniquePlayers || 0,
              name: item.name || 'Unknown'
            };
          } else {
            return { ...item, id: result.id };
          }

          return result;
        }) : [];

        if (enableInteractivity && widget.type === 'lassoScatter') {
          return (
            <LassoSelectionScatterChart
              id={`widget-${widget.id}`}
              title={widget.title}
              data={scatterData}
              xKey="x"
              yKey="y"
              nameKey="name"
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
              enableLassoSelection={true}
              enableCrossFiltering={true}
              onClick={handleDrillDown}
            />
          );
        } else if (enableInteractivity) {
          return (
            <AdvancedInteractiveChart
              id={`widget-${widget.id}`}
              title={widget.title}
              type="scatter"
              data={scatterData}
              xKey="x"
              yKeys={["y"]}
              nameKey="name"
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
              enableDrilldown={true}
              enableTooltip={true}
              enableCrossFiltering={true}
              enableAnnotations={true}
              onClick={handleDrillDown}
            />
          );
        } else {
          return (
            <ReportScatterChart
              data={scatterData}
              xKey="x"
              yKey="y"
              zKey="z"
              nameKey="name"
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
            />
          );
        }

      case 'radarChart':
        // Transform data for radar chart if needed
        let radarData = Array.isArray(data) ? data : [];
        if (widget.dataSource === 'dailyActions') {
          // Use the most recent 5 days for radar chart
          radarData = radarData.slice(0, 5).map(item => ({
            date: formatDate(new Date(item.date), 'MMM dd'),
            deposits: item.deposits || 0,
            withdrawals: item.withdrawals || 0,
            bets: item.bets || 0,
            wins: item.wins || 0,
            ggr: item.ggr || 0
          }));
        } else if (widget.dataSource === 'games') {
          // Use the top 5 games for radar chart
          radarData = radarData.slice(0, 5).map(item => ({
            name: item.name || 'Unknown',
            totalBets: item.totalBets || 0,
            totalWins: item.totalWins || 0,
            netGamingRevenue: item.netGamingRevenue || 0,
            uniquePlayers: item.uniquePlayers || 0,
            popularity: item.popularity || 0
          }));
        } else if (widget.dataSource === 'players') {
          // Use the top 5 players for radar chart
          radarData = radarData.slice(0, 5).map(item => ({
            name: item.name || 'Unknown',
            totalDeposits: item.totalDeposits || 0,
            totalBets: item.totalBets || 0,
            totalWins: item.totalWins || 0,
            netGamingRevenue: item.netGamingRevenue || 0
          }));
        }

        return (
          <ReportRadarChart
            data={radarData}
            dataKey={widget.dataSource === 'dailyActions' ? 'deposits' :
                    widget.dataSource === 'games' ? 'totalBets' : 'totalDeposits'}
            nameKey={widget.dataSource === 'dailyActions' ? 'date' : 'name'}
            loading={loading}
            error={error}
            height={getWidgetSizeStyles().height - 60}
          />
        );

      case 'treemapChart':
        // Transform data for treemap chart if needed
        let treemapData = Array.isArray(data) ? data : [];
        if (widget.dataSource === 'dailyActions') {
          // Not ideal for treemap, but we can use it for demonstration
          treemapData = [
            { name: 'Deposits', value: treemapData.reduce((sum, item) => sum + (item.deposits || 0), 0) },
            { name: 'Withdrawals', value: treemapData.reduce((sum, item) => sum + (item.withdrawals || 0), 0) },
            { name: 'Bets', value: treemapData.reduce((sum, item) => sum + (item.bets || 0), 0) },
            { name: 'Wins', value: treemapData.reduce((sum, item) => sum + (item.wins || 0), 0) },
            { name: 'GGR', value: treemapData.reduce((sum, item) => sum + (item.ggr || 0), 0) }
          ];
        } else if (widget.dataSource === 'games') {
          // Use games by category for treemap
          const categoryMap = new Map<string, number>();
          treemapData.forEach((game) => {
            const category = game.category || 'Unknown';
            categoryMap.set(category, (categoryMap.get(category) || 0) + (game.totalBets || 0));
          });
          treemapData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
        } else if (widget.dataSource === 'players') {
          // Use players by country for treemap
          const countryMap = new Map<string, number>();
          treemapData.forEach((player) => {
            const country = player.country || 'Unknown';
            countryMap.set(country, (countryMap.get(country) || 0) + (player.totalDeposits || 0));
          });
          treemapData = Array.from(countryMap.entries()).map(([name, value]) => ({ name, value }));
        }

        return (
          <ReportTreemapChart
            data={treemapData}
            dataKey="value"
            nameKey="name"
            loading={loading}
            error={error}
            height={getWidgetSizeStyles().height - 60}
          />
        );

      case 'gaugeChart':
        // Transform data for gauge chart if needed
        let gaugeData = Array.isArray(data) ? data : [];
        if (widget.dataSource === 'dailyActions') {
          // Create gauge data for daily actions
          const totalDeposits = gaugeData.reduce((sum, item) => sum + (item.deposits || 0), 0);
          const totalWithdrawals = gaugeData.reduce((sum, item) => sum + (item.withdrawals || 0), 0);
          const totalBets = gaugeData.reduce((sum, item) => sum + (item.bets || 0), 0);
          const totalWins = gaugeData.reduce((sum, item) => sum + (item.wins || 0), 0);
          const totalGGR = gaugeData.reduce((sum, item) => sum + (item.ggr || 0), 0);

          gaugeData = [
            { name: 'Deposits', value: totalDeposits, fill: '#0088FE' },
            { name: 'Withdrawals', value: totalWithdrawals, fill: '#00C49F' },
            { name: 'Bets', value: totalBets, fill: '#FFBB28' },
            { name: 'Wins', value: totalWins, fill: '#FF8042' },
            { name: 'GGR', value: totalGGR, fill: '#A569BD' }
          ];
        } else if (widget.dataSource === 'games') {
          // Create gauge data for top 5 games
          gaugeData = gaugeData.slice(0, 5).map((game, index) => ({
            name: game.name || 'Unknown',
            value: game.totalBets || 0,
            fill: CHART_COLORS[index % CHART_COLORS.length]
          }));
        } else if (widget.dataSource === 'players') {
          // Create gauge data for top 5 players
          gaugeData = gaugeData.slice(0, 5).map((player, index) => ({
            name: player.name || 'Unknown',
            value: player.totalDeposits || 0,
            fill: CHART_COLORS[index % CHART_COLORS.length]
          }));
        }

        return (
          <ReportGaugeChart
            data={gaugeData}
            dataKey="value"
            nameKey="name"
            loading={loading}
            error={error}
            height={getWidgetSizeStyles().height - 60}
          />
        );

      case 'zoomableTimeSeries':
        // Transform data for time series chart if needed
        const timeSeriesData = Array.isArray(data) ? data.sort((a, b) => {
          if (a.date && b.date) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          return 0;
        }) : [];

        if (enableInteractivity) {
          return (
            <ZoomableTimeSeriesChart
              id={`widget-${widget.id}`}
              title={widget.title}
              type={widget.dataSource === 'dailyActions' ? 'area' : 'line'}
              data={timeSeriesData}
              xKey="date"
              yKeys={widget.dataSource === 'dailyActions' ? ['deposits', 'withdrawals', 'bets', 'wins'] :
                    widget.dataSource === 'games' ? ['totalBets', 'totalWins', 'netGamingRevenue'] :
                    ['totalDeposits', 'totalBets', 'netGamingRevenue']}
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
              enableBrush={true}
              enableZoom={true}
              onClick={handleDrillDown}
            />
          );
        } else {
          return (
            <ReportAreaChart
              data={timeSeriesData}
              xKey="date"
              yKeys={widget.dataSource === 'dailyActions' ? ['deposits', 'withdrawals'] :
                    widget.dataSource === 'games' ? ['totalBets', 'totalWins'] :
                    ['totalDeposits', 'totalBets']}
              loading={loading}
              error={error}
              height={getWidgetSizeStyles().height - 60}
            />
          );
        }

      case 'heatmap':
        // Transform data for heatmap if needed
        let heatmapData = Array.isArray(data) ? data : [];
        if (widget.dataSource === 'dailyActions') {
          // Create heatmap data from daily actions
          // For demonstration, we'll create a day/hour heatmap with random values
          heatmapData = [];
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          for (let day = 0; day < days.length; day++) {
            for (let hour = 0; hour < 24; hour++) {
              heatmapData.push({
                day: days[day],
                hour,
                value: Math.floor(Math.random() * 100)
              });
            }
          }
        } else if (widget.dataSource === 'games') {
          // Not ideal for heatmap, but we can create a category/metric heatmap
          const categories = ['Slots', 'Table Games', 'Live Casino', 'Poker', 'Other'];
          const metrics = ['Bets', 'Wins', 'GGR', 'Players'];
          heatmapData = [];
          for (let category of categories) {
            for (let metric of metrics) {
              heatmapData.push({
                category,
                metric,
                value: Math.floor(Math.random() * 1000)
              });
            }
          }
        } else if (widget.dataSource === 'players') {
          // Not ideal for heatmap, but we can create a country/metric heatmap
          const countries = ['USA', 'UK', 'Canada', 'Germany', 'France'];
          const metrics = ['Deposits', 'Bets', 'Wins', 'GGR'];
          heatmapData = [];
          for (let country of countries) {
            for (let metric of metrics) {
              heatmapData.push({
                country,
                metric,
                value: Math.floor(Math.random() * 1000)
              });
            }
          }
        }

        return (
          <ReportHeatmap
            data={heatmapData}
            xKey={widget.dataSource === 'dailyActions' ? 'hour' :
                 widget.dataSource === 'games' ? 'metric' : 'metric'}
            yKey={widget.dataSource === 'dailyActions' ? 'day' :
                 widget.dataSource === 'games' ? 'category' : 'country'}
            valueKey="value"
            loading={loading}
            error={error}
            height={getWidgetSizeStyles().height - 60}
            title={widget.title}
          />
        );

      case 'networkGraph':
        // Create network graph data
        const networkData: { nodes: any[], links: any[] } = {
          nodes: [],
          links: []
        };

        if (widget.dataSource === 'players') {
          // Create player network based on common games
          const players = Array.isArray(data) ? data.slice(0, 20) : [];

          // Add nodes for players
          networkData.nodes = players.map(player => ({
            id: `player-${player.id}`,
            name: player.name,
            group: player.country || 'Unknown',
            value: player.totalDeposits || 1
          }));

          // Add links between players (simulated relationships)
          for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
              // Create links with 30% probability
              if (Math.random() < 0.3) {
                networkData.links.push({
                  source: `player-${players[i].id}`,
                  target: `player-${players[j].id}`,
                  value: Math.floor(Math.random() * 10) + 1
                });
              }
            }
          }
        } else if (widget.dataSource === 'games') {
          // Create game network based on common players
          const games = Array.isArray(data) ? data.slice(0, 20) : [];

          // Add nodes for games
          networkData.nodes = games.map(game => ({
            id: `game-${game.id}`,
            name: game.name,
            group: game.category || 'Unknown',
            value: game.uniquePlayers || 1
          }));

          // Add links between games (simulated relationships)
          for (let i = 0; i < games.length; i++) {
            for (let j = i + 1; j < games.length; j++) {
              // Create links with 40% probability
              if (Math.random() < 0.4) {
                networkData.links.push({
                  source: `game-${games[i].id}`,
                  target: `game-${games[j].id}`,
                  value: Math.floor(Math.random() * 100) + 1
                });
              }
            }
          }
        }

        if (enableInteractivity) {
          return (
            <AdvancedVisualizationContainer
              id={`widget-${widget.id}`}
              title={widget.title}
              description={`Network visualization for ${widget.title}`}
              type="networkGraph"
              data={networkData}
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              enableFullscreen={true}
              enableExport={true}
              enableShare={false}
              enableNotifications={true}
              enableAnnotations={true}
            />
          );
        } else {
          return (
            <NetworkGraph
              id={`widget-${widget.id}`}
              title={widget.title}
              data={networkData}
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              enableNodeSelection={true}
              enableLinkSelection={true}
            />
          );
        }

      case 'sankeyDiagram':
        // Create sankey diagram data
        const sankeyData: { nodes: any[], links: any[] } = {
          nodes: [],
          links: []
        };

        if (widget.dataSource === 'dailyActions') {
          // Create flow diagram for player journey
          sankeyData.nodes = [
            { name: 'New Users' },
            { name: 'Registered' },
            { name: 'Deposited' },
            { name: 'Played' },
            { name: 'Won' },
            { name: 'Lost' },
            { name: 'Withdrew' },
            { name: 'Churned' },
            { name: 'Retained' }
          ];

          sankeyData.links = [
            { source: 0, target: 1, value: 1000 },
            { source: 1, target: 2, value: 800 },
            { source: 1, target: 7, value: 200 },
            { source: 2, target: 3, value: 750 },
            { source: 2, target: 7, value: 50 },
            { source: 3, target: 4, value: 400 },
            { source: 3, target: 5, value: 350 },
            { source: 4, target: 6, value: 300 },
            { source: 4, target: 8, value: 100 },
            { source: 5, target: 2, value: 200 },
            { source: 5, target: 7, value: 150 },
            { source: 6, target: 8, value: 200 },
            { source: 6, target: 7, value: 100 }
          ];
        } else if (widget.dataSource === 'games') {
          // Create flow diagram for game categories
          sankeyData.nodes = [
            { name: 'All Players' },
            { name: 'Slots' },
            { name: 'Table Games' },
            { name: 'Live Casino' },
            { name: 'Poker' },
            { name: 'High Value' },
            { name: 'Medium Value' },
            { name: 'Low Value' }
          ];

          sankeyData.links = [
            { source: 0, target: 1, value: 5000 },
            { source: 0, target: 2, value: 3000 },
            { source: 0, target: 3, value: 2000 },
            { source: 0, target: 4, value: 1000 },
            { source: 1, target: 5, value: 1500 },
            { source: 1, target: 6, value: 2000 },
            { source: 1, target: 7, value: 1500 },
            { source: 2, target: 5, value: 1200 },
            { source: 2, target: 6, value: 1000 },
            { source: 2, target: 7, value: 800 },
            { source: 3, target: 5, value: 1000 },
            { source: 3, target: 6, value: 700 },
            { source: 3, target: 7, value: 300 },
            { source: 4, target: 5, value: 500 },
            { source: 4, target: 6, value: 300 },
            { source: 4, target: 7, value: 200 }
          ];
        }

        if (enableInteractivity) {
          return (
            <AdvancedVisualizationContainer
              id={`widget-${widget.id}`}
              title={widget.title}
              description={`Sankey diagram for ${widget.title}`}
              type="sankeyDiagram"
              data={sankeyData}
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              enableFullscreen={true}
              enableExport={true}
              enableShare={false}
              enableNotifications={true}
              enableAnnotations={true}
            />
          );
        } else {
          return (
            <SankeyDiagram
              id={`widget-${widget.id}`}
              title={widget.title}
              data={sankeyData}
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              enableSearch={true}
              enableFiltering={true}
            />
          );
        }

      case '3dScatter':
      case '3dBar':
      case '3dSurface':
        // Create 3D data
        const points3D = [];

        if (widget.dataSource === 'dailyActions') {
          // Create 3D data from daily actions
          const dailyActions = Array.isArray(data) ? data : [];

          points3D.push(...dailyActions.map((item, index) => ({
            id: `point-${index}`,
            x: item.deposits || 0,
            y: item.withdrawals || 0,
            z: item.bets || 0,
            value: item.uniquePlayers || 0,
            label: formatDate(new Date(item.date), 'MMM dd, yyyy'),
            group: 'Daily Actions'
          })));
        } else if (widget.dataSource === 'games') {
          // Create 3D data from games
          const games = Array.isArray(data) ? data : [];

          points3D.push(...games.map((item, index) => ({
            id: `point-${index}`,
            x: item.totalBets || 0,
            y: item.totalWins || 0,
            z: item.netGamingRevenue || 0,
            value: item.uniquePlayers || 0,
            label: item.name,
            group: item.category || 'Unknown'
          })));
        } else if (widget.dataSource === 'players') {
          // Create 3D data from players
          const players = Array.isArray(data) ? data : [];

          points3D.push(...players.map((item, index) => ({
            id: `point-${index}`,
            x: item.totalDeposits || 0,
            y: item.totalBets || 0,
            z: item.netGamingRevenue || 0,
            value: item.totalWins || 0,
            label: item.name,
            group: item.country || 'Unknown'
          })));
        }

        if (enableInteractivity) {
          return (
            <AdvancedVisualizationContainer
              id={`widget-${widget.id}`}
              title={widget.title}
              description={`3D visualization for ${widget.title}`}
              type={widget.type as any}
              data={points3D}
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              enableFullscreen={true}
              enableExport={true}
              enableShare={false}
              enableNotifications={true}
              enableAnnotations={true}
            />
          );
        } else {
          return (
            <Interactive3DChart
              id={`widget-${widget.id}`}
              title={widget.title}
              data={points3D}
              xLabel={widget.dataSource === 'dailyActions' ? 'Deposits' :
                     widget.dataSource === 'games' ? 'Total Bets' : 'Total Deposits'}
              yLabel={widget.dataSource === 'dailyActions' ? 'Withdrawals' :
                     widget.dataSource === 'games' ? 'Total Wins' : 'Total Bets'}
              zLabel={widget.dataSource === 'dailyActions' ? 'Bets' :
                     widget.dataSource === 'games' ? 'Net Gaming Revenue' : 'Net Gaming Revenue'}
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              chartType={widget.type === '3dScatter' ? '3dScatter' : widget.type === '3dBar' ? '3dBar' : '3dSurface'}
            />
          );
        }

      case 'surfacePlot':
        // Create surface data
        interface SurfaceDataPoint {
          x: number;
          y: number;
          z: number;
          date?: string;
          metric?: string;
          category?: string;
          game?: string;
          country?: string;
          player?: string;
        }
        const surfaceData: SurfaceDataPoint[] = [];

        if (widget.dataSource === 'dailyActions') {
          // Create surface data from daily actions
          const dailyActions = Array.isArray(data) ? data : [];

          // Group by date (x) and metric (y)
          const metrics = ['deposits', 'withdrawals', 'bets', 'wins', 'uniquePlayers'];
          const dateMap = new Map();

          // Process each daily action
          dailyActions.forEach(item => {
            const date = new Date(item.date);
            const x = date.getTime(); // Use timestamp as x coordinate

            // Add a data point for each metric
            metrics.forEach((metric, metricIndex) => {
              const y = metricIndex; // Use metric index as y coordinate
              const z = item[metric] || 0; // Use metric value as z coordinate

              surfaceData.push({
                x,
                y,
                z,
                date: formatDate(date, 'MMM dd, yyyy'),
                metric
              });
            });
          });
        } else if (widget.dataSource === 'games') {
          // Create surface data from games
          const games = Array.isArray(data) ? data : [];

          // Group by category (x) and metric (y)
          const metrics = ['totalBets', 'totalWins', 'netGamingRevenue', 'uniquePlayers'];
          const categories = Array.from(new Set(games.map(game => game.category || 'Unknown')));

          // Process each game
          games.forEach(game => {
            const categoryIndex = categories.indexOf(game.category || 'Unknown');
            const x = categoryIndex; // Use category index as x coordinate

            // Add a data point for each metric
            metrics.forEach((metric, metricIndex) => {
              const y = metricIndex; // Use metric index as y coordinate
              const z = game[metric] || 0; // Use metric value as z coordinate

              surfaceData.push({
                x,
                y,
                z,
                category: game.category || 'Unknown',
                metric,
                game: game.name
              });
            });
          });
        } else if (widget.dataSource === 'players') {
          // Create surface data from players
          const players = Array.isArray(data) ? data : [];

          // Group by country (x) and metric (y)
          const metrics = ['totalDeposits', 'totalBets', 'totalWins', 'netGamingRevenue'];
          const countries = Array.from(new Set(players.map(player => player.country || 'Unknown')));

          // Process each player
          players.forEach(player => {
            const countryIndex = countries.indexOf(player.country || 'Unknown');
            const x = countryIndex; // Use country index as x coordinate

            // Add a data point for each metric
            metrics.forEach((metric, metricIndex) => {
              const y = metricIndex; // Use metric index as y coordinate
              const z = player[metric] || 0; // Use metric value as z coordinate

              surfaceData.push({
                x,
                y,
                z,
                country: player.country || 'Unknown',
                metric,
                player: player.name
              });
            });
          });
        }

        if (enableInteractivity) {
          return (
            <Surface3DPlot
              id={`widget-${widget.id}`}
              title={widget.title}
              data={surfaceData}
              xLabel={widget.dataSource === 'dailyActions' ? 'Date' :
                     widget.dataSource === 'games' ? 'Game Category' : 'Country'}
              yLabel={widget.dataSource === 'dailyActions' ? 'Metric' :
                     widget.dataSource === 'games' ? 'Metric' : 'Metric'}
              zLabel="Value"
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              resolution={50}
              interpolationMethod="bilinear"
              colorMap="rainbow"
              wireframe={true}
              enableRotation={true}
              enableZoom={true}
              enableGrid={true}
              enableAxes={true}
              onPointClick={(point) => handleDrillDown(point, 0)}
            />
          );
        } else {
          return (
            <Surface3DPlot
              id={`widget-${widget.id}`}
              title={widget.title}
              data={surfaceData}
              xLabel={widget.dataSource === 'dailyActions' ? 'Date' :
                     widget.dataSource === 'games' ? 'Game Category' : 'Country'}
              yLabel={widget.dataSource === 'dailyActions' ? 'Metric' :
                     widget.dataSource === 'games' ? 'Metric' : 'Metric'}
              zLabel="Value"
              height={getWidgetSizeStyles().height - 60}
              loading={loading}
              error={error}
              resolution={30}
              interpolationMethod="bilinear"
              colorMap="rainbow"
              wireframe={true}
              enableRotation={true}
              enableZoom={true}
              enableGrid={true}
              enableAxes={true}
            />
          );
        }
      case 'table':
        return (
          <SimpleBox sx={{ height: getWidgetSizeStyles().height - 60, overflow: 'auto' }}>
            <EnhancedTable
              columns={columns}
              data={Array.isArray(data) ? data.slice(0, 5) : []}
              loading={loading}
              emptyMessage="No data available"
              idField="id"
              features={{
                sorting: true,
                pagination: {
                  enabled: true,
                  defaultPageSize: 5,
                  pageSizeOptions: [5, 10, 25]
                }
              }}
            />
          </SimpleBox>
        );
      case 'summary':
        // Create summary cards
        return (
          <SimpleBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2 }}>
            {widget.dataSource === 'dailyActions' && (
              <>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Players</Typography>
                  <Typography variant="h5">
                    {Array.isArray(data) ? data.reduce((sum, item) => sum + (item.uniquePlayers || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Deposits</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.deposits || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Bets</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.bets || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total GGR</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.ggr || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
              </>
            )}
            {widget.dataSource === 'players' && (
              <>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Players</Typography>
                  <Typography variant="h5">
                    {Array.isArray(data) ? data.length.toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Active Players</Typography>
                  <Typography variant="h5">
                    {Array.isArray(data) ? data.filter(player => player.status === 'Active').length.toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Deposits</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.totalDeposits || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total NGR</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.netGamingRevenue || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
              </>
            )}
            {widget.dataSource === 'games' && (
              <>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Games</Typography>
                  <Typography variant="h5">
                    {Array.isArray(data) ? data.length.toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Bets</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.totalBets || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Wins</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.totalWins || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
                <SimpleBox sx={{ flex: '1 1 calc(50% - 8px)', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total NGR</Typography>
                  <Typography variant="h5">
                    ${Array.isArray(data) ? data.reduce((sum, item) => sum + (item.netGamingRevenue || 0), 0).toLocaleString() : 0}
                  </Typography>
                </SimpleBox>
              </>
            )}
          </SimpleBox>
        );
      default:
        return (
          <SimpleBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">Unknown widget type</Typography>
          </SimpleBox>
        );
    }
  };

  return (
    <>
      <Paper
        sx={{
          ...getWidgetSizeStyles(),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: customizeMode ? `2px dashed ${theme.palette.primary.main}` : 'none',
          transition: 'all 0.3s ease'
        }}
        elevation={customizeMode ? 0 : 1}
      >
        <SimpleBox
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6">{widget.title}</Typography>
          {customizeMode && (
            <IconButton
              size="small"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => onMenuOpen && onMenuOpen(e, widget.id)}
              aria-label="widget options"
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </SimpleBox>
        <SimpleBox sx={{ flex: 1, overflow: 'auto', p: 1 }}>
          {renderWidgetContent()}
        </SimpleBox>
      </Paper>

      {/* Drilldown Modal */}
      <DrilldownModal
        open={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        drilldownData={drilldownData}
      />
    </>
  );
};

export default DashboardWidget;
