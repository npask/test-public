// cloud.js
const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const port = 3000;
app.get("/", (req, res) => res.send("Cloud Server läuft"));
app.listen(port, () => console.log(`Express läuft auf Port ${port}`));

const wss = new WebSocketServer({ port: 8080 });
const userChannels = new Map(); // userId -> ws
let serverProxyWs = null;

wss.on("connection", ws => {
    ws.on("message", message => {
        let data;
        try { data = JSON.parse(message.toString()); } 
        catch { return; }

        if (data.type === "register_user") {
            userChannels.set(data.userId, ws);
            console.log(`User ${data.userId} verbunden`);
        } else if (data.type === "register_server") {
            serverProxyWs = ws;
            console.log("Server Proxy verbunden");
        } else if (data.type === "to_server") {
            // User -> Server Proxy
            if (serverProxyWs && serverProxyWs.readyState === 1)
                serverProxyWs.send(JSON.stringify({ userId: data.userId, payload: data.payload }));
        } else if (data.type === "to_user") {
            // Server Proxy -> User
            const userWs = userChannels.get(data.userId);
            if (userWs && userWs.readyState === 1)
                userWs.send(JSON.stringify({ payload: data.payload }));
        }
    });

    ws.on("close", () => {
        for (let [id, socket] of userChannels) {
            if (socket === ws) userChannels.delete(id);
        }
        if (ws === serverProxyWs) serverProxyWs = null;
    });
});
