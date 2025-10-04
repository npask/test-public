import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import fs from "fs";

const app = express();

// Proxy für WebSocket
app.use("/ws", createProxyMiddleware({
  target: "ws://localhost:8080", // dein interner WebSocket-Server
  changeOrigin: true,
  ws: true
}));

http.createServer(options, app).listen(80, () => {
  console.log("Proxy läuft auf https://localhost (mit WSS)");
});
