// Enhanced search with better relevance scoring and context isolation
const documentStore = new Map(); // Store chunks per document

export function addChunks(chunks, documentId = 'default') {
  documentStore.set(documentId, [...chunks]);
  console.log(`Added ${chunks.length} chunks to search index for document: ${documentId}`);
}

export function searchChunks(query, topK = 4, documentId = 'default') {
  const documentChunks = documentStore.get(documentId) || [];
  
  if (documentChunks.length === 0) {
    console.warn(`No chunks found for document: ${documentId}`);
    return [];
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  
  // Enhanced scoring algorithm
  const scoredChunks = documentChunks.map((chunk, index) => {
    // Handle both string chunks and object chunks with content property
    const chunkContent = chunk.content || chunk.text || chunk.chunk || chunk.toString();
    const chunkLower = chunkContent.toLowerCase();
    let score = 0;
    
    // Exact phrase match (highest priority)
    if (chunkLower.includes(queryLower)) {
      score += 50;
    }
    
    // Semantic proximity scoring
    queryWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = chunkLower.match(regex) || [];
      
      // Word frequency with diminishing returns
      score += Math.min(matches.length * 5, 20);
      
      // Bonus for word variations and stems
      const stemRegex = new RegExp(`\\b${word.slice(0, -1)}\\w*\\b`, 'gi');
      const stemMatches = chunkLower.match(stemRegex) || [];
      score += Math.min(stemMatches.length * 2, 10);
    });
    
    // Context relevance bonus
    const contextWords = ['definition', 'explanation', 'description', 'meaning', 'refers', 'indicates'];
    contextWords.forEach(contextWord => {
      if (chunkLower.includes(contextWord)) {
        score += 3;
      }
    });
    
    // Length penalty for very short chunks
    if (chunkContent.length < 100) {
      score *= 0.8;
    }
    
    // Diversity bonus (prefer chunks with unique content)
    const uniqueWords = new Set(chunkLower.split(/\s+/)).size;
    score += Math.min(uniqueWords * 0.1, 5);

    return { chunk, score, index, length: chunkContent.length, content: chunkContent };
  });

  // Advanced filtering and ranking
  const relevantChunks = scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // Primary sort by score
      if (Math.abs(a.score - b.score) > 5) {
        return b.score - a.score;
      }
      // Secondary sort by content length (prefer more detailed chunks)
      return b.length - a.length;
    })
    .slice(0, Math.min(topK, documentChunks.length));

  console.log(`Query: "${query}" - Found ${relevantChunks.length} relevant chunks with scores:`, 
    relevantChunks.map(item => ({
      score: item.score.toFixed(1), 
      preview: (item.content || '').substring(0, 100) + '...'
    })));

  return relevantChunks.map(item => ({
    ...item.chunk,
    text: item.content,
    score: item.score
  }));
}

export function clearChunks(documentId = 'default') {
  if (documentId === 'all') {
    documentStore.clear();
    console.log('Cleared all document chunks');
  } else {
    documentStore.delete(documentId);
    console.log(`Cleared chunks for document: ${documentId}`);
  }
}
