import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

export interface AnnotationData {
  title: string;
  description: string;
  insights: string[];
}

interface DataAnnotationProps {
  data: AnnotationData;
}

/**
 * DataAnnotation component for displaying insights and annotations for data visualizations
 */
const DataAnnotation: React.FC<DataAnnotationProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <InfoOutlinedIcon 
          color="primary" 
          sx={{ mr: 1.5, mt: 0.5 }} 
        />
        <Box>
          <Typography variant="h6" gutterBottom>
            {data.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {data.description}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LightbulbOutlinedIcon 
            color="warning" 
            sx={{ mr: 1 }} 
          />
          <Typography variant="subtitle2">
            Key Insights
          </Typography>
        </Box>
        
        <List dense disablePadding>
          {data.insights.map((insight, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {insight.includes('improved') || insight.includes('higher') || insight.includes('increase') ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : insight.includes('decreased') || insight.includes('lower') || insight.includes('decline') ? (
                  <TrendingDownIcon color="error" fontSize="small" />
                ) : (
                  <Chip 
                    label={`${index + 1}`} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      minWidth: 20,
                      fontSize: '0.75rem',
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText
                    }} 
                  />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={insight} 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  color: 'text.primary'
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default DataAnnotation;
