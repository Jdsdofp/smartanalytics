import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// pasta com o build do Vite
const distPath = path.join(__dirname, "dist");

// servir arquivos estáticos (build do React)
app.use(express.static(distPath));

// fallback para index.html (SPA React Router)
app.get("/*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
