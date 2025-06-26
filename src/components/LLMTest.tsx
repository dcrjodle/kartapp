/**
 * Test component for LLM integration
 * Remove this after testing
 */

import React, { useState } from 'react';
import { LLMService } from '../services/llmService';

const LLMTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLLM = async () => {
    try {
      setLoading(true);
      
      // Debug environment variables
      console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')));
      console.log('API Key loaded:', process.env.REACT_APP_LLM_API_KEY ? 'YES' : 'NOT FOUND');
      console.log('Raw process.env:', process.env);
      
      const apiKey = process.env.REACT_APP_LLM_API_KEY || 'AIzaSyDbysaRUQIJAcTb3hEX4GRuXqu7mk7agOE';
      
      const llmService = new LLMService({
        apiKey,
        model: process.env.REACT_APP_LLM_MODEL || 'gemini-1.5-flash',
        maxTokens: parseInt(process.env.REACT_APP_LLM_MAX_TOKENS || '4096')
      });
      
      const testData = `province,population
Stockholm,2377081
Göteborg,1000000
Malmö,500000`;

      const response = await llmService.processData({
        rawContent: testData,
        fileType: 'csv',
        fileName: 'test.csv'
      });

      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('LLM Test Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 10, right: 10, background: 'white', padding: '10px', border: '1px solid #ccc', zIndex: 9999 }}>
      <button onClick={testLLM} disabled={loading}>
        {loading ? 'Testing...' : 'Test Gemini LLM'}
      </button>
      {result && (
        <pre style={{ marginTop: 10, fontSize: '12px', maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
          {result}
        </pre>
      )}
    </div>
  );
};

export default LLMTest;