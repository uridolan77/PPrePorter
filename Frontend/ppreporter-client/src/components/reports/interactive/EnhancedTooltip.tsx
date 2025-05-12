import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { format as formatDate } from 'date-fns';
import { BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';

// Tooltip data type
export interface TooltipData {
  label: string;
  payload: {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
  }[];
  comparison?: {
    label: string;
    value: number;
    change: number;
    changePercentage: number;
  };
  trend?: {
    data: { value: number }[];
    color: string;
  };
  additionalInfo?: {
    label: string;
    value: string | number;
  }[];
}

// Enhanced tooltip props
interface EnhancedTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  tooltipData?: TooltipData;
  showComparison?: boolean;
  showTrend?: boolean;
  showAdditionalInfo?: boolean;
  formatter?: (value: any, name: string, props: any) => string;
}

/**
 * EnhancedTooltip component
 * Displays detailed information in chart tooltips
 */
const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  active,
  payload,
  label,
  tooltipData,
  showComparison = true,
  showTrend = true,
  showAdditionalInfo = true,
  formatter
}) => {
  const theme = useTheme();

  // If not active or no payload, return null
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format number
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Format value based on type
  const formatValue = (value: any, name: string): string => {
    if (formatter) {
      return formatter(value, name, {});
    }

    if (typeof value !== 'number') {
      return value?.toString() || '';
    }

    // Format based on name
    if (
      name.toLowerCase().includes('amount') ||
      name.toLowerCase().includes('revenue') ||
      name.toLowerCase().includes('deposit') ||
      name.toLowerCase().includes('withdrawal') ||
      name.toLowerCase().includes('bet') ||
      name.toLowerCase().includes('win') ||
      name.toLowerCase().includes('ggr') ||
      value >= 1000
    ) {
      return formatCurrency(value);
    } else if (
      name.toLowerCase().includes('percentage') ||
      name.toLowerCase().includes('rate') ||
      name.toLowerCase().includes('ratio')
    ) {
      return `${value.toFixed(2)}%`;
    } else {
      return formatNumber(value);
    }
  };

  // Get trend icon based on change percentage
  const getTrendIcon = (changePercentage: number) => {
    if (changePercentage > 0) {
      return <TrendingUpIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
    } else if (changePercentage < 0) {
      return <TrendingDownIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
    } else {
      return <TrendingFlatIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  // Get trend color based on change percentage
  const getTrendColor = (changePercentage: number) => {
    if (changePercentage > 0) {
      return theme.palette.success.main;
    } else if (changePercentage < 0) {
      return theme.palette.error.main;
    } else {
      return theme.palette.text.secondary;
    }
  };

  // Use tooltipData if provided, otherwise use payload
  const data: TooltipData = tooltipData || {
    label: label || '',
    payload: payload.map(item => ({
      name: item.name,
      value: item.value,
      color: item.color || item.fill || theme.palette.primary.main
    }))
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1.5,
        maxWidth: 300,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.95)
      }}
    >
      {/* Label */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {typeof data.label === 'string' && data.label.includes('T')
          ? formatDate(new Date(data.label), 'MMM dd, yyyy')
          : data.label}
      </Typography>

      {/* Main data */}
      {data.payload.map((entry, index) => (
        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              marginRight: 8,
              borderRadius: '50%'
            }}
          />
          <Typography variant="body2" sx={{ flex: 1 }}>
            {entry.name}
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {formatValue(entry.value, entry.name)}
          </Typography>
        </div>
      ))}

      {/* Comparison data */}
      {showComparison && data.comparison && (
        <>
          <Divider sx={{ my: 1 }} />
          <div style={{ marginBottom: '8px' }}>
            <Typography variant="caption" color="text.secondary">
              {data.comparison.label}
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {formatValue(data.comparison.value, 'comparison')}
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getTrendIcon(data.comparison.changePercentage)}
                <Typography
                  variant="body2"
                  sx={{ ml: 0.5, color: getTrendColor(data.comparison.changePercentage) }}
                >
                  {formatPercentage(data.comparison.changePercentage)}
                </Typography>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Trend mini chart */}
      {showTrend && data.trend && data.trend.data && (
        <div style={{ height: 40, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend.data}>
              <Bar dataKey="value" fill={data.trend?.color || '#1976d2'}>
                {data.trend.data.map((entry: any, index: number) => {
                  const trendData = data.trend;
                  if (!trendData) return null;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={trendData.color || '#1976d2'}
                      fillOpacity={0.6 + (index / trendData.data.length) * 0.4}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Additional information */}
      {showAdditionalInfo && data.additionalInfo && data.additionalInfo.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          {data.additionalInfo.map((info: { label: string, value: string | number }, index: number) => (
            <div key={`info-${index}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Typography variant="caption" color="text.secondary">
                {info.label}
              </Typography>
              <Typography variant="caption" fontWeight="medium">
                {typeof info.value === 'number' ? formatValue(info.value, info.label) : info.value}
              </Typography>
            </div>
          ))}
        </>
      )}
    </Paper>
  );
};

export default EnhancedTooltip;
