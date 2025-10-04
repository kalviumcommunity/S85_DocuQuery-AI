import React, { useState } from 'react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, isLoading }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="results-display">
        <div className="results-header">
          <h3>AI Analysis</h3>
          <p className="results-subtitle">Processing your question...</p>
        </div>
        
        <div className="results-loading">
          <div className="loading-animation">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Analyzing document and generating response...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="results-display">
        <div className="results-header">
          <h3>AI Analysis</h3>
          <p className="results-subtitle">Your answers will appear here</p>
        </div>
        
        <div className="results-empty">
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="empty-state__icon">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h4>Ready to Answer</h4>
            <p>Upload a document and ask a question to see AI-powered analysis here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-display">
      <div className="results-header">
        <h3>AI Analysis</h3>
        <p className="results-subtitle">
          {results.length} {results.length === 1 ? 'response' : 'responses'}
        </p>
      </div>

      <div className="results-list">
        {results.map((result) => (
          <div key={result.id} className="result-item">
            <div 
              className="result-item__header"
              onClick={() => toggleExpanded(result.id)}
            >
              <div className="result-question">
                <div className="question-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="question-text">{result.question}</span>
              </div>
              
              <div className="result-meta">
                <span className="result-timestamp">
                  {formatTimestamp(result.timestamp)}
                </span>
                <button className="expand-toggle">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className={expandedItems.has(result.id) ? 'expanded' : ''}
                  >
                    <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className={`result-item__content ${expandedItems.has(result.id) ? 'expanded' : ''}`}>
              <div className="result-answer">
                <div className="answer-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="answer-content">
                  <div className="answer-text">
                    {result.answer}
                  </div>
                  
                  <div className="confidence-indicator">
                    <span className="confidence-label">Confidence:</span>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{ 
                          width: `${Math.min(Math.max(Number(result.confidence) || 0, 0), 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="confidence-value">
                      {Math.min(Math.max(Number(result.confidence) || 0, 0), 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  {result.sources && result.sources.length > 0 && (
                    <div className="answer-sources">
                      <h5>Sources:</h5>
                      <ul>
                        {result.sources.map((source, index) => (
                          <li key={index}>
                            <span className="source-page">Page {source.page}</span>
                            <span className="source-text">"{source.text}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="result-actions">
                <button className="action-btn" title="Copy answer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                <button className="action-btn" title="Share">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                <button className="action-btn" title="Bookmark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;
