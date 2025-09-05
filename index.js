const express = require("express");
const http = require("http");
const path = require("path");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const userChannels = new Map(); // userId -> ws
let serverProxyWs = null;

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.send("Cloud läuft"));

wss.on("connection", ws => {
    ws.on("message", (message, isBinary) => {
        if (isBinary) {
            if (ws === serverProxyWs) {
                // Binary vom Server → an richtigen User
                const uid = message.readUInt32BE(0);
                const payload = message.subarray(4);
                const userWs = userChannels.get(uid);
                if (userWs && userWs.readyState === 1) {
                    const buf = Buffer.alloc(4 + payload.length);
                    buf.writeUInt32BE(uid, 0);
                    payload.copy(buf, 4);
                    userWs.send(buf, { binary: true });
                }
            } else {
                // Binary vom User → an Server weiterleiten
                if (serverProxyWs && serverProxyWs.readyState === 1) {
                    serverProxyWs.send(message, { binary: true });
                }
            }
            return;
        }

        // JSON Nachrichten
        let data;
        try { data = JSON.parse(message.toString()); } catch { return; }

        if (data.type === "register_user") {
            userChannels.set(data.userId, ws);
            console.log("User registriert:", data.userId);
        } else if (data.type === "register_server") {
            serverProxyWs = ws;
            console.log("Server registriert");
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

server.listen(3000, () => console.log("Cloud läuft auf Port 3000"));
