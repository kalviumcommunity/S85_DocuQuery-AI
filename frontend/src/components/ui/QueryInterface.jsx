import React, { useState } from 'react';
import './QueryInterface.css';

const QueryInterface = ({ onQuery, isLoading, hasDocument }) => {
  const [query, setQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || !hasDocument || isLoading) return;

    const newQuery = {
      id: Date.now(),
      question: query.trim(),
      timestamp: new Date()
    };

    setQueryHistory(prev => [newQuery, ...prev]);
    
    if (onQuery) {
      onQuery(query.trim());
    }
    
    setQuery('');
  };

  const handleQuickQuery = (quickQuery) => {
    setQuery(quickQuery);
  };

  const quickQueries = [
    "What are the main points of this document?",
    "Summarize the key findings",
    "What are the conclusions?",
    "List the important dates mentioned"
  ];

  return (
    <div className="query-interface">
      <div className="query-header">
        <h3>Ask Questions</h3>
        <p className="query-subtitle">
          {hasDocument 
            ? "Ask any question about your uploaded document" 
            : "Upload a document first to start asking questions"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="query-form">
        <div className="query-input-container">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={hasDocument 
              ? "What would you like to know about this document?" 
              : "Upload a document to start asking questions..."
            }
            className="query-input"
            rows="3"
            disabled={!hasDocument}
          />
          
          <button
            type="submit"
            className={`query-submit ${isLoading ? 'query-submit--loading' : ''}`}
            disabled={!query.trim() || !hasDocument || isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Ask Question</span>
              </>
            )}
          </button>
        </div>
      </form>

      {hasDocument && (
        <div className="quick-queries">
          <h4>Quick Questions</h4>
          <div className="quick-queries-grid">
            {quickQueries.map((quickQuery, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(quickQuery)}
                className="quick-query-btn"
                disabled={isLoading}
              >
                {quickQuery}
              </button>
            ))}
          </div>
        </div>
      )}

      {queryHistory.length > 0 && (
        <div className="query-history">
          <h4>Recent Questions</h4>
          <div className="query-history-list">
            {queryHistory.slice(0, 5).map((historyItem) => (
              <button
                key={historyItem.id}
                onClick={() => handleQuickQuery(historyItem.question)}
                className="history-item"
                disabled={isLoading}
              >
                <span className="history-item__text">{historyItem.question}</span>
                <span className="history-item__time">
                  {historyItem.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryInterface;
