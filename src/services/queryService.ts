/**
 * Natural Language Query Processing Service
 * Interprets user queries and determines data availability and visualization actions
 */

import { LLMService } from './llmService';
import { createError, withErrorHandling } from '../utils/errorHandling';

export interface QueryRequest {
  query: string;
  availableProvinces: string[];
  currentData?: any;
}

export interface QueryResponse {
  success: boolean;
  intent: 'show' | 'highlight' | 'compare' | 'analyze' | 'unavailable';
  entities: string[];
  message: string;
  action?: {
    type: 'select_province' | 'highlight_provinces' | 'show_data' | 'error';
    targets: string[];
    visualization?: 'map' | 'chart' | 'table';
  };
  confidence: number;
}

/**
 * Query Processing Service for Natural Language Map Interactions
 */
export class QueryService {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  /**
   * Process natural language query about Swedish geographic data
   */
  async processQuery(request: QueryRequest): Promise<QueryResponse> {
    return withErrorHandling(
      async () => {
        const prompt = this.buildQueryPrompt(request);
        const llmResponse = await this.callQueryLLM(prompt);
        
        return this.parseQueryResponse(llmResponse, request);
      },
      {
        source: 'QueryService',
        function: 'processQuery',
        userAction: `process query: "${request.query}"`,
        data: { 
          queryLength: request.query.length,
          availableProvinces: request.availableProvinces.length 
        },
      }
    ) as Promise<QueryResponse>;
  }

  /**
   * Build context-aware prompt for query interpretation
   */
  private buildQueryPrompt(request: QueryRequest): string {
    const { query, availableProvinces, currentData } = request;
    
    return `
You are a Swedish geographic data assistant. Analyze the user's query and determine:
1. What they want to see/do
2. If we have the requested data
3. What action should be taken

USER QUERY: "${query}"

AVAILABLE SWEDISH PROVINCES:
${availableProvinces.join(', ')}

CURRENT DATA STATUS:
${currentData ? 'Data loaded and available' : 'No data currently loaded'}

CAPABILITIES:
- Show/highlight specific provinces on map
- Display province information
- Compare provinces (if data available)
- Navigate to specific regions

QUERY INTERPRETATION RULES:
1. "show [province]" → select and focus on province
2. "highlight [provinces]" → highlight multiple provinces
3. "highest/lowest [metric]" → analyze and show top/bottom provinces
4. "compare [provinces]" → comparison visualization
5. Geographic names should match available provinces (fuzzy matching OK)

RESPOND IN THIS EXACT JSON FORMAT:
{
  "success": true,
  "intent": "show|highlight|compare|analyze|unavailable",
  "entities": ["stockholm", "goteborg"],
  "message": "I'll show you Stockholm province on the map",
  "action": {
    "type": "select_province|highlight_provinces|show_data|error",
    "targets": ["stockholm"],
    "visualization": "map|chart|table"
  },
  "confidence": 0.95
}

EXAMPLE RESPONSES:

Query: "show me Stockholm"
Response: {
  "success": true,
  "intent": "show",
  "entities": ["stockholm"],
  "message": "I'll show you Stockholm province on the map",
  "action": {
    "type": "select_province",
    "targets": ["stockholm"],
    "visualization": "map"
  },
  "confidence": 0.95
}

Query: "what provinces have highest population"
Response: {
  "success": false,
  "intent": "unavailable",
  "entities": [],
  "message": "I don't have population data loaded. Please upload population data first to analyze provinces by population.",
  "action": {
    "type": "error",
    "targets": [],
    "visualization": "map"
  },
  "confidence": 0.9
}

IMPORTANT: If requesting data analysis but no data is loaded, set intent to "unavailable" and explain what data is needed.
`.trim();
  }

  /**
   * Call LLM for query interpretation
   */
  private async callQueryLLM(prompt: string): Promise<string> {
    try {
      // Use the same model but with different generation config for query processing
      const model = this.llmService['genAI'].getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 1024, // Shorter responses for queries
          temperature: 0.2, // Low temperature for consistent interpretation
        }
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini for query processing');
      }

      return text;
    } catch (error) {
      throw createError(
        `Query LLM call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          source: 'QueryService',
          function: 'callQueryLLM',
          data: { promptLength: prompt.length },
        },
        'high'
      );
    }
  }

  /**
   * Parse LLM response for query interpretation
   */
  private parseQueryResponse(response: string, request: QueryRequest): QueryResponse {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       response.match(/(\{[\s\S]*\})/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in query LLM response');
      }

      const parsed = JSON.parse(jsonMatch[1]);
      
      // Validate required fields
      if (!parsed.intent || !parsed.message) {
        throw new Error('Invalid query response structure');
      }

      // Normalize province names to match available provinces
      const normalizedTargets = this.normalizeProvinceNames(
        parsed.action?.targets || [],
        request.availableProvinces
      );

      return {
        success: parsed.success !== false,
        intent: parsed.intent,
        entities: parsed.entities || [],
        message: parsed.message,
        action: parsed.action ? {
          type: parsed.action.type,
          targets: normalizedTargets,
          visualization: parsed.action.visualization || 'map'
        } : undefined,
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      throw createError(
        `Failed to parse query response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          source: 'QueryService',
          function: 'parseQueryResponse',
          data: { 
            query: request.query,
            responsePreview: response.substring(0, 200) 
          },
        },
        'high'
      );
    }
  }

  /**
   * Normalize province names to match available provinces using fuzzy matching
   */
  private normalizeProvinceNames(targets: string[], availableProvinces: string[]): string[] {
    return targets.map(target => {
      const normalized = target.toLowerCase();
      
      // Direct match
      const direct = availableProvinces.find(p => 
        p.toLowerCase() === normalized
      );
      if (direct) return direct;

      // Partial match
      const partial = availableProvinces.find(p => 
        p.toLowerCase().includes(normalized) || 
        normalized.includes(p.toLowerCase())
      );
      if (partial) return partial;

      // Common aliases
      const aliases: Record<string, string> = {
        'göteborg': 'Goteborg',
        'goteborg': 'Goteborg',
        'malmö': 'Malmo',
        'malmo': 'Malmo',
        'stockholm': 'Stockholm',
        'uppsala': 'Uppsala',
      };

      const alias = aliases[normalized];
      if (alias && availableProvinces.includes(alias)) {
        return alias;
      }

      // Return original if no match found
      return target;
    }).filter(Boolean);
  }
}

/**
 * Create query service instance with existing LLM service
 */
export const createQueryService = (llmService: LLMService): QueryService => {
  return new QueryService(llmService);
};