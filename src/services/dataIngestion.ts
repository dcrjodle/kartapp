/**
 * Generic data ingestion system for processing external data sources
 */

// Removed unused imports - LLM handles data processing
import { createError, withErrorHandling } from '../utils/errorHandling';

export class DataIngestionError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DataIngestionError';
  }
}

/**
 * Extract raw content for LLM processing
 * Simplified parsing - LLM will handle structure interpretation
 */
export const extractRawContent = (fileContent: string, fileType: 'csv' | 'json'): string => {
  try {
    if (fileType === 'json') {
      // Validate JSON format but don't parse structure
      JSON.parse(fileContent);
    }
    
    console.log(`✅ Raw content extracted for LLM processing: ${fileContent.length} characters`);
    return fileContent.trim();
  } catch (error) {
    throw createError(
      `File content extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        source: 'dataIngestion',
        function: 'extractRawContent',
        data: { fileType, contentPreview: fileContent.substring(0, 200) },
      },
      'high'
    );
  }
};

// Removed - LLM will handle data validation and structure detection

// Removed - LLM will handle geographic entity resolution

// Removed - LLM will process and structure data directly

/**
 * Prepare file content for LLM processing
 */
export const prepareFileForLLM = async (file: File): Promise<{ content: string; fileType: 'csv' | 'json'; fileName: string }> => {
  return withErrorHandling(
    async () => {
      const fileName = file.name;
      let fileType: 'csv' | 'json';

      console.log(`📁 Preparing file for LLM: ${fileName} (${file.size} bytes)`);

      if (fileName.endsWith('.csv')) {
        fileType = 'csv';
      } else if (fileName.endsWith('.json')) {
        fileType = 'json';
      } else {
        throw createError(
          `Unsupported file format: ${fileName}`,
          {
            source: 'dataIngestion',
            function: 'prepareFileForLLM',
            data: { fileName, fileSize: file.size, supportedFormats: ['.csv', '.json'] },
          },
          'medium'
        );
      }

      const content = await file.text();
      const rawContent = extractRawContent(content, fileType);

      console.log(`✅ File prepared for LLM processing: ${rawContent.length} characters`);
      return { content: rawContent, fileType, fileName };
    },
    {
      source: 'dataIngestion',
      function: 'prepareFileForLLM',
      userAction: `prepare file for LLM: ${file.name}`,
      data: { fileName: file.name, fileSize: file.size },
    }
  ) as Promise<{ content: string; fileType: 'csv' | 'json'; fileName: string }>;
};

// Removed - LLM will detect and suggest column types automatically