import fs from "fs";
import path from "path";
import axios from "axios";
import pdfParse from "pdf-parse";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Heuristic chunker with overlap (character-based, simple & fast)
function chunkText(text, chunkSize = 1200, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    const slice = text.slice(i, end).trim();
    if (slice) chunks.push(slice);
    if (end === text.length) break;
    i = end - overlap; // step back for overlap
    if (i < 0) i = 0;
  }
  return chunks;
}

async function loadPdfBuffer(documentPathOrUrl) {
  // If it's an http(s) URL, download it; otherwise read from local /uploads
  if (/^https?:\/\//i.test(documentPathOrUrl)) {
    const resp = await axios.get(documentPathOrUrl, { responseType: "arraybuffer" });
    return Buffer.from(resp.data);
  }
  // local path (e.g., "uploads/123.pdf")
  const localPath = path.isAbsolute(documentPathOrUrl)
    ? documentPathOrUrl
    : path.join(process.cwd(), documentPathOrUrl);
  
  if (!fs.existsSync(localPath)) {
    throw new Error(`PDF file not found: ${localPath}`);
  }
  return fs.readFileSync(localPath);
}

export async function extractAndChunk(documentPathOrUrl, chunkSize = 1200, overlap = 200) {
  try {
    // Handle text files directly
    if (typeof documentPathOrUrl === 'string' && 
        (documentPathOrUrl.endsWith('.txt') || documentPathOrUrl.endsWith('.md'))) {
      const text = fs.readFileSync(documentPathOrUrl, 'utf-8');
      return chunkText(text, chunkSize, overlap);
    }
    
    // Handle PDF files
    const buffer = await loadPdfBuffer(documentPathOrUrl);
    const data = await pdfParse(buffer);
    const text = (data?.text || "").replace(/\r/g, "");
    if (!text.trim()) return [];

    return chunkText(text, chunkSize, overlap);
  } catch (error) {
    console.error('Error in extractAndChunk:', error);
    throw error;
  }
}
