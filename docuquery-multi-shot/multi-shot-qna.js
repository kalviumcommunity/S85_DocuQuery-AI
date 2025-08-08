import fetch from "node-fetch";
import dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();

// Load API key
const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing GROQ_API_KEY in .env");
  process.exit(1);
}

// -------- Helper: Multi-line document input --------
function getMultilineInput(prompt) {
  console.log(`${prompt} (Type 'END' or press Enter twice to finish):`);
  
  let lines = [];
  let emptyCount = 0;

  while (true) {
    const line = readlineSync.question("");

    // Option 1: User types END
    if (line.trim().toUpperCase() === "END") break;

    // Option 2: User presses Enter twice
    if (line.trim() === "") {
      emptyCount++;
      if (emptyCount >= 2) break;
    } else {
      emptyCount = 0;
      lines.push(line);
    }
  }
  return lines.join("\n");
}
// -------- Multi-shot examples --------
const examples = [
  {
    question: "What is the capital of France?",
    answer: "The capital of France is Paris."
  },
  {
    question: "Who wrote Romeo and Juliet?",
    answer: "William Shakespeare wrote Romeo and Juliet."
  }
];

// -------- Step 1: Ask user for document --------
const documentText = getMultilineInput("\n📄 Paste your document content");

// -------- Step 2: Ask user for their question --------
const userQuestion = readlineSync.question("\n❓ Enter your question:\n");

// -------- Step 3: Build the prompt --------
let prompt = "You are an AI assistant that answers questions based on the provided document.\n\n";
prompt += "Here are some examples:\n";
examples.forEach((ex, i) => {
  prompt += `Example ${i + 1}:\nQ: ${ex.question}\nA: ${ex.answer}\n\n`;
});
prompt += `Now, based on the document below, answer the user's question concisely.\n\n`;
prompt += `Document:\n${documentText}\n\n`;
prompt += `User Question: ${userQuestion}\nAnswer:`;

// -------- Step 4: Call GROQ API --------
async function getAnswer() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0
      })
    });

    const data = await response.json();

    if (data?.choices?.length) {
      console.log("\n🎯 Response:");
      console.log(data.choices[0].message.content.trim());
    } else {
      console.error("❌ No valid response from API:", data);
    }
  } catch (error) {
    console.error("❌ Error fetching answer:", error);
  }
}

getAnswer();
