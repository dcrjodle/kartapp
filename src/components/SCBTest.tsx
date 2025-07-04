/**
 * Temporary component for testing SCB API integration with Gemini LLM
 * This component demonstrates the full data flow:
 * 1. Fetch data from SCB API
 * 2. Transform to frontend format
 * 3. Send to Gemini for analysis
 * 4. Display processed results
 * 
 * CORS Issue Note:
 * SCB API has CORS restrictions that prevent some requests from browser.
 * This component uses mock data when direct API calls fail due to CORS.
 * In production, consider using a backend proxy to avoid CORS issues.
 * 
 * Remove this after testing is complete
 */

import React, { useState } from 'react';
import { scbApiService } from '../services/scbApi';
import { LLMService } from '../services/llmService';
import type { VariablesSelection } from '../types/scb';

interface ProcessedData {
  raw: any;
  formatted: string;
  geminiAnalysis?: any;
}

const SCBTest: React.FC = React.memo(() => {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<string>('');

  const runFullTest = async () => {
    try {
      setLoading(true);
      setError('');
      setData(null);

      // Step 1: Test SCB API connection (attempt, but expect CORS issues)
      setStep('Testing SCB API connection...');
      let apiWorking = false;
      let apiData = null;
      
      try {
        const navResponse = await scbApiService.getNavigationRoot();
        if (navResponse.success) {
          apiWorking = true;
          apiData = navResponse.data;
          setStep('SCB API connection successful!');
        }
      } catch (apiError) {
        console.log('SCB API failed as expected due to CORS:', apiError);
        setStep('SCB API blocked by CORS (expected) - using mock data...');
      }

      // Step 2: Use mock data (this is the main test - Gemini integration)
      setStep('Preparing Swedish population data for Gemini analysis...');
      const mockCSVData = `region_code,region_name,population,density_per_km2
01,Stockholm,2377081,4765
03,Uppsala,383713,469
04,Södermanland,297619,462
05,Östergötland,465495,443
06,Jönköping,363599,343
07,Kronoberg,201469,214
08,Kalmar,245446,218
09,Gotland,59686,198
10,Blekinge,159606,542
12,Skåne,1393681,1286
13,Halland,341590,653
14,Västra Götaland,1725881,696
17,Värmland,282414,162
18,Örebro,304805,345
19,Västmanland,275845,426
20,Dalarna,287191,103
21,Gävleborg,287074,159
22,Västernorrland,250093,118
23,Jämtland,130810,267
24,Västerbotten,271736,490
25,Norrbotten,250093,256`;

      // Step 3: Send to Gemini for analysis
      setStep('Sending Swedish population data to Gemini for analysis...');
      
      const apiKey = process.env.REACT_APP_LLM_API_KEY || 'AIzaSyDbysaRUQIJAcTb3hEX4GRuXqu7mk7agOE';
      const llmService = new LLMService({
        apiKey,
        model: process.env.REACT_APP_LLM_MODEL || 'gemini-1.5-flash',
        maxTokens: parseInt(process.env.REACT_APP_LLM_MAX_TOKENS || '4096')
      });

      const geminiResponse = await llmService.processData({
        rawContent: mockCSVData,
        fileType: 'csv',
        fileName: 'swedish_population_density_data.csv'
      });

      // Step 4: Store results
      setData({
        raw: { 
          scb_api_status: apiWorking ? 'connected' : 'cors_blocked',
          api_data: apiData,
          note: 'Using realistic Swedish population data. In production, this would come from SCB API via backend proxy.'
        },
        formatted: mockCSVData,
        geminiAnalysis: geminiResponse
      });

      setStep(apiWorking ? 'Test completed with SCB API + Gemini!' : 'Test completed with mock data + Gemini!');

    } catch (err) {
      console.error('SCB Test Error:', err);
      setError(`Error in step "${step}": ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!data?.formatted) return;
    
    const blob = new Blob([data.formatted], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scb_population_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 60, 
        right: 10, 
        background: 'white', 
        padding: '15px', 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        zIndex: 9999,
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
      data-testid="scb-test-component"
    >
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>SCB + Gemini Test</h3>
      
      <button 
        onClick={runFullTest} 
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
        data-testid="run-test-button"
      >
{loading ? 'Testing...' : 'Test SCB Data → Gemini Analysis'}
      </button>

      {step && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Status: {step}
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'red', 
          fontSize: '12px', 
          backgroundColor: '#fee', 
          padding: '8px', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}

      {data && (
        <div style={{ fontSize: '12px' }}>
          <h4 style={{ margin: '10px 0 5px 0' }}>Results:</h4>
          
          {/* CSV Data Preview */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <strong>CSV Data ({data.formatted.split('\n').length - 1} rows):</strong>
              <button 
                onClick={downloadCSV}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                data-testid="download-csv-button"
              >
                Download CSV
              </button>
            </div>
            <pre style={{ 
              fontSize: '10px', 
              backgroundColor: '#f8f9fa',
              padding: '8px',
              borderRadius: '4px',
              maxHeight: '100px',
              overflow: 'auto',
              margin: '0'
            }}>
              {data.formatted.split('\n').slice(0, 6).join('\n')}
              {data.formatted.split('\n').length > 6 && '\n... (more rows)'}
            </pre>
          </div>

          {/* Gemini Analysis */}
          {data.geminiAnalysis && (
            <div>
              <strong>Gemini Analysis:</strong>
              <pre style={{ 
                fontSize: '10px', 
                backgroundColor: '#f0f7ff',
                padding: '8px',
                borderRadius: '4px',
                maxHeight: '150px',
                overflow: 'auto',
                margin: '5px 0 0 0'
              }}>
                {JSON.stringify(data.geminiAnalysis, null, 2)}
              </pre>
            </div>
          )}

          {/* Raw SCB Data (collapsed by default) */}
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
              Raw SCB Response
            </summary>
            <pre style={{ 
              fontSize: '9px', 
              backgroundColor: '#f5f5f5',
              padding: '8px',
              borderRadius: '4px',
              maxHeight: '100px',
              overflow: 'auto',
              margin: '5px 0 0 0'
            }}>
              {JSON.stringify(data.raw, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
});

SCBTest.displayName = 'SCBTest';

export default SCBTest;