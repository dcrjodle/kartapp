/**
 * TypeScript types for SCB (Statistics Sweden) API
 * Based on OpenAPI specification version 2.0
 */

export type OutputFormat = 'px' | 'json-stat2' | 'csv' | 'xlsx' | 'html' | 'json-px' | 'parquet';

export type OutputFormatParam = 
  | 'UseCodes' 
  | 'UseTexts' 
  | 'UseCodesAndTexts' 
  | 'IncludeTitle' 
  | 'SeparatorTab' 
  | 'SeparatorSpace' 
  | 'SeparatorSemicolon';

export interface Language {
  id: string;
  label: string;
}

export interface Link {
  rel: string;
  hreflang: string;
  href: string;
}

export interface PathElement {
  id: string;
  label: string;
}

// Navigation Types
export type FolderContentItemType = 'Heading' | 'FolderInformation' | 'Table';

export interface FolderContentItem {
  type: FolderContentItemType;
  id: string;
  label: string | null;
  description?: string | null;
  sortCode?: string;
}

export interface Heading extends FolderContentItem {
  type: 'Heading';
}

export interface FolderInformation extends FolderContentItem {
  type: 'FolderInformation';
  tags?: string[];
  links: Link[] | null;
}

export interface Table extends FolderContentItem {
  type: 'Table';
  tags?: string[];
  updated: string | null;
  firstPeriod: string | null;
  lastPeriod: string | null;
  category?: 'internal' | 'public' | 'private' | 'section';
  variableNames: string[];
  discontinued?: boolean | null;
  source?: string;
  subjectCode?: string;
  timeUnit?: TimeUnit;
  paths?: PathElement[][];
  links: Link[] | null;
}

export interface FolderResponse {
  language: string;
  id: string | null;
  label: string | null;
  description?: string | null;
  tags?: string[];
  folderContents: FolderContentItem[] | null;
  links: Link[] | null;
}

// Table Types
export interface TablesResponse {
  language: string;
  tables: Table[];
  page: PageInfo;
  links?: Link[];
}

export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  links?: Link[];
}

export interface TableResponse extends Table {
  language: string;
}

// Data Types
export interface VariableSelection {
  variableCode: string;
  codeList?: string | null;
  valueCodes: string[];
}

export interface VariablePlacement {
  heading?: string[];
  stub?: string[];
}

export interface VariablesSelection {
  selection: VariableSelection[];
  placement?: VariablePlacement;
}

export interface SelectionResponse extends VariablesSelection {
  language: string;
  links: Link[];
}

// Metadata Types
export interface Note {
  mandatory?: boolean;
  text: string;
}

export interface Contact {
  name?: string;
  organization?: string;
  phone?: string;
  mail?: string;
  raw: string;
}

export interface CodeListInformation {
  id: string;
  label: string;
  type: CodeListType;
  links: Link[];
}

export type CodeListType = 'Aggregation' | 'Valueset';

export interface ValueMap {
  code: string;
  label: string;
  valueMap: string[];
  notes?: Note[];
}

export interface CodeListResponse {
  id: string;
  label: string;
  language: string;
  languages: string[];
  elimination?: boolean;
  eliminationValueCode?: string;
  type: CodeListType;
  values: ValueMap[];
  links: Link[];
}

// Dataset Types (JSON-stat format)
export interface JsonStatCategory {
  index?: Record<string, number>;
  label?: Record<string, string>;
  note?: Record<string, string[]>;
  child?: Record<string, string[]>;
  unit?: Record<string, {
    base?: string;
    decimals?: number;
  }>;
}

export interface JsonStatDimension {
  label?: string;
  note?: string[];
  category?: JsonStatCategory;
  extension?: Record<string, any>;
  link?: Record<string, any>;
}

export interface JsonStatRole {
  time?: string[];
  geo?: string[];
  metric?: string[];
}

export interface Dataset {
  version: '2.0';
  class: 'dataset';
  href?: string;
  label?: string;
  source?: string;
  updated?: string;
  link?: Record<string, any>;
  note?: string[];
  role?: JsonStatRole;
  id: string[];
  size: number[];
  dimension: Record<string, JsonStatDimension>;
  extension?: Record<string, any>;
  value: (number | null)[] | null;
  status?: Record<string, string>;
}

// Saved Queries
export interface SavedQuery {
  id?: string;
  selection: VariablesSelection;
  language: string;
  tableId: string;
  outputFormat?: OutputFormat;
  outputFormatParams?: OutputFormatParam[];
}

// Configuration
export interface ConfigResponse {
  apiVersion: string;
  appVersion: string;
  languages: Language[];
  defaultLanguage: string;
  maxDataCells: number;
  maxCallsPerTimeWindow: number;
  timeWindow: number;
  license: string;
  sourceReferences?: SourceReference[];
  defaultDataFormat: string;
  dataFormats: string[];
  features?: ApiFeature[];
}

export interface SourceReference {
  language: string;
  text: string;
}

export interface ApiFeature {
  id: string;
  params?: KeyValuePair[];
}

export interface KeyValuePair {
  key: string;
  value: string;
}

// Enums
export type TimeUnit = 'Annual' | 'Quarterly' | 'Monthly' | 'Weekly' | 'Other';

export type MeasuringType = 'Stock' | 'Flow' | 'Average' | 'Other';

export type PriceType = 'NotApplicable' | 'Current' | 'Fixed';

export type Adjustment = 'None' | 'SesOnly' | 'WorkOnly' | 'WorkAndSes';

// Error Types
export interface Problem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

// API Response Types
export type SCBApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: Problem;
};

// Query Parameters
export interface NavigationParams {
  lang?: string;
}

export interface TablesParams {
  lang?: string;
  query?: string;
  pastDays?: number;
  includeDiscontinued?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface TableDataParams {
  lang?: string;
  valuecodes?: Record<string, string[]>;
  codelist?: Record<string, string>;
  outputFormat?: OutputFormat;
  outputFormatParams?: OutputFormatParam[];
  heading?: string[];
  stub?: string[];
}

export interface MetadataParams {
  lang?: string;
  defaultSelection?: boolean;
  codelist?: Record<string, string>;
}