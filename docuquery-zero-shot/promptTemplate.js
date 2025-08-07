function buildPrompt(context, question) {
  return `
You are a helpful assistant.

ONLY answer using the information from the document below.
Do not guess or make up any information.
If the answer is not in the document, reply: "Not mentioned in the document."

Document:
"""${context}"""

Question: ${question}
  `;
}

module.exports = buildPrompt;
