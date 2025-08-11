const fetch = require("node-fetch");
const dotenv = require("dotenv");
const readlineSync = require("readline-sync");

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY || "demo_api_key";

if (!API_KEY) {
  console.error("❌ Missing GROQ_API_KEY in .env");
  process.exit(1);
}

function getMultilineInput(prompt) {
  console.log(`${prompt} (Type 'END' or press Enter twice to finish):`);
  let lines = [];
  let emptyCount = 0;

  while (true) {
    const line = readlineSync.question("");
    if (line.trim() === "") emptyCount++;
    else emptyCount = 0;

    if (line.trim().toUpperCase() === "END" || emptyCount === 2) {
      break;
    }
    lines.push(line);
  }

  return lines.join("\n");
}

async function fetchData(prompt) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: `Fetched data based on dynamic prompt: "${prompt}"`,
      });
    }, 500);
  });
}

async function main() {
  console.log("Welcome to the Dynamic Prompt Fetcher!");
  console.log("Type 'exit' at any prompt to quit.\n");

  try {
    const topic = readlineSync.question("Enter a topic or question you want to fetch data about: ");

    if (topic.trim().toLowerCase() === "exit") {
      console.log("Exiting program. Goodbye!");
      process.exit(0);
    }

    const dynamicPrompt = `Please provide detailed information on: ${topic}`;
    const context = getMultilineInput("Provide additional context or details (optional)");

    const fullPrompt = context ? `${dynamicPrompt}\nContext:\n${context}` : dynamicPrompt;

    console.log("\nFetching data, please wait...\n");
    const result = await fetchData(fullPrompt);

    if (result.success) {
      console.log("Response:");
      console.log(result.data);
    } else {
      console.error("Failed to fetch data");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
