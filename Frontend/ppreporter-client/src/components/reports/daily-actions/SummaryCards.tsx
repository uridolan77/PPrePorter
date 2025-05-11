import React from 'react';
import { Grid } from '@mui/material';
import KPICard from '../../common/KPICard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CasinoIcon from '@mui/icons-material/Casino';
import { DailyActionsSummary } from '../../../types/reports';

interface SummaryCardsProps {
  summary: DailyActionsSummary | null;
  isLoading: boolean;
  error: string | null;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading, error }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Total Players"
          value={summary?.totalPlayers || 0}
          trend={summary?.playersTrend || null}
          icon={<PeopleAltIcon />}
          loading={isLoading}
          error={error}
          description="Total number of unique players"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="New Registrations"
          value={summary?.newRegistrations || 0}
          trend={summary?.registrationsTrend || null}
          icon={<PersonAddIcon />}
          loading={isLoading}
          error={error}
          description="New player registrations"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Total Deposits"
          value={summary?.totalDeposits || 0}
          trend={summary?.depositsTrend || null}
          prefix="$"
          icon={<MonetizationOnIcon />}
          loading={isLoading}
          error={error}
          description="Total deposit amount"
          valueFormatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Total Bets"
          value={summary?.totalBets || 0}
          trend={summary?.betsTrend || null}
          prefix="$"
          icon={<CasinoIcon />}
          loading={isLoading}
          error={error}
          description="Total bet amount"
          valueFormatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        />
      </Grid>
    </Grid>
  );
};

export default SummaryCards;
