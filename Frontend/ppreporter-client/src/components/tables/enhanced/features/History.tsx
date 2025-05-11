import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { HistoryConfig, TableState } from '../types';

interface HistoryProps {
  config: HistoryConfig;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * History component with undo/redo buttons
 */
const History: React.FC<HistoryProps> = ({
  config,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Undo">
        <span>
          <IconButton
            size="small"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      
      <Tooltip title="Redo">
        <span>
          <IconButton
            size="small"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

/**
 * Create a history manager for undo/redo functionality
 */
export const useTableHistory = (
  config: HistoryConfig,
  initialState: TableState,
  onStateChange: (state: TableState) => void
) => {
  // History stacks
  const [past, setPast] = useState<TableState[]>([]);
  const [future, setFuture] = useState<TableState[]>([]);
  const [current, setCurrent] = useState<TableState>(initialState);
  
  // Check if we can undo/redo
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;
  
  // Update state with history tracking
  const updateState = (newState: TableState) => {
    // Add current state to past
    setPast(prev => {
      const newPast = [...prev, current];
      // Limit history length if configured
      if (config.maxHistoryLength && newPast.length > config.maxHistoryLength) {
        return newPast.slice(newPast.length - config.maxHistoryLength);
      }
      return newPast;
    });
    
    // Clear future
    setFuture([]);
    
    // Update current state
    setCurrent(newState);
    
    // Notify parent
    onStateChange(newState);
  };
  
  // Undo action
  const undo = () => {
    if (!canUndo) return;
    
    // Get previous state
    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    // Update stacks
    setPast(newPast);
    setFuture([current, ...future]);
    
    // Update current state
    setCurrent(previousState);
    
    // Notify parent
    onStateChange(previousState);
  };
  
  // Redo action
  const redo = () => {
    if (!canRedo) return;
    
    // Get next state
    const nextState = future[0];
    const newFuture = future.slice(1);
    
    // Update stacks
    setPast([...past, current]);
    setFuture(newFuture);
    
    // Update current state
    setCurrent(nextState);
    
    // Notify parent
    onStateChange(nextState);
  };
  
  return {
    current,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

export default History;
