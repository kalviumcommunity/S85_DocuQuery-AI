const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

console.log('🔍 Using API_BASE_URL:', API_BASE_URL);

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload document');
  }

  const result = await response.json();
  console.log('Upload response:', result);
  
  // Return the complete response from the server
  return result;
};

export const queryDocument = async (documentPath, question) => {
  console.log('Querying document:', { documentPath, question });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentPath: documentPath,
        questions: [question],
        options: {}
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Query error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      throw new Error(errorData.error || 'Failed to get answer');
    }

    const data = await response.json();
    console.log('Raw API response:', data);
    
    // If the response has a results array, return the entire response
    // The Home component will handle extracting the first result
    if (data && typeof data === 'object' && Array.isArray(data.results)) {
      console.log('Returning full response with results array');
      return data;
    }
    
    // If it's an object without a results array, return it as is
    if (data && typeof data === 'object') {
      console.log('Returning response object');
      return data;
    }
    
    // For any other case (shouldn't happen with our backend)
    console.log('Wrapping response in results array');
    return {
      success: true,
      results: [{
        answer: data || 'No answer provided',
        confidence: 0.8,
        sources: []
      }]
    };
  } catch (error) {
    console.error('Error querying document:', error);
    throw error;
  }
};