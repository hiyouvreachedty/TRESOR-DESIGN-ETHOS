/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { streamDefinition } from './services/geminiService';
import ContentDisplay from './components/ContentDisplay';
import SearchBar from './components/SearchBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import AnimatedLogo from './components/AnimatedLogo';
import AsciiArtDisplay from './components/AsciiArtDisplay';
import AnimatedFlame from './components/AnimatedFlame';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';

// A curated list of "banger" words and phrases for the random button.
const PREDEFINED_WORDS = [
  // List 1
  'Balance', 'Harmony', 'Discord', 'Unity', 'Fragmentation', 'Clarity', 'Ambiguity', 'Presence', 'Absence', 'Creation', 'Destruction', 'Light', 'Shadow', 'Beginning', 'Ending', 'Rising', 'Falling', 'Connection', 'Isolation', 'Hope', 'Despair',
  // Complex phrases from List 1
  'Order and chaos', 'Light and shadow', 'Sound and silence', 'Form and formlessness', 'Being and nonbeing', 'Presence and absence', 'Motion and stillness', 'Unity and multiplicity', 'Finite and infinite', 'Sacred and profane', 'Memory and forgetting', 'Question and answer', 'Search and discovery', 'Journey and destination', 'Dream and reality', 'Time and eternity', 'Self and other', 'Known and unknown', 'Spoken and unspoken', 'Visible and invisible',
  // List 2
  'Zigzag', 'Waves', 'Spiral', 'Bounce', 'Slant', 'Drip', 'Stretch', 'Squeeze', 'Float', 'Fall', 'Spin', 'Melt', 'Rise', 'Twist', 'Explode', 'Stack', 'Mirror', 'Echo', 'Vibrate',
  // List 3
  'Gravity', 'Friction', 'Momentum', 'Inertia', 'Turbulence', 'Pressure', 'Tension', 'Oscillate', 'Fractal', 'Quantum', 'Entropy', 'Vortex', 'Resonance', 'Equilibrium', 'Centrifuge', 'Elastic', 'Viscous', 'Refract', 'Diffuse', 'Cascade', 'Levitate', 'Magnetize', 'Polarize', 'Accelerate', 'Compress', 'Undulate',
  // List 4
  'Liminal', 'Ephemeral', 'Paradox', 'Zeitgeist', 'Metamorphosis', 'Synesthesia', 'Recursion', 'Emergence', 'Dialectic', 'Apophenia', 'Limbo', 'Flux', 'Sublime', 'Uncanny', 'Palimpsest', 'Chimera', 'Void', 'Transcend', 'Ineffable', 'Qualia', 'Gestalt', 'Simulacra', 'Abyssal',
  // List 5
  'Existential', 'Nihilism', 'Solipsism', 'Phenomenology', 'Hermeneutics', 'Deconstruction', 'Postmodern', 'Absurdism', 'Catharsis', 'Epiphany', 'Melancholy', 'Nostalgia', 'Longing', 'Reverie', 'Pathos', 'Ethos', 'Logos', 'Mythos', 'Anamnesis', 'Intertextuality', 'Metafiction', 'Stream', 'Lacuna', 'Caesura', 'Enjambment'
];
const UNIQUE_WORDS = [...new Set(PREDEFINED_WORDS)];


const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<string>('Hypertext');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [isArtVisible, setIsArtVisible] = useState<boolean>(false);
  const [view, setView] = useState<'main' | 'privacy' | 'terms'>('main');

  // State for "uncorruptable" feature
  const [committedTopic, setCommittedTopic] = useState<string | null>(null);
  const [contentHash, setContentHash] = useState<string | null>(null);


  useEffect(() => {
    if (!currentTopic) return;

    let isCancelled = false;

    const fetchAllContent = async () => {
      // Set initial state for a clean page load
      setIsLoading(true);
      setError(null);
      setContent(''); // Clear previous content immediately
      setGenerationTime(null);
      // Reset commit state on new topic
      setCommittedTopic(null);
      setContentHash(null);
      
      const startTime = performance.now();
      
      // Stream text definition
      let accumulatedContent = '';
      try {
        for await (const chunk of streamDefinition(currentTopic)) {
          if (isCancelled) break;
          
          if (chunk.startsWith('Error:')) {
            throw new Error(chunk);
          }
          accumulatedContent += chunk;
          if (!isCancelled) {
            setContent(accumulatedContent);
          }
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
          setError(errorMessage);
          setContent(''); // Ensure content is clear on error
          console.error(e);
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now();
          setGenerationTime(endTime - startTime);
          setIsLoading(false);
        }
      }
    };

    fetchAllContent();
    
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic]);

  const handleWordClick = useCallback((word: string) => {
    const newTopic = word.trim();
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      setCurrentTopic(newTopic);
    }
  }, [currentTopic]);

  const handleSearch = useCallback((topic: string) => {
    const newTopic = topic.trim();
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      setCurrentTopic(newTopic);
    }
  }, [currentTopic]);

  const handleRandom = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * UNIQUE_WORDS.length);
    const randomWord = UNIQUE_WORDS[randomIndex];

    // Prevent picking the same word twice in a row
    if (randomWord.toLowerCase() === currentTopic.toLowerCase()) {
      const nextIndex = (randomIndex + 1) % UNIQUE_WORDS.length;
      setCurrentTopic(UNIQUE_WORDS[nextIndex]);
    } else {
      setCurrentTopic(randomWord);
    }
  }, [currentTopic]);
  
  const generateContentHash = (topic: string, text: string): string => {
    const combined = `${topic}:${text}`;
    let hash = 0;
    if (combined.length === 0) return 'ETHOS-0000-0000';
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    const hashHex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `ETHOS-${hashHex.slice(0, 4)}-${hashHex.slice(4, 8)}`;
  };

  const handleCommit = () => {
    if (!isLoading && content) {
      const hash = generateContentHash(currentTopic, content);
      setContentHash(hash);
      setCommittedTopic(currentTopic);
    }
  };

  if (view === 'privacy') {
    return <PrivacyPolicy onClose={() => setView('main')} />;
  }

  if (view === 'terms') {
    return <TermsOfUse onClose={() => setView('main')} />;
  }

  return (
    <div>
      <div className="flame-icon-container">
        <AnimatedFlame />
      </div>
      
      <SearchBar onSearch={handleSearch} onRandom={handleRandom} isLoading={isLoading} />
      
      <header style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <AnimatedLogo />
      </header>
      
      <main>
        <div>
          <div style={{ textAlign: 'center' }}>
            <h2
              key={currentTopic}
              className="topic-heading"
              style={{ textTransform: 'capitalize' }}
            >
              <span>{currentTopic}</span>
            </h2>
            
            {/* Commit Button - appears after loading is complete and if not already committed */}
            {!isLoading && content.length > 0 && !error && committedTopic !== currentTopic && (
              <button onClick={handleCommit} className="commit-button">
                [ COMMIT TO ETHOS ]
              </button>
            )}

            {/* Content Hash - appears after committing */}
            {contentHash && committedTopic === currentTopic && (
              <div className="content-hash" aria-label="Content Hash">
                {contentHash}
              </div>
            )}
          </div>

          {error && (
            <div style={{ border: '1px solid #cc0000', padding: '1rem', color: '#cc0000' }}>
              <p style={{ margin: 0 }}>An Error Occurred</p>
              <p style={{ marginTop: '0.5rem', margin: 0 }}>{error}</p>
            </div>
          )}

          <div className={`content-wrapper ${contentHash && committedTopic === currentTopic ? 'committed' : ''}`}>
            {/* Show skeleton loader when loading and no content is yet available */}
            {isLoading && content.length === 0 && !error && (
              <LoadingSkeleton />
            )}

            {/* Show content as it streams or when it's interactive */}
            {content.length > 0 && !error && (
              <ContentDisplay 
                content={content} 
                isLoading={isLoading} 
                onWordClick={handleWordClick} 
              />
            )}
          </div>
          
          {/* Show empty state if fetch completes with no content and is not loading */}
          {!isLoading && !error && content.length === 0 && (
            <div style={{ color: '#888', padding: '2rem 0', textAlign: 'center' }}>
              <p>Content could not be generated.</p>
            </div>
          )}
        </div>
      </main>

      <div className="visual-interpretation-container">
        <button 
          onClick={() => setIsArtVisible(!isArtVisible)} 
          className="toggle-button"
          aria-expanded={isArtVisible}
          aria-controls="visual-interpretation-content"
        >
          <span>Visual Interpretation</span>
          <span className={`toggle-arrow ${isArtVisible ? 'up' : 'down'}`}></span>
        </button>
        {isArtVisible && (
          <div id="visual-interpretation-content" className="generative-art-wrapper">
            <AsciiArtDisplay topic={currentTopic} />
          </div>
        )}
      </div>

      <footer className="sticky-footer">
        <p className="footer-text">
          TRĒSOR DẼSIGN · Generated by Gemini AI
          {generationTime && ` · ${Math.round(generationTime)}ms`}
        </p>
        <p className="footer-disclaimer">
          Content is generated by AI and may contain inaccuracies. This is an exploratory tool, not a factual resource.
        </p>
        <p className="footer-disclaimer">
          Please use responsibly. Automated scraping is not permitted.
        </p>
        <div className="footer-links">
          <button onClick={() => setView('terms')} className="footer-link">Terms of Use</button>
          <span>·</span>
          <button onClick={() => setView('privacy')} className="footer-link">Privacy Policy</button>
        </div>
        <p className="footer-version">
          v.00.00.004
        </p>
      </footer>
    </div>
  );
};

export default App;