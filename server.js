import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getGeminiResponse } from "./api/getGeminiResponse.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist"); // assuming 'dist' folder is in project root
const app = express();
const PORT = process.env.PORT || 5174;

app.use(express.json());

// --- API Route for Gemini (test) ---
app.get("/api/gemini", getGeminiResponse);

// --- Serve static frontend ---
app.use(express.static(distPath));

app.listen(PORT, () => {
  console.log(`✅ Server running on PORT: ${PORT}`);
});
