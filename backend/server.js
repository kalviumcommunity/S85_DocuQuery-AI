import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import { answerQuestions } from "./services/rag.service.js";

// Enable debug logging
process.env.DEBUG = 'app:*';

// Get current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
try {
  const envPath = path.resolve(process.cwd(), '.env');
  console.log(`Loading environment from: ${envPath}`);
  
  dotenv.config({ path: envPath });
  console.log('Environment variables loaded successfully');
  console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '*** (Hidden)' : 'Not set');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***' : 'Not set');
  console.log('Using model:', process.env.GROQ_MODEL || 'llama3-70b-8192');
} catch (error) {
  console.error('Failed to load .env file:', error);
  process.exit(1);
}

const app = express();

// Configure CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});
// Simple in-memory storage for document chunks
let documentChunks = {};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload document endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
    
    res.json({
      success: true,
      message: "File uploaded successfully",
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: false,
      error: "Error uploading file",
      details: error.message 
    });
  }
});

// Ask questions about a document
app.post("/api/ask", async (req, res) => {
  console.log('Received /api/ask request:', {
    body: req.body,
    headers: req.headers
  });

  try {
    const { documentPath, questions, options = {} } = req.body;

    if (!documentPath || !questions || !Array.isArray(questions)) {
      const error = new Error("Invalid request format: documentPath and questions array are required");
      error.status = 400;
      throw error;
    }

    // Resolve the document path
    let absolutePath;
    
    // If it's already an absolute path, use it directly
    if (path.isAbsolute(documentPath)) {
      absolutePath = documentPath;
    } 
    // If it's a path from the uploads directory
    else if (documentPath.startsWith('uploads/')) {
      absolutePath = path.join(process.cwd(), documentPath);
    }
    // Otherwise, try to resolve it relative to the server directory
    else {
      absolutePath = path.join(__dirname, documentPath);
    }

    console.log(`Processing document: ${absolutePath}`);
    
    // Ensure the file exists
    if (!fs.existsSync(absolutePath)) {
      // Try an alternative path in case the file is in the uploads directory
      const altPath = path.join(process.cwd(), 'uploads', path.basename(documentPath));
      if (fs.existsSync(altPath)) {
        absolutePath = altPath;
        console.log(`Found document at alternative path: ${absolutePath}`);
      } else {
        throw new Error(`Document not found at path: ${absolutePath} or ${altPath}`);
      }
    }

    // Process the document and answer questions
    console.log(`Answering ${questions.length} questions...`);
    const results = await answerQuestions(absolutePath, questions, {
      model: options.model || 'llama3-70b-8192',
      concepts: options.concepts || ['dynamic', 'chain-thought'],
      ...options
    });

    console.log(`Successfully answered ${results.length} questions`);
    
    res.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/ask:", error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack })
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple text chunking function
function chunkText(text, chunkSize = 1200, overlap = 200) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start >= text.length - overlap) break;
  }
  
  return chunks;
}

// Simple search function
function searchChunks(chunks, query, topK = 4) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

  const scoredChunks = chunks.map((chunk, index) => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;

    if (chunkLower.includes(queryLower)) {
      score += 10;
    }

    queryWords.forEach(word => {
      const wordCount = (chunkLower.match(new RegExp(word, 'g')) || []).length;
      score += wordCount * 2;
    });

    return { chunk, score, index };
  });

  return scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
}

// Mock Groq response function
function generateMockResponse(question, context, concepts = []) {
  const conceptText = concepts.length > 0 ? ` using ${concepts.join(', ')} approach` : '';
  return `Mock AI Response${conceptText}: Based on the document context, here's an analysis of "${question}". The document contains relevant information that would be processed by the AI model to provide a comprehensive answer.`;
}


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔍 Debug mode: ${process.env.DEBUG ? 'enabled' : 'disabled'}`);
  console.log(`🌐 CORS enabled for: http://localhost:5174`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});
