const WebSocket = require("ws");

// Create a WebSocket server listening on port 8080
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

console.log("WebSocket server is running on ws://localhost:8080");

// Handle WebSocket connections
wss.on("connection", function connection(ws) {
  console.log("A new client connected");
  clients.add(ws);

  // Handle incoming messages from clients
  ws.on("message", function incoming(message) {
    console.log(`Received message: ${message}`);

    // Parse the incoming message
    try {
      const data = JSON.parse(message);

      if (data.type === "online-players-request") {
        console.log(`Webpage requested client count: ${clients.size}`);

        ws.send(
          JSON.stringify({
            type: "online-players-response",
            count: clients.size,
          })
        );
      }
    } catch (error) {
      console.error("Failed to parse incoming message:", error);
    }
  });

  // Handle connection closure
  ws.on("close", function close() {
    console.log("Client disconnected");
    clients.delete(ws);
  });

  function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});
