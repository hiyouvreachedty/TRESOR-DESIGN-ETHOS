/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { generateAsciiArt } from '../services/geminiService';
import LoadingSkeleton from './LoadingSkeleton';

interface GenerativeArtProps {
  topic: string;
}

const AsciiArtDisplay: React.FC<GenerativeArtProps> = ({ topic }) => {
  const [art, setArt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isCancelled = false;

    const fetchArt = async () => {
      setIsLoading(true);
      setError(null);
      setArt('');
      
      try {
        let accumulatedArt = '';
        for await (const chunk of generateAsciiArt(topic)) {
          if (isCancelled) break;
          if (chunk.startsWith('Error:')) {
            throw new Error(chunk);
          }
          accumulatedArt += chunk;
          if (!isCancelled) {
            setArt(accumulatedArt);
          }
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
          setError(`Art Error: ${errorMessage}`);
          console.error('Error generating ASCII art:', e);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    
    // A small delay to prevent firing on rapid topic changes
    const timeoutId = setTimeout(fetchArt, 300);
    
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [topic]);

  return (
    <>
      {error && (
        <div style={{ border: '1px solid #ff9999', padding: '1rem', color: '#cc0000', fontSize: '0.9rem' }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      {isLoading && art.length === 0 && !error && <LoadingSkeleton />}
      {art && (
        <pre className="ascii-art generative-art">
          {art}
          {isLoading && <span className="blinking-cursor">|</span>}
        </pre>
      )}
      {!isLoading && !error && art.length === 0 && (
         <p style={{ color: '#888', textAlign: 'center' }}>Art could not be generated for this topic.</p>
      )}
    </>
  );
};

export default AsciiArtDisplay;