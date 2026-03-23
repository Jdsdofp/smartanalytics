// //server.js
// import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = process.env.PORT || 3000;

// // 🔓 LIBERAR PARA SER USADO EM IFRAME
// app.use((req, res, next) => {
//   // Remove bloqueio antigo se existir
//   res.removeHeader("X-Frame-Options");

//   // Permite ser embedado
//   res.setHeader(
//     "Content-Security-Policy",
//     "frame-ancestors *",
//     "default-src 'self'; frame-src 'self' https://analyticsapp.smartxhub.cloud"
//   );

//   next();
// });


// // pasta com o build do Vite
// const distPath = path.join(__dirname, "dist");

// // servir arquivos estáticos (build do React)
// app.use(express.static(distPath));

// // fallback para index.html (SPA React Router)
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(distPath, "index.html"));
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Headers ──────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors *");
  next();
});

// ── Static + SPA ─────────────────────────────────────────────────────────────
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("/*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ── HTTP server (necessário para upgrade WebSocket) ───────────────────────────
const server = createServer(app);

// ── WebSocket proxy: /ws/lock?lock_ip=192.168.68.100 ─────────────────────────
const wss = new WebSocketServer({ server, path: "/ws/lock" });

wss.on("connection", (clientWs, req) => {
  const params = new URL(req.url, "http://localhost").searchParams;
  const lockIp = params.get("lock_ip") ?? "192.168.68.100";
  const espUrl = `ws://${lockIp}:81`;

  console.log(`[WsProxy] Cliente conectado → ESP32 ${espUrl}`);

  const espWs = new WebSocket(espUrl);

  espWs.on("open", () => {
    console.log(`[WsProxy] ESP32 conectado: ${espUrl}`);
    clientWs.send(JSON.stringify({ event: "proxy_connected", esp_url: espUrl, lock_ip: lockIp }));
  });

  // ESP32 → Browser
  espWs.on("message", (data) => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data);
  });

  // Browser → ESP32
  clientWs.on("message", (data) => {
    if (espWs.readyState === WebSocket.OPEN) espWs.send(data);
  });

  espWs.on("error", (e) => {
    console.error("[WsProxy] ESP32 erro:", e.message);
    clientWs.send(JSON.stringify({ event: "proxy_error", error: e.message }));
  });

  espWs.on("close", () => {
    console.warn("[WsProxy] ESP32 desconectou");
    clientWs.send(JSON.stringify({ event: "proxy_esp_disconnected" }));
    clientWs.close();
  });

  clientWs.on("close", () => {
    espWs.terminate();
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});