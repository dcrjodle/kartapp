/**
 * Test component for LLM integration
 * Remove this after testing
 */

import React, { useState } from 'react';
import { createLLMService } from '../services/llmService';

const LLMTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLLM = async () => {
    try {
      setLoading(true);
      const llmService = createLLMService();
      
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
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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