// cloud.js
const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const port = 3000;

// Express nur als Beispiel REST-Server
app.get("/", (req, res) => res.send("Cloud Server läuft"));
app.listen(port, () => console.log(`Express läuft auf Port ${port}`));

// WebSocket Server für User
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set();

wss.on("connection", ws => {
    clients.add(ws);
    console.log("Neuer User verbunden");

    ws.on("close", () => {
        clients.delete(ws);
        console.log("User getrennt");
    });

    ws.on("message", message => {
        // Optional: User -> Server Nachrichten weiterleiten
        console.log("Nachricht vom User:", message.toString());
    });
});

// Funktion um Daten vom MC Server zu verteilen
function broadcastToUsers(data) {
    for (const client of clients) {
        if (client.readyState === 1) client.send(data);
    }
}

// Export broadcast, damit PY Server Proxy die Daten senden kann
module.exports = { broadcastToUsers };
