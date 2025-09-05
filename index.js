// cloud.js
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();

// Express Route
app.get("/", (req, res) => res.send("Express + WS auf gleichem Port läuft"));

// HTTP Server erstellen
const server = http.createServer(app);

// WebSocket Server auf demselben HTTP Server
const wss = new WebSocketServer({ server });
const userChannels = new Map();
let serverProxyWs = null;

wss.on("connection", ws => {
    ws.on("message", (message, isBinary) => {
        if (isBinary) {
            // Hier sind die rohen MC-Daten!
            // → Entscheide, ob sie vom User oder vom Server kommen
            if (ws === serverProxyWs) {
                // vom Server an User weiterleiten
                for (const [uid, userWs] of userChannels) {
                    if (userWs.readyState === 1) {
                        userWs.send(message, { binary: true });
                    }
                }
            } else {
                // vom User an Server weiterleiten
                if (serverProxyWs && serverProxyWs.readyState === 1) {
                    serverProxyWs.send(message, { binary: true });
                }
            }
            return;
        }

        // JSON-Steuernachrichten
        let data;
        try { data = JSON.parse(message.toString()); }
        catch { return; }

        if (data.type === "register_user") {
            userChannels.set(data.userId, ws);
        } else if (data.type === "register_server") {
            serverProxyWs = ws;
        } else if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
        }
    });

    ws.on("close", () => {
        for (let [id, socket] of userChannels) {
            if (socket === ws) userChannels.delete(id);
        }
        if (ws === serverProxyWs) serverProxyWs = null;
    });
});

// Server starten
server.listen(3000, () => console.log("Express + WS läuft auf Port 3000"));
