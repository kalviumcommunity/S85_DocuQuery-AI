import faiss from "faiss-node";
import { embed, embedOne, EMBEDDING_DIM } from "./embeddings.utils.js";

/**
 * Simple in-memory FAISS index + parallel array of texts.
 * Re-initialized per process start. For persistence, serialize vectors to disk.
 */
let index = null;
let texts = [];

/** Expose for optional management */
export const vectorIndex = {
  clear: () => { index = null; texts = []; },
  size: () => (texts.length)
};

function ensureIndex() {
  if (!index) {
    index = new faiss.IndexFlatIP(EMBEDDING_DIM); // cosine via normalized IP
  }
}

/** Normalize vector to unit length for cosine similarity */
function normalize(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] = vec[i] / norm;
  return vec;
}

export async function addDocuments(chunks) {
  if (!chunks?.length) return;
  ensureIndex();

  try {
    // Embed in batches
    const vectors = await embed(chunks);
    
    // Validate vectors before processing
    if (!vectors || vectors.length === 0) {
      console.warn("No vectors returned from embedding, skipping addDocuments");
      return;
    }
    
    // Ensure all vectors have correct dimensions
    const validVectors = vectors.filter(v => v && v.length === EMBEDDING_DIM);
    if (validVectors.length !== vectors.length) {
      console.warn(`Filtered ${vectors.length - validVectors.length} invalid vectors`);
    }
    
    if (validVectors.length === 0) {
      console.warn("No valid vectors to add to index");
      return;
    }
    
    const normalized = validVectors.map(v => normalize(v));
    
    // Convert to the format FAISS expects (regular Array, not Float32Array)
    const vectorMatrix = [];
    for (let i = 0; i < normalized.length; i++) {
      vectorMatrix.push(Array.from(normalized[i]));
    }
    
    index.add(vectorMatrix);
    texts.push(...chunks.slice(0, validVectors.length));
  } catch (error) {
    console.error("Error in addDocuments:", error.message);
    throw error;
  }
}

export async function similaritySearch(query, k = 4) {
  if (!index || texts.length === 0) return [];
  
  try {
    const q = normalize(await embedOne(query));
    
    // Convert single vector to array format for FAISS
    const queryVector = Array.from(q);
    
    const { distances, labels } = index.search([queryVector], Math.min(k, texts.length));

    // labels[0] contains indices; map to chunk texts (filter out -1 if returned)
    const idxs = labels[0].filter(i => i >= 0 && i < texts.length);
    return idxs.map(i => texts[i]);
  } catch (error) {
    console.error("Error in similaritySearch:", error.message);
    return [];
  }
}
