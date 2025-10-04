import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__background">
        <div className="hero__gradient"></div>
        <div className="hero__particles"></div>
      </div>
      
      <div className="container">
        <div className="hero__content">
          <div className="hero__text">
            <h1 className="hero__title">
              Transform Your Documents into
              <span className="hero__title--accent"> Intelligent Conversations</span>
            </h1>
            
            <p className="hero__subtitle">
              Upload any document and ask questions in natural language. 
              Get instant, accurate answers powered by advanced AI technology.
            </p>
            
            <div className="hero__actions">
              <button className="btn btn-primary btn-lg hero__cta">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="hero__cta-icon">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Get Started for Free
              </button>
              
              <button className="btn btn-secondary btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                </svg>
                Watch Demo
              </button>
            </div>
            
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-number">10K+</span>
                <span className="hero__stat-label">Documents Processed</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">99.9%</span>
                <span className="hero__stat-label">Accuracy Rate</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">&lt; 2s</span>
                <span className="hero__stat-label">Response Time</span>
              </div>
            </div>
          </div>
          
          <div className="hero__visual">
            <div className="hero__demo-card">
              <div className="demo-card__header">
                <div className="demo-card__dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="demo-card__title">DocuQuery AI</span>
              </div>
              
              <div className="demo-card__content">
                <div className="demo-message demo-message--user">
                  <div className="demo-message__bubble">
                    What are the key findings in this research paper?
                  </div>
                </div>
                
                <div className="demo-message demo-message--ai">
                  <div className="demo-message__avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="demo-message__bubble">
                    Based on the document analysis, the key findings include:
                    <br/>• 40% improvement in efficiency
                    <br/>• Reduced processing time by 60%
                    <br/>• Enhanced accuracy metrics...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
