import React from 'react';
import { Box, Typography } from '@mui/material';
import { SearchHighlightingConfig } from '../types';

interface HighlightedTextProps {
  text: string;
  searchTerm: string;
  config: SearchHighlightingConfig;
}

/**
 * Highlighted text component
 */
const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  searchTerm,
  config
}) => {
  if (!searchTerm || !config.enabled) {
    return <>{text}</>;
  }
  
  // Escape special characters in search term
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex for case-insensitive search
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  // Split text by search term
  const parts = text.split(regex);
  
  // Default highlight style
  const defaultStyle = {
    backgroundColor: 'yellow',
    fontWeight: 'bold'
  };
  
  // Use configured style or default
  const highlightStyle = config.highlightStyle || defaultStyle;
  
  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches the search term
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
        
        return isMatch ? (
          <Typography
            key={index}
            component="span"
            sx={highlightStyle}
          >
            {part}
          </Typography>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </>
  );
};

/**
 * Highlight search terms in cell content
 */
export const highlightSearchInContent = (
  content: React.ReactNode,
  searchTerm: string,
  config: SearchHighlightingConfig
): React.ReactNode => {
  // If no search term or highlighting is disabled, return content as is
  if (!searchTerm || !config.enabled) {
    return content;
  }
  
  // If content is a string, highlight it
  if (typeof content === 'string') {
    return (
      <HighlightedText
        text={content}
        searchTerm={searchTerm}
        config={config}
      />
    );
  }
  
  // If content is a number, convert to string and highlight
  if (typeof content === 'number') {
    return (
      <HighlightedText
        text={content.toString()}
        searchTerm={searchTerm}
        config={config}
      />
    );
  }
  
  // For other types, return as is
  return content;
};

export default HighlightedText;
