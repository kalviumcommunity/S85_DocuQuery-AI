require("dotenv").config();
const readline = require("readline-sync");
const buildPrompt = require("./promptTemplate");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askGroq(prompt) {
  const res = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });
  return res.choices[0].message.content.trim();
}

(async () => {
  console.log("📄 Zero-Shot Prompting with Groq (LLaMA3)");
  const document = readline.question("Paste document content:\n");
  const question = readline.question("Enter your question:\n");

  const prompt = buildPrompt(document, question);
  const answer = await askGroq(prompt);

  const output = [
    {
      question: question,
      answer: answer
    }
  ];

  console.log("\n🎯 Response:");
  console.log(JSON.stringify(output, null, 2));
})();
