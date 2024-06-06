import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Inicia el servidor HTTP
const server = app.listen(process.env.PORT || 4000, () => {
  console.log(`Server listening on port ${process.env.PORT || 4000}`);
});

// Configura el WebSocketServer utilizando el servidor HTTP
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error occurred", error);
  });

  ws.on("close", (code, reason) => {
    console.log(`Client disconnected with code ${code}, reason: ${reason}`);
  });
});

function broadcastMessage(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

app.post("/api/webhook", (req, res) => {
  console.log("Received POST request from another server");
  const { message, id } = req.body;
  if (message === "payment-success") {
    console.log(`Broadcasting message: ${message} with id: ${id}`);
    broadcastMessage({ message, id });
  }
  res.json({ message: "OK" });
});
