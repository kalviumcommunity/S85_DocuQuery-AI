import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Hero from '../../components/layout/Hero';
import DocumentUpload from '../../components/ui/DocumentUpload';
import QueryInterface from '../../components/ui/QueryInterface';
import ResultsDisplay from '../../components/ui/ResultsDisplay';
import Footer from '../../components/layout/Footer';
import CrazyEffects from '../../components/ui/CrazyEffects';
import { queryDocument } from '../../services/api';
import './Home.css';

const Home = () => {
  const [documentInfo, setDocumentInfo] = useState({
    file: null,
    path: null,
    fileName: null
  });
  const [queryResults, setQueryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (uploadInfo) => {
    console.log('File upload info:', uploadInfo);
    
    if (!uploadInfo || !uploadInfo.file) {
      console.error('Invalid upload info:', uploadInfo);
      alert('Failed to process uploaded file');
      return;
    }
    
    // Use the server-provided path if available, otherwise construct it
    // The backend stores files in the 'uploads' directory
    const documentPath = uploadInfo.path || `uploads/${uploadInfo.fileName || uploadInfo.file.name}`;
    
    setDocumentInfo({
      file: uploadInfo.file,
      path: documentPath,
      fileName: uploadInfo.fileName || uploadInfo.file.name
    });
    
    setQueryResults([]);
    setIsProcessing(true);
    
    // Simulate processing time (in a real app, you'd wait for processing to complete)
    setTimeout(() => {
      setIsProcessing(false);
      console.log('Document processing complete:', { documentPath });
    }, 2000);
  };

  const handleQuery = async (question) => {
    console.log('Handling query:', { question, documentInfo });
    
    if (!documentInfo || !documentInfo.path) {
      const errorMsg = 'No document available. Please upload a document first.';
      console.error(errorMsg);
      alert(errorMsg);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending query with document path:', documentInfo.path);
      const response = await queryDocument(documentInfo.path, question);
      console.log('Query response:', response);
      
      // Handle different response formats from the backend
      let result;
      
      // Case 1: Direct answer object with question, confidence, sources
      if (response && response.question && (response.answer || response.text)) {
        console.log('Processing direct answer object format');
        
        // Check if the answer indicates no information was found
        const answerText = response.answer || response.text || '';
        const isNoInfoAnswer = answerText.toLowerCase().includes('not enough information') || 
                             answerText.toLowerCase().includes('no information') ||
                             answerText.toLowerCase().includes('does not provide') ||
                             answerText.toLowerCase().includes('not mentioned');
        
        result = {
          id: Date.now(),
          question: response.question,
          answer: answerText,
          confidence: isNoInfoAnswer 
            ? 0  // Set to 0% when no information is found
            : typeof response.confidence === 'number' 
              ? Math.min(Math.max(response.confidence, 0), 1) * 100  // Convert to percentage if not already
              : typeof response.confidence === 'string' && !isNaN(parseFloat(response.confidence))
                ? parseFloat(response.confidence) * 100  // Convert string percentage to number
                : 80,  // Default confidence for valid answers
          timestamp: Date.now(),
          sources: Array.isArray(response.sources) ? response.sources : [],
          metadata: response.metadata || {}
        };
      }
      // Case 2: Response has a results array with answers
      else if (response && response.results && Array.isArray(response.results) && response.results.length > 0) {
        console.log('Processing results array format');
        const firstResult = response.results[0];
        
        // Check if the answer indicates no information was found
        const answerText = firstResult.answer || firstResult.text || JSON.stringify(firstResult) || 'No answer provided';
        const isNoInfoAnswer = answerText.toLowerCase().includes('not enough information') || 
                             answerText.toLowerCase().includes('no information') ||
                             answerText.toLowerCase().includes('does not provide') ||
                             answerText.toLowerCase().includes('not mentioned');
        
        result = {
          id: Date.now(),
          question: question,
          answer: answerText,
          confidence: isNoInfoAnswer 
            ? 0  // Set to 0% when no information is found
            : typeof firstResult.confidence === 'number' 
              ? Math.min(Math.max(firstResult.confidence, 0), 1) * 100  // Convert to percentage if not already
              : typeof firstResult.confidence === 'string' && !isNaN(parseFloat(firstResult.confidence))
                ? parseFloat(firstResult.confidence) * 100  // Convert string percentage to number
                : firstResult.score || 0,  // Fall back to score or 0
          timestamp: Date.now(),
          sources: Array.isArray(firstResult.sources) ? firstResult.sources : [],
          metadata: firstResult.metadata || {}
        };
      } 
      // Case 3: Response is a direct answer object without question field
      else if (response && typeof response === 'object' && (response.answer || response.text)) {
        console.log('Processing simple answer object format');
        
        // Check if the answer indicates no information was found
        const answerText = response.answer || response.text || JSON.stringify(response);
        const isNoInfoAnswer = answerText.toLowerCase().includes('not enough information') || 
                             answerText.toLowerCase().includes('no information') ||
                             answerText.toLowerCase().includes('does not provide') ||
                             answerText.toLowerCase().includes('not mentioned');
        
        result = {
          id: Date.now(),
          question: question,
          answer: answerText,
          confidence: isNoInfoAnswer 
            ? 0  // Set to 0% when no information is found
            : typeof response.confidence === 'number' 
              ? Math.min(Math.max(response.confidence, 0), 1) * 100  // Convert to percentage if not already
              : typeof response.confidence === 'string' && !isNaN(parseFloat(response.confidence))
                ? parseFloat(response.confidence) * 100  // Convert string percentage to number
                : response.score || 0,  // Fall back to score or 0
          timestamp: Date.now(),
          sources: Array.isArray(response.sources) ? response.sources : [],
          metadata: response.metadata || {}
        };
      }
      // Case 4: Response is a direct answer string
      else if (response) {
        console.log('Processing direct string response');
        const answerText = typeof response === 'string' ? response : JSON.stringify(response);
        const isNoInfoAnswer = answerText.toLowerCase().includes('not enough information') || 
                             answerText.toLowerCase().includes('no information') ||
                             answerText.toLowerCase().includes('does not provide') ||
                             answerText.toLowerCase().includes('not mentioned');
        
        result = {
          id: Date.now(),
          question: question,
          answer: answerText,
          confidence: isNoInfoAnswer ? 0 : 80,  // 0% for no info, 80% default for other answers
          timestamp: Date.now(),
          sources: [],
          metadata: {}
        };
      } else {
        throw new Error('Empty response from server');
      }
      
      console.log('Processed result:', result);
      setQueryResults(prev => [result, ...prev]);
    } catch (error) {
      console.error('Query failed:', error);
      // Show more detailed error message
      const errorMessage = error.response 
        ? `Server error: ${error.response.status} - ${error.response.statusText}`
        : error.message || 'Failed to process your request';
      
      alert(`Failed to get answer: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home">
      <CrazyEffects />
      <Header />
      <Hero />
      
      <main className="main-content">
        <section className="app-section" id="app">
          <div className="container">
            <div className="section-header">
              <h2>Try DocuQuery AI</h2>
              <p>Upload your document and start asking questions to experience the power of AI-driven document analysis.</p>
            </div>
            
            <div className="app-grid">
              <div className="app-column">
                <DocumentUpload onFileUpload={handleFileUpload} />
              </div>
              
              <div className="app-column">
                {isProcessing ? (
                  <div className="processing-message">
                    <div className="spinner"></div>
                    <p>Processing your document. This may take a moment...</p>
                  </div>
                ) : (
                  <QueryInterface 
                    onQuery={handleQuery}
                    isLoading={isLoading}
                    hasDocument={!!documentInfo.file}
                  />
                )}
              </div>
              
              <div className="app-column app-column--full">
                <ResultsDisplay 
                  results={queryResults}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="container">
            <div className="section-header text-center">
              <h2>Powerful Features</h2>
              <p>Everything you need to transform your documents into intelligent conversations</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Lightning Fast</h3>
                <p>Get answers in seconds with our optimized AI processing pipeline that handles documents of any size efficiently.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>High Accuracy</h3>
                <p>Advanced AI models ensure precise understanding and accurate responses to your document-related questions.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Secure & Private</h3>
                <p>Your documents are processed securely with enterprise-grade encryption and privacy protection.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Multiple Formats</h3>
                <p>Support for PDF, DOC, DOCX, and TXT files with intelligent content extraction and analysis.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Smart Analysis</h3>
                <p>Contextual understanding that goes beyond simple keyword matching to provide meaningful insights.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Team Collaboration</h3>
                <p>Share insights and collaborate with team members on document analysis and findings.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works-section" id="how-it-works">
          <div className="container">
            <div className="section-header text-center">
              <h2>How It Works</h2>
              <p>Get started with DocuQuery AI in three simple steps</p>
            </div>
            
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Upload Document</h3>
                  <p>Simply drag and drop your PDF, DOC, DOCX, or TXT file into our secure upload area.</p>
                </div>
              </div>
              
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Ask Questions</h3>
                  <p>Type your questions in natural language about the content, structure, or insights from your document.</p>
                </div>
              </div>
              
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Get Answers</h3>
                  <p>Receive detailed, accurate answers with source references and confidence scores in seconds.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
