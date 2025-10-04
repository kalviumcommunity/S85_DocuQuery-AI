export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error("Failed to upload PDF");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
}

export async function queryDocument(documentPath, questions, options = {}) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ask`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        document: documentPath, 
        questions: questions,
        model: options.model,
        concepts: options.concepts,
        settings: options.settings
      })
    });

    if (!response.ok) {
      throw new Error("Failed to query document");
    }

    return await response.json();
  } catch (error) {
    console.error("Error querying document:", error);
    throw error;
  }
}
