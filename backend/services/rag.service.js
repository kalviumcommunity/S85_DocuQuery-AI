import { extractAndChunk } from "../utils/pdf.utils.js";
import { addChunks, searchChunks, clearChunks } from "../utils/simple-search.utils.js";
import { answerWithGroq } from "./prompt.service.js";
import fs from "fs";
import path from "path";

// Enable debug logging
const debug = process.env.DEBUG?.includes('rag:*') ? console.debug : () => {};

/**
 * End-to-end: PDF -> chunks -> embeddings -> FAISS -> retrieve -> Groq answer
 */
export async function answerQuestions(documentPathOrUrl, questions, options = {}) {
  const { model, concepts = [], settings = {} } = options;
  const startTime = Date.now();
  const documentId = `doc_${startTime}_${Math.random().toString(36).substring(2, 8)}`;
  
  debug(`Processing document: ${documentPathOrUrl} (ID: ${documentId})`);
  
  try {
    console.log(`\n=== Starting RAG Process ===`);
    console.log(`Document: ${documentPathOrUrl}`);
    console.log(`Questions: ${questions.join(', ')}`);
    console.log(`Model: ${model || 'default'}`);
    console.log(`Concepts: ${concepts.join(', ') || 'none'}`);
    
    // Resolve the absolute path if it's a local file
    let absolutePath = documentPathOrUrl;
    if (!path.isAbsolute(documentPathOrUrl) && !documentPathOrUrl.startsWith('http')) {
      absolutePath = path.join(process.cwd(), documentPathOrUrl);
    }
    
    // Verify document exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Document not found: ${absolutePath}`);
    }
    
    // 1) Extract text and chunk it with custom settings
    const chunkSize = settings.chunkSize || 1200;
    const chunkOverlap = settings.chunkOverlap || 200;
    debug(`Extracting text from ${absolutePath}...`);
    const rawChunks = await extractAndChunk(absolutePath, chunkSize, chunkOverlap);
    debug(`Extracted ${rawChunks.length} chunks from document`);
    
    if (!rawChunks || rawChunks.length === 0) {
      throw new Error('No text content could be extracted from the document');
    }
    
    // Convert string chunks to objects with content property
    const chunks = rawChunks.map((chunk, index) => ({
      content: chunk,
      text: chunk,
      id: `${documentId}_${index}`,
      metadata: {}
    }));
    
    // 2) Create unique document ID and build search index
    console.log(`Processing ${chunks.length} chunks for document`);
    addChunks(chunks, documentId);

    // Process each question
    const results = [];
    const totalQuestions = questions.length;
    
    for (let i = 0; i < totalQuestions; i++) {
      const question = questions[i];
      const questionStartTime = Date.now();
      
      debug(`\n[${i + 1}/${totalQuestions}] Processing question: "${question}"`);
      
      try {
        console.log(`\n--- Processing question ${i + 1}/${questions.length}: "${question}" ---`);
        const topK = Math.min(settings.topK || 4, chunks.length);
        
        // Get relevant chunks for this specific question - increase the number of chunks
        const retrievedChunks = searchChunks(question, Math.min(topK * 4, chunks.length), documentId); // Get more chunks for better context
        
        if (!retrievedChunks || retrievedChunks.length === 0) {
          console.warn("No relevant chunks found for question:", question);
          results.push({
            question,
            answer: "I couldn't find any relevant information in the document to answer this question.",
            confidence: 0,
            sources: [],
            metadata: {
              chunks: 0,
              processingTime: Date.now() - questionStartTime,
              appliedConcepts: concepts,
              warning: "No relevant content found in document"
            }
          });
          continue;
        }
        
        // Log the chunks being used for debugging
        console.log(`Found ${retrievedChunks.length} relevant chunks for question: "${question}"`);
        retrievedChunks.forEach((chunk, idx) => {
          const chunkContent = chunk.content || chunk.text || '';
          const preview = chunkContent.substring ? chunkContent.substring(0, 100) : String(chunkContent).substring(0, 100);
          console.log(`Chunk ${idx + 1} (score: ${chunk.score || 'N/A'}): ${preview}...`);
        });
        
        // Filter out previously used chunks for variety (except for first question)
        let finalChunks = retrievedChunks;
        if (i > 0 && retrievedChunks.length > topK) {
          const unusedChunks = retrievedChunks.filter((chunk, idx) => 
            !results.find(result => result.metadata.chunks.includes(idx))
          );
          
          if (unusedChunks.length >= topK / 2) {
            finalChunks = unusedChunks.slice(0, topK);
          } else {
            finalChunks = retrievedChunks.slice(0, topK);
          }
        } else {
          finalChunks = retrievedChunks.slice(0, topK);
        }
        
        console.log(`Getting answer for question using ${finalChunks.length} chunks`);
        
        // Get answer from Groq
        const answer = await answerWithGroq(question, finalChunks, {
          model,
          concepts,
          settings,
          questionIndex: i,
          totalQuestions: questions.length
        });
        
        const processingTime = Date.now() - questionStartTime;
        debug(`✅ Answered in ${processingTime}ms`);
        
        const result = {
          question,
          answer: answer.answer,
          confidence: answer.confidence || 0.8,
          sources: answer.sources || [],
          metadata: {
            chunks: finalChunks.length,
            processingTime,
            appliedConcepts: concepts,
            model: model || 'default',
            documentId,
            documentPath: path.basename(absolutePath)
          },
        };
        
        console.log(`Question processed in ${result.metadata.processingTime}ms`);
        results.push(result);
        
      } catch (error) {
        console.error(`Error processing question: ${error.message}`);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        results.push({
          question,
          answer: `Error: ${error.message}`,
          confidence: 0,
          sources: [],
          error: true,
        });
      }
    }

    // Clean up document chunks after processing
    setTimeout(() => {
      clearChunks(documentId);
    }, 5000); // Clean up after 5 seconds

    console.log(`Processed ${results.length} questions in ${Date.now() - startTime}ms`);
    return results;
  } catch (error) {
    console.error("Error in answerQuestions:", error);
    // Fallback to simple error response
    return questions.map(q => ({
      question: q,
      answer: `An error occurred while processing your request: ${error.message}. Please try again or check the document format.`,
      metadata: {
        chunks: 0,
        processingTime: Date.now() - startTime,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }));
  }
}
