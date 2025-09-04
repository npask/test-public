const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Hallo von Render auf Port " + PORT);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server läuft auf http://0.0.0.0:${PORT}`);
});
