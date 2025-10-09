const http = require("http");
const WebSocket = require("ws");

// HTTP-Server für die Testseite
const server = http.createServer((req, res) => {
    // Testseite ausliefern
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>WS Test</title></head>
            <body>
                <h1>WebSocket Test</h1>
                <button id="connect">Verbinden</button>
                <pre id="log"></pre>
                <script>
                    const log = msg => {
                        const pre = document.getElementById("log");
                        pre.textContent += msg + "\\n";
                        console.log(msg);
                    };

                    document.getElementById("connect").onclick = () => {
                        // Dynamisch Host aus der Seite nehmen
                        const host = location.host;
                        const protocol = location.protocol === "https:" ? "wss:" : "ws:";
                        const wsUrl = protocol + "//" + host;
                        log("Verbindung zu " + wsUrl);

                        const ws = new WebSocket(wsUrl);

                        ws.onopen = () => log("Verbunden!");
                        ws.onmessage = e => log("Server: " + e.data);
                        ws.onerror = e => log("Fehler: " + e);
                        ws.onclose = () => log("Verbindung geschlossen");

                        ws.onopen = () => ws.send("Hallo Server!");
                    };
                </script>
            </body>
            </html>
        `);
    } else {
        res.writeHead(404);
        res.end("Nicht gefunden");
    }
});

// WebSocket-Server
const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
    console.log("Client verbunden");
    ws.send("Hallo vom Server!");

    ws.on("message", msg => {
        console.log("Nachricht vom Client:", msg);
        ws.send(`Server empfängt: ${msg}`);
    });
});

// Server starten
const PORT = process.env.PORT || 1000;
server.listen(PORT, () => {
    console.log("Server läuft auf Port", PORT);
});
