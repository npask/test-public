const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Statische Datei (index.html) serven
app.use(express.static(__dirname + "/public"));

// WebSocket-Events
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.send("Willkommen beim WebSocket-Server!");

  ws.on("message", (msg) => {
    console.log("Client:", msg.toString());
    ws.send(`Server-Echo: ${msg}`);
  });

  ws.on("close", () => console.log("Client disconnected"));
});

// Server starten
const PORT = 3000;
server.listen(PORT, () =>
  console.log(`Server läuft auf http://localhost:${PORT}`)
);
