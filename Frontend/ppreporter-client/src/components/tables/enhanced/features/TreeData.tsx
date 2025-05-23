import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TreeDataConfig } from '../types';
import SimpleBox from '../../../common/SimpleBox';

interface TreeNodeProps {
  row: any;
  level: number;
  config: TreeDataConfig;
  expanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
}

/**
 * Tree node component for hierarchical data
 */
export const TreeNode: React.FC<TreeNodeProps> = ({
  row,
  level,
  config,
  expanded,
  onToggle,
  hasChildren
}) => {
  const indent = level * (config.levelIndent || 20);

  return (
    <SimpleBox sx={{ display: 'flex', alignItems: 'center', pl: indent / 8 }}>
      {hasChildren ? (
        <IconButton
          size="small"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onToggle();
          }}
          sx={{ p: 0.5 }}
        >
          {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      ) : (
        <SimpleBox sx={{ width: 28 }} /> // Spacer for leaf nodes
      )}
      <Typography
        variant="body2"
        component="span"
        sx={{
          fontWeight: hasChildren ? 500 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {row._treeNodeLabel || row.name || row.label || row.title || row[config.labelField || 'label'] || ''}
      </Typography>
      {row._treeNodeCount !== undefined && (
        <Typography
          variant="caption"
          component="span"
          sx={{
            ml: 1,
            color: 'text.secondary',
            backgroundColor: 'action.hover',
            px: 0.5,
            borderRadius: 1
          }}
        >
          {row._treeNodeCount}
        </Typography>
      )}
    </SimpleBox>
  );
};

/**
 * Process data to create a hierarchical structure
 */
export const processTreeData = (
  data: any[],
  config: TreeDataConfig,
  expandedNodes: string[],
  idField: string
): any[] => {
  if (!config.enabled || !config.childField) {
    return data;
  }

  // Create a map of all nodes
  const nodeMap = new Map<string, any>();
  data.forEach(node => {
    nodeMap.set(node[idField], {
      ...node,
      _treeLevel: 0,
      _treeParent: null,
      _treeChildren: [],
      _treeNodeCount: 0,
      _treeExpanded: expandedNodes.includes(node[idField])
    });
  });

  // Build the tree structure
  const rootNodes: any[] = [];

  data.forEach(node => {
    const nodeId = node[idField];
    const children = node[config.childField];

    if (Array.isArray(children) && children.length > 0) {
      const treeNode = nodeMap.get(nodeId);
      if (treeNode) {
        treeNode._treeNodeCount = children.length;

        children.forEach((childId: string) => {
          const childNode = nodeMap.get(childId);
          if (childNode) {
            childNode._treeParent = nodeId;
            childNode._treeLevel = treeNode._treeLevel + 1;
            treeNode._treeChildren.push(childId);
          }
        });
      }
    }
  });

  // Identify root nodes (nodes without parents)
  nodeMap.forEach((node, nodeId) => {
    if (!node._treeParent) {
      rootNodes.push(node);
    }
  });

  // Flatten the tree for display
  const flattenedTree: any[] = [];

  const flattenNode = (node: any) => {
    flattenedTree.push(node);

    if (node._treeExpanded && node._treeChildren.length > 0) {
      node._treeChildren.forEach((childId: string) => {
        const childNode = nodeMap.get(childId);
        if (childNode) {
          flattenNode(childNode);
        }
      });
    }
  };

  rootNodes.forEach(flattenNode);

  return flattenedTree;
};

export default {
  TreeNode,
  processTreeData
};
