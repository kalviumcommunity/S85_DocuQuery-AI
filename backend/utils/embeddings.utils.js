import OpenAI from "openai";

// Initialize OpenAI client with error handling
let openai;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy-key-for-testing") {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn("OpenAI API key not provided, will use mock embeddings");
  }
} catch (error) {
  console.warn("OpenAI client initialization failed:", error.message);
}

// text-embedding-3-small outputs 1536-d vectors
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

export async function embed(texts) {
  if (!openai || !process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not available, using mock embeddings");
    // Return mock embeddings for testing - generate random but consistent embeddings
    return texts.map((text, index) => {
      const embedding = new Float32Array(EMBEDDING_DIM);
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        // Create pseudo-random but deterministic values based on text and position
        const seed = (text.charCodeAt(i % text.length) + index + i) / 1000;
        embedding[i] = Math.sin(seed) * 0.5 + 0.5; // Normalize to [0, 1]
      }
      return embedding;
    });
  }
  
  try {
    // Batch for fewer API calls
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts
    });

    // Map to plain Float32Array for FAISS
    return res.data.map(d => Float32Array.from(d.embedding));
  } catch (error) {
    console.warn("OpenAI API call failed, using mock embeddings:", error.message);
    // Return mock embeddings for testing - generate random but consistent embeddings
    return texts.map((text, index) => {
      const embedding = new Float32Array(EMBEDDING_DIM);
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        // Create pseudo-random but deterministic values based on text and position
        const seed = (text.charCodeAt(i % text.length) + index + i) / 1000;
        embedding[i] = Math.sin(seed) * 0.5 + 0.5; // Normalize to [0, 1]
      }
      return embedding;
    });
  }
}

export async function embedOne(text) {
  const [vec] = await embed([text]);
  return vec;
}
