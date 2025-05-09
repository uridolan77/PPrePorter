import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

// Utilities
import { formatCurrency, formatNumber } from '../../../utils/formatters';

// Common components
import KPICard from '../../common/KPICard';

/**
 * Stats Summary Component
 * Displays key performance indicators in card format
 */
const StatsSummary = ({ 
  stats, 
  isLoading 
}) => {
  // Memoize the stats data to prevent unnecessary re-renders
  const statsData = useMemo(() => {
    return {
      revenue: {
        title: "Revenue",
        value: formatCurrency(stats?.revenue?.value || 0),
        trend: stats?.revenue?.change || 0,
        trendLabel: stats?.revenue?.period || 'vs last period',
        icon: <AttachMoneyIcon />,
        description: "Total revenue generated"
      },
      players: {
        title: "Players",
        value: formatNumber(stats?.players?.value || 0),
        trend: stats?.players?.change || 0,
        trendLabel: stats?.players?.period || 'vs last period',
        icon: <SportsEsportsIcon />,
        description: "Total active players"
      },
      newPlayers: {
        title: "New Players",
        value: formatNumber(stats?.newPlayers?.value || 0),
        trend: stats?.newPlayers?.change || 0,
        trendLabel: stats?.newPlayers?.period || 'vs last period',
        icon: <PersonAddIcon />,
        description: "Newly registered players"
      },
      gamesPlayed: {
        title: "Games Played",
        value: formatNumber(stats?.gamesPlayed?.value || 0),
        trend: stats?.gamesPlayed?.change || 0,
        trendLabel: stats?.gamesPlayed?.period || 'vs last period',
        icon: <VideogameAssetIcon />,
        description: "Total games played"
      }
    };
  }, [stats]);

  return (
    <Grid container spacing={3}>
      {/* Revenue Card */}
      <Grid item xs={12} sm={6} md={3}>
        <KPICard 
          title={statsData.revenue.title}
          value={statsData.revenue.value}
          trend={statsData.revenue.trend}
          trendLabel={statsData.revenue.trendLabel}
          icon={statsData.revenue.icon}
          loading={isLoading}
          description={statsData.revenue.description}
        />
      </Grid>
      
      {/* Players Card */}
      <Grid item xs={12} sm={6} md={3}>
        <KPICard 
          title={statsData.players.title}
          value={statsData.players.value}
          trend={statsData.players.trend}
          trendLabel={statsData.players.trendLabel}
          icon={statsData.players.icon}
          loading={isLoading}
          description={statsData.players.description}
        />
      </Grid>
      
      {/* New Players Card */}
      <Grid item xs={12} sm={6} md={3}>
        <KPICard 
          title={statsData.newPlayers.title}
          value={statsData.newPlayers.value}
          trend={statsData.newPlayers.trend}
          trendLabel={statsData.newPlayers.trendLabel}
          icon={statsData.newPlayers.icon}
          loading={isLoading}
          description={statsData.newPlayers.description}
        />
      </Grid>
      
      {/* Games Played Card */}
      <Grid item xs={12} sm={6} md={3}>
        <KPICard 
          title={statsData.gamesPlayed.title}
          value={statsData.gamesPlayed.value}
          trend={statsData.gamesPlayed.trend}
          trendLabel={statsData.gamesPlayed.trendLabel}
          icon={statsData.gamesPlayed.icon}
          loading={isLoading}
          description={statsData.gamesPlayed.description}
        />
      </Grid>
    </Grid>
  );
};

export default StatsSummary;
