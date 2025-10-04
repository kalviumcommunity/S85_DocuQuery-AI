export async function askGroq(question) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ask`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from backend");
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return "Error fetching response from AI.";
  }
}
