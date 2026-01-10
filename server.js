//server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 🔓 LIBERAR PARA SER USADO EM IFRAME
app.use((req, res, next) => {
  // Remove bloqueio antigo se existir
  res.removeHeader("X-Frame-Options");

  // Permite ser embedado
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors *",
    "default-src 'self'; frame-src 'self' https://analyticsapp.smartxhub.cloud"
  );

  next();
});


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
