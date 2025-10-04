import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Constants
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000; // 1 second

// Groq client state
let groqClient = null;
let groqInitializationInProgress = null;

/**
 * Initializes and returns the Groq client, ensuring it's only created once.
 * @returns {Promise<Groq>} The initialized Groq client instance.
 * @throws {Error} If the API key is missing or initialization fails.
 */
async function getGroqClient() {
  // If client is already initialized, return it immediately
  if (groqClient) {
    return groqClient;
  }

  // If initialization is already in progress, wait for it to complete
  if (groqInitializationInProgress) {
    return groqInitializationInProgress;
  }

  groqInitializationInProgress = (async () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      const error = new Error("GROQ_API_KEY is not set in environment variables");
      console.error("❌", error.message);
      throw error;
    }

    try {
      console.log("🔌 Initializing Groq client...");
      const client = new Groq({
        apiKey: apiKey,
        timeout: 45000, // 45 seconds timeout
        maxRetries: 3,
      });

      // Test the connection with a lightweight request
      await client.chat.completions.create({
        messages: [{ role: 'user', content: 'Test connection' }],
        model: process.env.GROQ_MODEL || 'llama3-70b-8192',
        max_tokens: 1,
        temperature: 0,
      });

      console.log("✅ Groq client initialized successfully");
      groqClient = client; // Store the successful instance
      return client;
    } catch (error) {
      console.error("❌ Groq client initialization failed:", error.message);
      throw new Error(`Could not initialize Groq client: ${error.message}`);
    } finally {
      groqInitializationInProgress = null;
    }
  })();

  return groqInitializationInProgress;
}

/**
 * Ensure Groq client is initialized
 * @returns {Promise<boolean>} True if Groq is ready to use
 */
export async function ensureGroqInitialized() {
  try {
    await getGroqClient();
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Groq client:", error);
    return false;
  }
}

// Pick a Groq model via ENV; fallback to a good default
const MODEL = process.env.GROQ_MODEL || "llama3-70b-8192";
console.log(`🤖 Using Groq model: ${MODEL}`);

const CONCEPT_PROMPTS = {
  "zero-shot": "Answer directly without examples.",
  "dynamic": "Adapt your response style based on the question complexity.",
  "structured": "Provide your answer in JSON format with 'answer' and 'confidence' fields.",
  "chain-thought": "Think step by step and show your reasoning process.",
  "function-calling": "If needed, identify what functions or tools would help answer this question.",
  "temperature": "Use creative and varied language in your response.",
  "embeddings": "Focus on semantic relationships and contextual meaning.",
  "system-user": "Maintain clear distinction between system instructions and user queries."
};

/**
 * Get answer from Groq with retry logic and error handling
 * @param {string} question - The question to ask
 * @param {Array} contextChunks - Array of context chunks
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} The answer object
 */
export async function answerWithGroq(question, contextChunks = [], options = {}) {
  const { concepts = [], settings = {}, questionIndex = 0, totalQuestions = 1 } = options;
  const startTime = Date.now();
  
  // Get Groq client (will initialize if needed)
  let groq;
  try {
    groq = await getGroqClient();
  } catch (error) {
    console.warn('⚠️  Groq client not available, using mock response:', error.message);
    return generateMockResponse(question, contextChunks, questionIndex);
  }

  let attempt = 0;
  let lastError = null;
  
  // Prepare the request data
  const systemPrompt = buildSystemPrompt(concepts, questionIndex, totalQuestions);
  const userPrompt = buildUserPrompt(question, contextChunks, concepts, questionIndex);
  const temperature = calculateTemperature(settings, concepts, questionIndex);
  
  const requestData = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: MODEL,
    temperature,
    max_tokens: 1024,
  };

  // Log the request (without sensitive data)
  const safeSubstring = (str, start, end) => {
    if (!str) return '';
    const s = String(str);
    return s.substring(start, end) + (s.length > end ? '...' : '');
  };

  console.log("\n=== Groq API Request ===");
  console.log(`Model: ${MODEL}, Temperature: ${temperature}`);
  console.log(`System Prompt (${systemPrompt?.length || 0} chars):`, safeSubstring(systemPrompt, 0, 100));
  console.log(`User Prompt (${userPrompt?.length || 0} chars):`, safeSubstring(userPrompt, 0, 100));
  console.log(`Context chunks: ${contextChunks?.length || 0}`);
  console.log(`Concepts: ${concepts?.join(', ') || 'none'}`);

  // Retry logic with exponential backoff
  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      const startTime = Date.now();
      
      console.log(`\n🔄 Attempt ${attempt}/${MAX_RETRIES} - Sending to Groq...`);
      
      const completion = await groq.chat.completions.create(requestData);
      const response = completion.choices[0]?.message?.content?.trim() || "No response generated";
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Success! Response time: ${processingTime}ms`);
      
      if (process.env.DEBUG) {
        console.log("\n=== Raw Response ===\n", response);
      }
      
      // Process the response
      let processedResponse = postProcessResponse(response, question, concepts);
      
      // Ensure we have a proper object with answer and confidence
      const result = {
        question: question,
        answer: processedResponse.answer || processedResponse || 'No answer provided',
        confidence: typeof processedResponse.confidence !== 'undefined' 
          ? processedResponse.confidence 
          : 0.8, // Default confidence if not specified
        sources: Array.isArray(processedResponse.sources) ? processedResponse.sources : [],
        metadata: {
          ...(processedResponse.metadata || {}),
          model: MODEL,
          processingTime,
          tokensUsed: completion.usage?.total_tokens || 0,
          retryAttempts: attempt - 1,
          concepts: concepts
        }
      };
      
      console.log('Processed response with confidence:', result.confidence);
      return result;
      
    } catch (error) {
      lastError = error;
      const waitTime = INITIAL_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
      
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      
      if (attempt >= MAX_RETRIES) break;
      
      console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // If we get here, all retries failed
  console.error(`❌ All ${MAX_RETRIES} attempts failed. Last error:`, lastError?.message);
  
  // Fall back to mock response with error details
  const mockResponse = generateMockResponse(question, contextChunks, questionIndex);
  return {
    ...mockResponse,
    metadata: {
      ...(mockResponse.metadata || {}),
      error: lastError?.message || 'Unknown error',
      retryAttempts: MAX_RETRIES,
      success: false
    }
  };
}

function buildSystemPrompt(concepts, questionIndex, totalQuestions) {
  // Base system prompt with core instructions
  let systemPrompt = `You are an advanced AI assistant for DocuQuery AI with expertise in document analysis and information extraction.

Your task is to provide clear, complete, and accurate answers based SOLELY on the provided context. Follow these guidelines:

1. If the answer is found in the context, provide it directly and cite the relevant parts.
2. If the context doesn't contain enough information, say "The document does not provide enough information to answer this question."
3. Never make up information that isn't in the context.
4. If the question is about a definition or specific term, provide the exact definition from the context.
5. For medical or technical terms, be precise and include any relevant details from the context.
6. If the context contains multiple points about a topic, include all relevant points in your answer.`;
  
  // Add variety based on question position
  if (questionIndex === 0) {
    systemPrompt += " Focus on providing comprehensive and detailed responses.";
  } else if (questionIndex === totalQuestions - 1) {
    systemPrompt += " Provide concise but complete answers, summarizing key points.";
  } else {
    systemPrompt += " Balance detail with clarity in your responses.";
  }
  
  // Concept-specific system instructions
  if (concepts.includes("structured")) {
    systemPrompt += " Always respond in valid JSON format with clear structure.";
  }
  
  if (concepts.includes("chain-thought")) {
    systemPrompt += " Show your analytical reasoning process step by step.";
  }
  
  if (concepts.includes("dynamic")) {
    systemPrompt += " Adapt your response style based on the complexity and nature of the question.";
  }

return systemPrompt;
}

function buildUserPrompt(question, contextChunks, concepts, questionIndex) {
  // Prepare the context with chunk numbers and scores for reference
  const context = contextChunks
    .map((chunk, i) => {
      const chunkText = chunk.text || chunk.content || '';
      const chunkScore = typeof chunk.score !== 'undefined' ? chunk.score : 'N/A';
      return `--- CHUNK ${i + 1} (Relevance: ${chunkScore}) ---\n${chunkText}`;
    })
    .filter(chunk => chunk.trim().length > 0)
    .join('\n\n');

  // Start building the prompt
  let prompt = `You are an expert insurance document analyst. Your task is to answer questions based SOLELY on the provided document context.\n\n`;
  
  // Add analysis steps if chain-thought is enabled
  if (concepts.includes("chain-thought")) {
    prompt += `ANALYSIS STEPS:\n`;
    prompt += `1. Carefully analyze each provided context chunk\n`;
    prompt += `2. Look for any information related to the question\n`;
    prompt += `3. If the information is not directly stated, try to infer from related context\n`;
    prompt += `4. If truly no information exists, state that clearly\n\n`;
  }
  
  // Add the actual context
  prompt += `DOCUMENT CONTEXT (${contextChunks.length} chunks):\n${context}\n\n`;
  prompt += `QUESTION: ${question}\n\n`;
  
  // Add response instructions
  prompt += `INSTRUCTIONS:\n`;
  prompt += `1. If the answer is in the context, provide it clearly and concisely\n`;
  prompt += `2. If the information is partially available, provide the most relevant details\n`;
  prompt += `3. If the context doesn't contain the answer, say "The document does not provide enough information to answer this question"\n`;
  prompt += `4. Include relevant details like definitions, conditions, or limitations when available\n\n`;
  
  // Format response based on concepts
  if (concepts.includes("structured")) {
    prompt += `FORMAT YOUR RESPONSE AS JSON:\n`;
    prompt += `{\n  "answer": "Your detailed answer here",\n  "confidence": 0.0-1.0,\n  "sources": ["Chunk X"],\n  "reasoning": "Brief explanation of how you arrived at this answer"\n}`;
  } else {
    prompt += `FORMAT YOUR RESPONSE AS:\n`;
    prompt += `THINKING PROCESS:\n1. [Your analysis steps]\n2. [Your reasoning]\n\n`;
    prompt += `ANSWER:\n[Your final answer]\n\n`;
    prompt += `CONFIDENCE: [0.0-1.0]\n`;
  }
  
  return prompt;
  
  return prompt;
}

function calculateTemperature(settings, concepts, questionIndex) {
  let baseTemperature = settings.temperature !== undefined ? settings.temperature : 0.1;
  
  // Add slight variation based on concepts and question position
  if (concepts.includes("temperature") || concepts.includes("dynamic")) {
    baseTemperature += (questionIndex * 0.05) % 0.3; // Vary between 0.1-0.4
  }
  
  return Math.min(Math.max(baseTemperature, 0), 1);
}

function postProcessResponse(response, question, concepts) {
  if (!response) return { answer: 'No response generated', confidence: 0 };
  
  // Clean up common response artifacts
  let cleanResponse = response
    .replace(/^(Answer:|Response:|Based on the context:?)/i, '')
    .trim();
  
  // Check if the response indicates no information was found
  const noInfoPhrases = [
    'not enough information',
    'no information',
    'does not provide',
    'not mentioned',
    'not found in the document',
    'not specified in the document'
  ];
  
  const isNoInfo = noInfoPhrases.some(phrase => 
    cleanResponse.toLowerCase().includes(phrase)
  );
  
  // Default confidence based on whether information was found
  const defaultConfidence = isNoInfo ? 0.1 : 0.8;
  
  // Handle structured responses
  if (concepts.includes("structured")) {
    try {
      const parsed = JSON.parse(cleanResponse);
      // Ensure confidence is set
      if (typeof parsed.confidence === 'undefined') {
        parsed.confidence = defaultConfidence;
      }
      return parsed;
    } catch {
      // Wrap non-JSON response in JSON structure
      return {
        answer: cleanResponse,
        confidence: defaultConfidence,
        reasoning: isNoInfo 
          ? "No relevant information found in the document"
          : "Extracted from document context"
      };
    }
  }
  
  // For non-structured responses, return an object with confidence
  return {
    answer: cleanResponse,
    confidence: defaultConfidence,
    sources: []
  };
}

function generateMockResponse(question, contextChunks = [], questionIndex = 0) {
  const hasContext = contextChunks && contextChunks.length > 0;
  
  const mockAnswers = [
    hasContext 
      ? `Based on the document, ${question.toLowerCase().replace('?', '')} is addressed in the provided context.`
      : `I don't have enough context to answer "${question}" accurately.`,
    
    hasContext
      ? `The document mentions that ${question.toLowerCase().replace('?', '')} is an important consideration.`
      : `I couldn't find any information about "${question}" in the document.`,
    
    hasContext
      ? `Analysis of the content suggests that ${question.toLowerCase().replace('?', '')} is a key topic covered.`
      : `The document doesn't contain any information related to "${question}".`,
    
    hasContext
      ? `The document provides insights into ${question.toLowerCase().replace('?', '')} across multiple sections.`
      : `I'm unable to answer "${question}" as I don't have access to the relevant document content.`
  ];
  
  const answer = mockAnswers[questionIndex % mockAnswers.length];
  const confidence = hasContext ? (0.6 + (Math.random() * 0.4)) : 0.2; // Lower confidence for no-context responses
  
  return {
    answer,
    confidence: parseFloat(confidence.toFixed(2)),
    sources: hasContext 
      ? contextChunks.slice(0, 3).map((chunk, i) => {
          const chunkText = chunk.text || chunk.content || String(chunk);
          return {
            title: `Document Section ${i + 1}`,
            content: chunkText.substring(0, 200) + (chunkText.length > 200 ? '...' : ''),
            page: Math.floor(Math.random() * 10) + 1
          };
        })
      : [],
    metadata: {
      isMock: true,
      contextChunks: hasContext ? contextChunks.length : 0,
      warning: hasContext ? undefined : 'No relevant context available'
    }
  };
}
