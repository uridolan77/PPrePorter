import React from 'react';
import {
  Box,
  Chip,
  Avatar,
  Rating,
  LinearProgress,
  Badge,
  Typography,
  useTheme
} from '@mui/material';
import { CustomRenderersConfig } from '../types';

interface CustomRendererProps {
  value: any;
  row: any;
  column: any;
  config: CustomRenderersConfig;
}

/**
 * Custom cell renderer component
 */
const CustomRenderer: React.FC<CustomRendererProps> = ({
  value,
  row,
  column,
  config
}) => {
  const theme = useTheme();
  
  if (!config.enabled) {
    return <>{value}</>;
  }
  
  // Check for conditional renderers
  if (config.conditionalRenderers && config.conditionalRenderers.length > 0) {
    for (const conditionalRenderer of config.conditionalRenderers) {
      if (conditionalRenderer.condition(value, row, column)) {
        return conditionalRenderer.renderer(value, row, column);
      }
    }
  }
  
  // Check for column type renderers
  if (column.type && config.renderers && config.renderers[column.type]) {
    return config.renderers[column.type](value, row, column);
  }
  
  // Default rendering
  return <>{value}</>;
};

/**
 * Default renderers for common cell types
 */
export const DefaultRenderers: Record<string, (value: any, row: any, column: any) => React.ReactNode> = {
  // Status renderer with colored chip
  status: (value, row, column) => {
    if (!value) return '-';
    
    const statusColors: Record<string, any> = {
      active: 'success',
      inactive: 'default',
      pending: 'warning',
      error: 'error',
      completed: 'success',
      processing: 'info',
      cancelled: 'error',
      approved: 'success',
      rejected: 'error',
      draft: 'default'
    };
    
    const color = statusColors[value.toLowerCase()] || 'default';
    
    return (
      <Chip
        label={value}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  },
  
  // User renderer with avatar and name
  user: (value, row, column) => {
    if (!value) return '-';
    
    const name = typeof value === 'string' ? value : value.name || value.username || '';
    const avatar = typeof value === 'object' ? value.avatar || value.profilePic : '';
    const email = typeof value === 'object' ? value.email : '';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          src={avatar}
          alt={name}
          sx={{ width: 24, height: 24, mr: 1 }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {name}
          </Typography>
          {email && (
            <Typography variant="caption" color="text.secondary">
              {email}
            </Typography>
          )}
        </Box>
      </Box>
    );
  },
  
  // Rating renderer with stars
  rating: (value, row, column) => {
    if (value === null || value === undefined) return '-';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return value;
    
    const max = column.ratingMax || 5;
    
    return (
      <Rating
        value={numValue}
        max={max}
        precision={0.5}
        size="small"
        readOnly
      />
    );
  },
  
  // Progress renderer with progress bar
  progress: (value, row, column) => {
    if (value === null || value === undefined) return '-';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return value;
    
    const color = column.progressColor || 'primary';
    const showValue = column.showProgressValue !== false;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, numValue))}
            color={color}
          />
        </Box>
        {showValue && (
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {`${Math.round(numValue)}%`}
            </Typography>
          </Box>
        )}
      </Box>
    );
  },
  
  // Badge renderer with count
  badge: (value, row, column) => {
    if (value === null || value === undefined) return '-';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return value;
    
    const color = column.badgeColor || 'primary';
    const max = column.badgeMax || 99;
    const content = column.badgeContent || '';
    
    return (
      <Badge
        badgeContent={numValue}
        color={color}
        max={max}
        showZero={column.showZeroBadge}
      >
        <Typography variant="body2">
          {content}
        </Typography>
      </Badge>
    );
  },
  
  // Boolean renderer with icon or text
  boolean: (value, row, column) => {
    const trueIcon = column.trueIcon || '✓';
    const falseIcon = column.falseIcon || '✗';
    const trueColor = column.trueColor || 'success.main';
    const falseColor = column.falseColor || 'error.main';
    
    return (
      <Typography
        variant="body2"
        sx={{ color: value ? trueColor : falseColor, fontWeight: 'bold' }}
      >
        {value ? trueIcon : falseIcon}
      </Typography>
    );
  },
  
  // Date renderer with formatting
  date: (value, row, column) => {
    if (!value) return '-';
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      
      const format = column.dateFormat || 'medium';
      
      switch (format) {
        case 'short':
          return date.toLocaleDateString();
        case 'long':
          return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        case 'relative':
          return getRelativeTimeString(date);
        case 'datetime':
          return date.toLocaleString();
        case 'time':
          return date.toLocaleTimeString();
        case 'medium':
        default:
          return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
      }
    } catch (error) {
      return value;
    }
  },
  
  // Tags renderer with multiple chips
  tags: (value, row, column) => {
    if (!value || !Array.isArray(value) || value.length === 0) return '-';
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {value.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>
    );
  }
};

/**
 * Get relative time string
 */
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default CustomRenderer;
