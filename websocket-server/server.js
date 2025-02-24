const WebSocket = require("ws");

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map(); // Store clients with an ID
const roomsActivity = new Map();

console.log("WebSocket server is running on ws://localhost:8080");

wss.on("connection", function connection(ws) {
  const userID = generateUniqueID(); // Generate a unique ID
  clients.set(ws, { id: userID, room: null, username: null });

  console.log(`A new client connected with ID: ${userID}`);

  ws.on("message", function incoming(message) {
    console.log(`Received message: ${message}`);

    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case "online-players-request":
          console.log(`Webpage requested client count: ${clients.size}`);
          ws.send(
            JSON.stringify({
              type: "online-players-response",
              count: clients.size,
            })
          );
          break;
        case "active-rooms":
          if (!roomsActivity.has(data.room)) {
            roomsActivity.set(data.room, { count: 0, users: [] });
          }

          const roomData = roomsActivity.get(data.room);

          // Get client info
          const clientInfo = clients.get(ws);
          clientInfo.room = data.room;
          clientInfo.username = data.username;

          if (!roomData.users.includes(data.username)) {
            roomData.count += 1;
            roomData.users.push(data.username);
          }

          console.log(
            console.log(
              "Current Rooms Activity:",
              JSON.stringify([...roomsActivity.entries()], null, 2)
            ) +
              ` Room: ${data.room}, Active Count: ${roomData.count}, Users: ${roomData.users}`
          );
          break;
        case "active-rooms-request":
          ws.send(
            JSON.stringify({
              type: "active-rooms-response",
              rooms: [...roomsActivity.keys()],
            })
          );
          break;
      }
    } catch (error) {
      console.error("Failed to parse incoming message:", error);
    }
  });

  ws.on("close", function close() {
    console.log(`Client with ID ${clients.get(ws)?.id} disconnected`);

    // Remove user from their room if they were in one
    const clientInfo = clients.get(ws);
    if (clientInfo && clientInfo.room) {
      const roomData = roomsActivity.get(clientInfo.room);

      if (roomData) {
        roomData.users = roomData.users.filter(
          (user) => user !== clientInfo.username
        );
        roomData.count = roomData.users.length;

        // If no users left, delete the room entry
        if (roomData.count === 0) {
          roomsActivity.delete(clientInfo.room);
        }
      }
    }
    console.log(
      "Current Rooms Activity:",
      JSON.stringify([...roomsActivity.entries()], null, 2)
    );

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

// Function to generate a unique ID (simple version)
function generateUniqueID() {
  return Math.random().toString(36).substr(2, 9);
}
