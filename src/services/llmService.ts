/**
 * LLM Service for data interpretation and processing
 * Using Google Generative AI TypeScript SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createError, withErrorHandling } from '../utils/errorHandling';
import { DataSeries } from '../types/visualization';

export interface LLMConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface LLMDataRequest {
  rawContent: string;
  fileType: 'csv' | 'json';
  fileName: string;
  userPrompt?: string;
}

export interface LLMResponse {
  success: boolean;
  dataSeries: DataSeries;
  interpretation: string;
  suggestions: string[];
  confidence: number;
}

/**
 * Google Generative AI Service for data processing
 */
export class LLMService {
  private config: LLMConfig;
  private genAI: GoogleGenerativeAI;

  constructor(config: LLMConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  /**
   * Process data through LLM for interpretation and structuring
   */
  async processData(request: LLMDataRequest): Promise<LLMResponse> {
    return withErrorHandling(
      async () => {
        const prompt = this.buildDataProcessingPrompt(request);
        const llmResponse = await this.callLLM(prompt);
        
        return this.parseDataResponse(llmResponse, request.fileName);
      },
      {
        source: 'LLMService',
        function: 'processData',
        userAction: `process data with LLM: ${request.fileName}`,
        data: { 
          model: this.config.model || 'gemini-1.5-flash',
          fileType: request.fileType,
          contentLength: request.rawContent.length 
        },
      }
    ) as Promise<LLMResponse>;
  }

  /**
   * Get data interpretation suggestions from LLM
   */
  async getDataSuggestions(request: LLMDataRequest): Promise<string[]> {
    return withErrorHandling(
      async () => {
        const prompt = this.buildSuggestionPrompt(request);
        const llmResponse = await this.callLLM(prompt);
        
        return this.parseSuggestions(llmResponse);
      },
      {
        source: 'LLMService',
        function: 'getDataSuggestions',
        userAction: `get data suggestions: ${request.fileName}`,
        data: { model: this.config.model || 'gemini-1.5-flash' },
      }
    ) as Promise<string[]>;
  }

  /**
   * Build prompt for data processing
   */
  private buildDataProcessingPrompt(request: LLMDataRequest): string {
    const { rawContent, fileType, userPrompt } = request;
    
    return `
You are a data analyst specializing in Swedish geographic and statistical data visualization.

TASK: Analyze the following ${fileType.toUpperCase()} data and convert it to a standardized format for Swedish map visualization.

DATA TO ANALYZE:
\`\`\`${fileType}
${rawContent.length > 3000 ? rawContent.substring(0, 3000) + '...[truncated]' : rawContent}
\`\`\`

SWEDISH PROVINCES FOR REFERENCE:
Stockholm, Göteborg (Västra Götaland), Malmö (Skåne), Uppsala, Västerås (Västmanland), Örebro, Linköping (Östergötland), Helsingborg (Skåne), Jönköping, Norrköping (Östergötland), Lund (Skåne), Umeå (Västerbotten), Gävle (Gävleborg), Borås (Västra Götaland), Eskilstuna (Södermanland), Halmstad (Halland), Växjö (Kronoberg), Karlstad (Värmland), Sundsvall (Västernorrland), Trollhättan (Västra Götaland)

REQUIREMENTS:
1. Identify geographic entities (provinces, counties, cities) and match them to Swedish regions
2. Extract numeric values suitable for map visualization
3. Detect data type: demographic, economic, crime, health, education, etc.
4. Suggest appropriate visualization: choropleth, markers, heatmap, or animation
5. Return confidence score (0-1) for the analysis

${userPrompt ? `USER CONTEXT: ${userPrompt}` : ''}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "success": true,
  "dataSeries": {
    "id": "series-timestamp",
    "name": "Dataset Name",
    "description": "Brief description",
    "type": "numeric|percentage|category",
    "data": [
      {
        "entityId": "se-stockholm",
        "value": 123.45,
        "label": "Optional label",
        "metadata": {}
      }
    ]
  },
  "interpretation": "What this data represents and key insights",
  "suggestions": ["visualization suggestion 1", "analysis suggestion 2"],
  "confidence": 0.85
}
`.trim();
  }

  /**
   * Build prompt for getting suggestions
   */
  private buildSuggestionPrompt(request: LLMDataRequest): string {
    const { rawContent, fileType } = request;
    
    return `
Analyze this ${fileType.toUpperCase()} data and provide 3-5 visualization suggestions for Swedish geographic data:

\`\`\`${fileType}
${rawContent.length > 1000 ? rawContent.substring(0, 1000) + '...[truncated]' : rawContent}
\`\`\`

Return suggestions as JSON array:
["suggestion 1", "suggestion 2", "suggestion 3"]
`.trim();
  }

  /**
   * Call Google Generative AI
   */
  private async callLLM(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model || 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: this.config.maxTokens || 4096,
          temperature: 0.1, // Low temperature for consistent data parsing
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return text;
    } catch (error) {
      throw createError(
        `Gemini API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          source: 'LLMService',
          function: 'callLLM',
          data: { 
            model: this.config.model || 'gemini-1.5-flash',
            promptLength: prompt.length 
          },
        },
        'high'
      );
    }
  }

  // Removed - not needed with Google Generative AI SDK

  /**
   * Parse LLM response for data processing
   */
  private parseDataResponse(response: string, fileName: string): LLMResponse {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       response.match(/(\{[\s\S]*\})/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[1]);
      
      // Validate required fields
      if (!parsed.dataSeries || !parsed.interpretation) {
        throw new Error('Invalid LLM response structure');
      }

      // Add timestamp to series ID if missing
      if (!parsed.dataSeries.id || parsed.dataSeries.id === 'series-timestamp') {
        parsed.dataSeries.id = `series-${Date.now()}`;
      }

      return {
        success: parsed.success || true,
        dataSeries: parsed.dataSeries,
        interpretation: parsed.interpretation,
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      throw createError(
        `Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          source: 'LLMService',
          function: 'parseDataResponse',
          data: { fileName, responsePreview: response.substring(0, 200) },
        },
        'high'
      );
    }
  }

  /**
   * Parse suggestions from LLM response
   */
  private parseSuggestions(response: string): string[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*?\]/) || response.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      
      if (!jsonMatch) {
        // Fallback: split by lines and filter
        return response.split('\n')
          .filter(line => line.trim().length > 0 && !line.includes('```'))
          .slice(0, 5);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      return ['Could not parse suggestions from LLM response'];
    }
  }
}

/**
 * Create LLM service instance from environment configuration
 */
export const createLLMService = (): LLMService => {
  const apiKey = process.env.REACT_APP_LLM_API_KEY || '';
  
  if (!apiKey) {
    throw createError(
      'Gemini API key not found in environment variables',
      {
        source: 'LLMService',
        function: 'createLLMService',
        data: { hasApiKey: !!apiKey },
      },
      'critical'
    );
  }

  return new LLMService({
    apiKey,
    model: process.env.REACT_APP_LLM_MODEL || 'gemini-1.5-flash',
    maxTokens: parseInt(process.env.REACT_APP_LLM_MAX_TOKENS || '4096'),
  });
};