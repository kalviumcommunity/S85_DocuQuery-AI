import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads"),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname || ".pdf")}`)
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ok = /pdf$/i.test(path.extname(file.originalname));
    cb(ok ? null : new Error("Only PDF files are allowed"), ok);
  }
});

// POST /upload  (form-data: pdf=<file>)
router.post("/", upload.single("pdf"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  // Return local path you can send to /ask
  const filePath = `uploads/${req.file.filename}`;
  return res.json({ filePath });
});

export default router;
