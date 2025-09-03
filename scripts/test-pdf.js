import fs from "fs";
import path from "path";
import pdf from "pdf-parse/lib/pdf-parse.js";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.resolve(__dirname, "../server/data/meos/MPG-MEOS-Q3-2025-Global-Report.pdf");

console.log("📂 Looking for PDF at:", pdfPath);

if (!fs.existsSync(pdfPath)) {
  console.error("❌ File not found");
  process.exit(1);
}

const buffer = fs.readFileSync(pdfPath);
console.log("✅ PDF loaded, size:", buffer.length);

pdf(buffer).then(data => {
  console.log("✅ PDF text length:", data.text.length);
  console.log("🔹 First 500 characters:\n", data.text.slice(0, 500));
}).catch(err => {
  console.error("❌ PDF parse failed:", err);
});
