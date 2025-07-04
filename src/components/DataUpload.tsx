/**
 * Data Upload Component
 * Handles file upload, data parsing, and validation for statistical visualization
 */

import React, { useState, useCallback, useRef } from 'react';
import { createError } from '../utils/errorHandling';
import { useTranslations } from '../hooks/useTranslations';
import { type DataSeries, type DataImport } from '../types/visualization';
import { type ProcessedSCBData } from '../utils/scbDataProcessing';

interface DataUploadProps {
  /** Callback when data is successfully uploaded and processed */
  onDataUploaded: (dataSeries: DataSeries) => void;
  /** Whether upload is currently disabled */
  disabled?: boolean;
  /** Accepted file types */
  acceptedTypes?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** CSS class name for styling */
  className?: string;
}

interface UploadState {
  isDragging: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  preview: any[] | null;
  columnMappings: {
    entityId: string;
    value: string;
    label: string;
    timestamp: string;
  };
  identifierType: 'id' | 'name' | 'isoCode' | 'postalCode';
}

const DEFAULT_ACCEPTED_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DataUpload: React.FC<DataUploadProps> = React.memo(({
  onDataUploaded,
  disabled = false,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSize = MAX_FILE_SIZE,
  className = ''
}) => {
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<UploadState>({
    isDragging: false,
    isProcessing: false,
    progress: 0,
    error: null,
    preview: null,
    columnMappings: {
      entityId: '',
      value: '',
      label: '',
      timestamp: ''
    },
    identifierType: 'name'
  });

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!acceptedTypes.includes(file.type) && !isValidFileExtension(file.name)) {
      setState(prev => ({
        ...prev,
        error: t('dataUpload.errors.invalidFileType', { types: acceptedTypes.join(', ') })
      }));
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setState(prev => ({
        ...prev,
        error: t('dataUpload.errors.fileTooLarge', { maxSize: formatFileSize(maxSize) })
      }));
      return;
    }

    processFile(file);
  }, [acceptedTypes, maxSize, t]);

  /**
   * Process uploaded file
   */
  const processFile = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      error: null,
      preview: null
    }));

    try {
      const fileType = getFileType(file);
      const rawData = await readFile(file, fileType);
      
      setState(prev => ({ ...prev, progress: 50 }));

      const parsedData = await parseData(rawData, fileType);
      const preview = parsedData.slice(0, 5); // Show first 5 rows
      
      setState(prev => ({
        ...prev,
        progress: 100,
        isProcessing: false,
        preview,
        columnMappings: autoDetectColumns(parsedData)
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      createError(
        'File processing failed',
        { source: 'DataUpload', function: 'processFile', data: { fileName: file.name, error: errorMessage } },
        'medium'
      );
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Handle drag and drop events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));
    
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [disabled, handleFileSelect]);

  /**
   * Update column mappings
   */
  const updateColumnMapping = useCallback((field: keyof UploadState['columnMappings'], value: string) => {
    setState(prev => ({
      ...prev,
      columnMappings: {
        ...prev.columnMappings,
        [field]: value
      }
    }));
  }, []);

  /**
   * Update identifier type
   */
  const updateIdentifierType = useCallback((type: UploadState['identifierType']) => {
    setState(prev => ({ ...prev, identifierType: type }));
  }, []);

  /**
   * Finalize data upload
   */
  const finalizeUpload = useCallback(() => {
    if (!state.preview || !state.columnMappings.entityId || !state.columnMappings.value) {
      setState(prev => ({ ...prev, error: 'Please map required columns (Entity ID and Value)' }));
      return;
    }

    try {
      const dataSeries = createDataSeries(state.preview, state.columnMappings, state.identifierType);
      onDataUploaded(dataSeries);
      
      // Reset state
      setState({
        isDragging: false,
        isProcessing: false,
        progress: 0,
        error: null,
        preview: null,
        columnMappings: {
          entityId: '',
          value: '',
          label: '',
          timestamp: ''
        },
        identifierType: 'name'
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create data series';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, [state.preview, state.columnMappings, state.identifierType, onDataUploaded]);

  /**
   * Clear current upload
   */
  const clearUpload = useCallback(() => {
    setState(prev => ({
      ...prev,
      preview: null,
      error: null,
      columnMappings: {
        entityId: '',
        value: '',
        label: '',
        timestamp: ''
      }
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Get available columns for mapping
  const availableColumns = state.preview ? Object.keys(state.preview[0] || {}) : [];

  return (
    <div className={`data-upload ${className}`} data-testid="data-upload">
      {!state.preview ? (
        // File upload area
        <div
          className={`upload-area ${state.isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          data-testid="upload-area"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
            disabled={disabled}
            data-testid="file-input"
          />
          
          <div className="upload-content">
            {state.isProcessing ? (
              <div className="processing">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
                <p>{t('dataUpload.processing')}</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">📊</div>
                <h3>{t('dataUpload.title')}</h3>
                <p>{t('dataUpload.description')}</p>
                <p className="file-types">
                  {t('dataUpload.supportedTypes')}: CSV, JSON, Excel
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        // Column mapping area
        <div className="mapping-area" data-testid="mapping-area">
          <div className="mapping-header">
            <h3>{t('dataUpload.mapping.title')}</h3>
            <button 
              onClick={clearUpload}
              className="clear-button"
              data-testid="clear-button"
            >
              {t('dataUpload.mapping.clear')}
            </button>
          </div>

          <div className="preview-table">
            <h4>{t('dataUpload.preview.title')}</h4>
            <table>
              <thead>
                <tr>
                  {availableColumns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.preview.slice(0, 3).map((row, index) => (
                  <tr key={index}>
                    {availableColumns.map(col => (
                      <td key={col}>{String(row[col] || '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="column-mappings">
            <h4>{t('dataUpload.mapping.columns')}</h4>
            
            <div className="mapping-field">
              <label>{t('dataUpload.mapping.entityId')} *</label>
              <select
                value={state.columnMappings.entityId}
                onChange={(e) => updateColumnMapping('entityId', e.target.value)}
                data-testid="entity-id-select"
              >
                <option value="">{t('dataUpload.mapping.selectColumn')}</option>
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="mapping-field">
              <label>{t('dataUpload.mapping.value')} *</label>
              <select
                value={state.columnMappings.value}
                onChange={(e) => updateColumnMapping('value', e.target.value)}
                data-testid="value-select"
              >
                <option value="">{t('dataUpload.mapping.selectColumn')}</option>
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="mapping-field">
              <label>{t('dataUpload.mapping.label')}</label>
              <select
                value={state.columnMappings.label}
                onChange={(e) => updateColumnMapping('label', e.target.value)}
                data-testid="label-select"
              >
                <option value="">{t('dataUpload.mapping.selectColumn')}</option>
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="mapping-field">
              <label>{t('dataUpload.mapping.identifierType')}</label>
              <select
                value={state.identifierType}
                onChange={(e) => updateIdentifierType(e.target.value as UploadState['identifierType'])}
                data-testid="identifier-type-select"
              >
                <option value="name">{t('dataUpload.mapping.types.name')}</option>
                <option value="id">{t('dataUpload.mapping.types.id')}</option>
                <option value="isoCode">{t('dataUpload.mapping.types.isoCode')}</option>
                <option value="postalCode">{t('dataUpload.mapping.types.postalCode')}</option>
              </select>
            </div>
          </div>

          <div className="upload-actions">
            <button
              onClick={finalizeUpload}
              disabled={!state.columnMappings.entityId || !state.columnMappings.value}
              className="upload-button"
              data-testid="finalize-upload-button"
            >
              {t('dataUpload.finalize')}
            </button>
          </div>
        </div>
      )}

      {state.error && (
        <div className="error-message" data-testid="error-message">
          {state.error}
        </div>
      )}
    </div>
  );
});

DataUpload.displayName = 'DataUpload';

export default DataUpload;

// Helper functions

function isValidFileExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop();
  return ['csv', 'json', 'xls', 'xlsx'].includes(ext || '');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(file: File): 'csv' | 'json' | 'excel' {
  if (file.type === 'text/csv' || file.name.endsWith('.csv')) return 'csv';
  if (file.type === 'application/json' || file.name.endsWith('.json')) return 'json';
  return 'excel';
}

async function readFile(file: File, fileType: string): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => reject(new Error('File reading failed'));
    
    if (fileType === 'excel') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

async function parseData(data: string | ArrayBuffer, fileType: string): Promise<any[]> {
  switch (fileType) {
    case 'csv':
      return parseCSV(data as string);
    case 'json':
      return JSON.parse(data as string);
    case 'excel':
      // Would need a library like xlsx to parse Excel files
      throw new Error('Excel parsing not implemented yet');
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Try to parse as number, otherwise keep as string
      row[header] = isNaN(Number(value)) ? value : Number(value);
    });
    
    data.push(row);
  }
  
  return data;
}

function autoDetectColumns(data: any[]): UploadState['columnMappings'] {
  if (!data.length) return { entityId: '', value: '', label: '', timestamp: '' };
  
  const columns = Object.keys(data[0]);
  const mappings = { entityId: '', value: '', label: '', timestamp: '' };
  
  // Auto-detect entity ID column
  const entityIdCandidates = ['region', 'province', 'county', 'municipality', 'area', 'location', 'id', 'name'];
  mappings.entityId = columns.find(col => 
    entityIdCandidates.some(candidate => col.toLowerCase().includes(candidate))
  ) || columns[0];
  
  // Auto-detect value column (numeric)
  mappings.value = columns.find(col => {
    const sample = data[0][col];
    return typeof sample === 'number' || !isNaN(Number(sample));
  }) || '';
  
  // Auto-detect label column
  const labelCandidates = ['label', 'name', 'title', 'description'];
  mappings.label = columns.find(col => 
    labelCandidates.some(candidate => col.toLowerCase().includes(candidate))
  ) || '';
  
  return mappings;
}

function createDataSeries(
  data: any[], 
  mappings: UploadState['columnMappings'], 
  identifierType: UploadState['identifierType']
): DataSeries {
  const dataPoints = data.map(row => ({
    entityId: String(row[mappings.entityId] || ''),
    value: Number(row[mappings.value]) || 0,
    label: mappings.label ? String(row[mappings.label] || '') : undefined,
    timestamp: mappings.timestamp ? new Date(row[mappings.timestamp]) : undefined
  }));
  
  return {
    id: `series-${Date.now()}`,
    name: `Uploaded Data - ${mappings.value}`,
    description: `Data uploaded with ${identifierType} identifiers`,
    data: dataPoints,
    unit: detectUnit(mappings.value),
    type: 'numeric',
    colorScheme: 'sequential'
  };
}

function detectUnit(columnName: string): string {
  const lowerName = columnName.toLowerCase();
  
  if (lowerName.includes('population') || lowerName.includes('people')) return 'people';
  if (lowerName.includes('percent') || lowerName.includes('%')) return '%';
  if (lowerName.includes('rate')) return 'rate';
  if (lowerName.includes('income') || lowerName.includes('salary')) return 'SEK';
  if (lowerName.includes('area') || lowerName.includes('km')) return 'km²';
  if (lowerName.includes('density')) return '/km²';
  
  return '';
}