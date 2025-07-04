/**
 * SCB (Statistics Sweden) API Service
 * Provides methods to interact with the SCB PxApi for fetching statistical data
 */

import { createError } from '../utils/errorHandling';
import type {
  SCBApiResponse,
  FolderResponse,
  TablesResponse,
  TableResponse,
  Dataset,
  SelectionResponse,
  CodeListResponse,
  ConfigResponse,
  SavedQuery,
  NavigationParams,
  TablesParams,
  TableDataParams,
  MetadataParams,
  VariablesSelection,
  OutputFormat,
  OutputFormatParam,
  Problem
} from '../types/scb';

/**
 * SCB API configuration
 */
export interface SCBApiConfig {
  baseUrl?: string;
  defaultLanguage?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Default configuration for SCB API
 */
const DEFAULT_CONFIG: Required<SCBApiConfig> = {
  baseUrl: 'https://api.scb.se/OV0104/v1/doris',
  defaultLanguage: 'sv',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * SCB API Service Class
 */
export class SCBApiService {
  private config: Required<SCBApiConfig>;
  private abortController: AbortController | null = null;

  constructor(config: SCBApiConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generic API request method with error handling and retries
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    params: Record<string, any> = {}
  ): Promise<SCBApiResponse<T>> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v.toString()));
        } else if (typeof value === 'object') {
          // Handle nested objects for valuecodes, codelist, etc.
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            if (Array.isArray(nestedValue)) {
              url.searchParams.append(`${key}[${nestedKey}]`, nestedValue.join(','));
            } else {
              url.searchParams.append(`${key}[${nestedKey}]`, nestedValue as string);
            }
          });
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    });

    this.abortController = new AbortController();
    
    const requestOptions: RequestInit = {
      ...options,
      signal: this.abortController.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await Promise.race([
          fetch(url.toString(), requestOptions),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.config.timeout)
          )
        ]);

        if (!response.ok) {
          const errorData: Problem = await response.json().catch(() => ({
            title: 'Unknown Error',
            status: response.status,
            detail: response.statusText
          }));

          return {
            success: false,
            error: errorData
          };
        }

        const data: T = await response.json();
        return {
          success: true,
          data
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (error instanceof Error && error.name === 'AbortError') {
          createError('Request aborted', { source: 'scbApi', function: 'apiRequest' }, 'medium');
          break;
        }

        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }

    createError(
      `Failed to fetch from SCB API after ${this.config.maxRetries} attempts`,
      { source: 'scbApi', function: 'apiRequest', data: { endpoint, error: lastError?.message } },
      'high'
    );

    return {
      success: false,
      error: {
        title: 'Network Error',
        status: 500,
        detail: lastError?.message || 'Failed to connect to SCB API'
      }
    };
  }

  /**
   * Cancel any ongoing request
   */
  public cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Navigation Methods

  /**
   * Get root navigation folder
   */
  public async getNavigationRoot(params: NavigationParams = {}): Promise<SCBApiResponse<FolderResponse>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage
    };

    return this.apiRequest<FolderResponse>('/navigation', {}, queryParams);
  }

  /**
   * Get navigation folder by ID
   */
  public async getNavigationById(
    id: string, 
    params: NavigationParams = {}
  ): Promise<SCBApiResponse<FolderResponse>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage
    };

    return this.apiRequest<FolderResponse>(`/navigation/${encodeURIComponent(id)}`, {}, queryParams);
  }

  // Table Discovery Methods

  /**
   * Get all tables with optional filtering
   */
  public async getAllTables(params: TablesParams = {}): Promise<SCBApiResponse<TablesResponse>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage,
      query: params.query,
      pastDays: params.pastDays,
      includeDiscontinued: params.includeDiscontinued,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize
    };

    return this.apiRequest<TablesResponse>('/tables', {}, queryParams);
  }

  /**
   * Get table information by ID
   */
  public async getTableById(
    id: string,
    params: NavigationParams = {}
  ): Promise<SCBApiResponse<TableResponse>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage
    };

    return this.apiRequest<TableResponse>(`/tables/${encodeURIComponent(id)}`, {}, queryParams);
  }

  /**
   * Get table metadata by ID
   */
  public async getTableMetadata(
    id: string,
    params: MetadataParams = {}
  ): Promise<SCBApiResponse<Dataset>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage,
      defaultSelection: params.defaultSelection,
      codelist: params.codelist
    };

    return this.apiRequest<Dataset>(`/tables/${encodeURIComponent(id)}/metadata`, {}, queryParams);
  }

  /**
   * Get default selection for a table
   */
  public async getDefaultSelection(
    id: string,
    params: NavigationParams = {}
  ): Promise<SCBApiResponse<SelectionResponse>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage
    };

    return this.apiRequest<SelectionResponse>(`/tables/${encodeURIComponent(id)}/defaultselection`, {}, queryParams);
  }

  // Data Fetching Methods

  /**
   * Get table data using GET method
   */
  public async getTableData(
    id: string,
    params: TableDataParams = {}
  ): Promise<SCBApiResponse<any>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage,
      valuecodes: params.valuecodes,
      codelist: params.codelist,
      outputFormat: params.outputFormat,
      outputFormatParams: params.outputFormatParams,
      heading: params.heading,
      stub: params.stub
    };

    return this.apiRequest<any>(`/tables/${encodeURIComponent(id)}/data`, {}, queryParams);
  }

  /**
   * Get table data using POST method with selection body
   */
  public async getTableDataWithSelection(
    id: string,
    selection: VariablesSelection,
    outputFormat: OutputFormat = 'json-stat2',
    outputFormatParams: OutputFormatParam[] = [],
    params: NavigationParams = {}
  ): Promise<SCBApiResponse<any>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage,
      outputFormat,
      outputFormatParams
    };

    return this.apiRequest<any>(
      `/tables/${encodeURIComponent(id)}/data`,
      {
        method: 'POST',
        body: JSON.stringify(selection)
      },
      queryParams
    );
  }

  // Code List Methods

  /**
   * Get code list by ID
   */
  public async getCodeList(
    id: string,
    params: NavigationParams = {}
  ): Promise<SCBApiResponse<CodeListResponse>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage
    };

    return this.apiRequest<CodeListResponse>(`/codelists/${encodeURIComponent(id)}`, {}, queryParams);
  }

  // Configuration Methods

  /**
   * Get API configuration
   */
  public async getConfig(): Promise<SCBApiResponse<ConfigResponse>> {
    return this.apiRequest<ConfigResponse>('/config');
  }

  // Saved Queries Methods

  /**
   * Create a saved query
   */
  public async createSavedQuery(query: SavedQuery): Promise<SCBApiResponse<SavedQuery>> {
    return this.apiRequest<SavedQuery>(
      '/savedqueries',
      {
        method: 'POST',
        body: JSON.stringify(query)
      }
    );
  }

  /**
   * Get saved query by ID
   */
  public async getSavedQuery(id: string): Promise<SCBApiResponse<SavedQuery>> {
    return this.apiRequest<SavedQuery>(`/savedqueries/${encodeURIComponent(id)}`);
  }

  /**
   * Execute saved query and get data
   */
  public async executeSavedQuery(
    id: string,
    outputFormat: OutputFormat = 'json-stat2',
    outputFormatParams: OutputFormatParam[] = [],
    params: NavigationParams = {}
  ): Promise<SCBApiResponse<any>> {
    const queryParams = {
      lang: params.lang || this.config.defaultLanguage,
      outputFormat,
      outputFormatParams
    };

    return this.apiRequest<any>(`/savedqueries/${encodeURIComponent(id)}/data`, {}, queryParams);
  }

  // Utility Methods

  /**
   * Search for tables by keyword
   */
  public async searchTables(
    query: string,
    params: Omit<TablesParams, 'query'> = {}
  ): Promise<SCBApiResponse<TablesResponse>> {
    return this.getAllTables({ ...params, query });
  }

  /**
   * Get recently updated tables
   */
  public async getRecentlyUpdatedTables(
    pastDays: number = 7,
    params: Omit<TablesParams, 'pastDays'> = {}
  ): Promise<SCBApiResponse<TablesResponse>> {
    return this.getAllTables({ ...params, pastDays });
  }

  /**
   * Check if API is available
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.getConfig();
      return response.success;
    } catch {
      return false;
    }
  }
}

/**
 * Default SCB API service instance
 */
export const scbApiService = new SCBApiService();

/**
 * Create a new SCB API service with custom configuration
 */
export const createSCBApiService = (config: SCBApiConfig): SCBApiService => {
  return new SCBApiService(config);
};