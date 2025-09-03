import fs from "fs";
import path from "path";
import pdf from "pdf-parse/lib/pdf-parse.js";   // ✅ use library entry
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.resolve(__dirname, "../server/data/meos/MPG-MEOS-Q3-2025-Global-Report.pdf");
const jsonPath = path.resolve(__dirname, "../server/data/meos/meos.json");

async function extract() {
  console.log("📂 Reading:", pdfPath);

  const buffer = fs.readFileSync(pdfPath);
  const data = await pdf(buffer);

  // Split text into paragraphs (rough cut by double newline)
  const paragraphs = data.text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  // Build JSON structure
  const meosData = paragraphs.map((p, i) => ({
    id: i + 1,
    snippet: p
  }));

  fs.writeFileSync(jsonPath, JSON.stringify(meosData, null, 2), "utf-8");
  console.log(`✅ Extracted ${meosData.length} snippets into ${jsonPath}`);
}

extract().catch(err => console.error("❌ Error:", err));
