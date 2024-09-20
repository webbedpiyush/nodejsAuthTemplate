const fs = require("fs");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const path = require("path");

const PORT = 8000;
const app = express();
app.use(helmet());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

server.listen(PORT, () => {
  console.log(`the server is listening on ${PORT}...`);
});
