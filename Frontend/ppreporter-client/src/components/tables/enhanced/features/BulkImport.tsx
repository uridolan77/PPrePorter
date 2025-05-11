import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { BulkImportConfig, ColumnDef } from '../types';

interface BulkImportProps {
  config: BulkImportConfig;
  columns: ColumnDef[];
  onImport: (data: any[]) => void;
}

/**
 * Bulk import component
 */
const BulkImport: React.FC<BulkImportProps> = ({
  config,
  columns,
  onImport
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Open dialog
  const handleOpen = () => {
    setOpen(true);
    setFile(null);
    setError(null);
    setPreview([]);
  };
  
  // Close dialog
  const handleClose = () => {
    setOpen(false);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    
    // Check file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileType || !config.formats.includes(fileType as any)) {
      setError(`Unsupported file format. Supported formats: ${config.formats.join(', ')}`);
      return;
    }
    
    // Parse file
    parseFile(selectedFile);
  };
  
  // Parse file based on type
  const parseFile = (file: File) => {
    setLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: any[] = [];
        
        // Parse based on file type
        const fileType = file.name.split('.').pop()?.toLowerCase();
        
        if (fileType === 'csv') {
          data = parseCSV(content);
        } else if (fileType === 'json') {
          data = JSON.parse(content);
        } else if (fileType === 'excel' || fileType === 'xlsx' || fileType === 'xls') {
          // For Excel files, we would need a library like xlsx
          // This is a simplified version
          setError('Excel parsing requires additional libraries. Please use CSV or JSON.');
          setLoading(false);
          return;
        }
        
        // Validate data
        if (!Array.isArray(data)) {
          setError('Invalid data format. Expected an array of objects.');
          setLoading(false);
          return;
        }
        
        // Validate each row if configured
        if (config.validateRow) {
          const validationErrors: string[] = [];
          
          data.forEach((row, index) => {
            const result = config.validateRow!(row);
            if (!result.valid) {
              validationErrors.push(`Row ${index + 1}: ${result.errors.join(', ')}`);
            }
          });
          
          if (validationErrors.length > 0) {
            setError(`Validation errors:\n${validationErrors.join('\n')}`);
            setLoading(false);
            return;
          }
        }
        
        // Set preview data (limited to 5 rows)
        setPreview(data.slice(0, 5));
        setLoading(false);
      } catch (err) {
        setError(`Error parsing file: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  // Parse CSV content
  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n');
    if (lines.length === 0) return [];
    
    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      return row;
    });
    
    return data;
  };
  
  // Handle import
  const handleImport = () => {
    if (!file) return;
    
    setLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: any[] = [];
        
        // Parse based on file type
        const fileType = file.name.split('.').pop()?.toLowerCase();
        
        if (fileType === 'csv') {
          data = parseCSV(content);
        } else if (fileType === 'json') {
          data = JSON.parse(content);
        }
        
        // Validate data
        if (!Array.isArray(data)) {
          setError('Invalid data format. Expected an array of objects.');
          setLoading(false);
          return;
        }
        
        // Validate each row if configured
        if (config.validateRow) {
          const validationErrors: string[] = [];
          
          data.forEach((row, index) => {
            const result = config.validateRow!(row);
            if (!result.valid) {
              validationErrors.push(`Row ${index + 1}: ${result.errors.join(', ')}`);
            }
          });
          
          if (validationErrors.length > 0) {
            setError(`Validation errors:\n${validationErrors.join('\n')}`);
            setLoading(false);
            return;
          }
        }
        
        // Call import handler
        onImport(data);
        
        // Close dialog
        setLoading(false);
        handleClose();
      } catch (err) {
        setError(`Error parsing file: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <>
      <Tooltip title="Import data">
        <IconButton size="small" onClick={handleOpen}>
          <UploadFileIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Import Data</DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Upload a file to import data. Supported formats: {config.formats.join(', ')}
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ mt: 1 }}
            >
              Select File
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={config.formats.map(f => `.${f}`).join(',')}
                onChange={handleFileChange}
              />
            </Button>
            
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            )}
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          {preview.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview (first 5 rows):
              </Typography>
              
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, valueIndex) => (
                          <td key={valueIndex} style={{ border: '1px solid #ddd', padding: 8 }}>
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading || !!error}
            variant="contained"
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkImport;
