const WebSocket = require("ws");

const wss = new WebSocket.Server({
  port: 80,
  host: "0.0.0.0",
  handleProtocols: (protocols) => {
    console.log(protocols);
    if (protocols.has("web-panel")) {
      return "web-panel"; // Return a custom protocol name to identify the web panel
    }
  },
});

const clients = new Map();
const roomsActivity = new Map();
let webPanel = null;

console.log("WebSocket server is running on ws://localhost:80");

wss.on("connection", (ws, request) => {
  const protocol = request.headers["sec-websocket-protocol"];

  if (protocol === "web-panel") {
    console.log("Web Panel connected.");
    webPanel = ws;
  } else {
    // Handle other clients (game clients)
    clients.set(ws, { room: null, uuid: null });
    console.log(`New client connected. Total: ${clients.size}`);
  }

  broadcast({ type: "online-players-response", count: clients.size });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(data);
      handleMessage(ws, data);
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  });

  ws.on("close", () => handleDisconnection(ws));
});

function handleMessage(ws, data) {
  switch (data.type) {
    case "initial-connection":
      assignUUID(ws, data.playerUUID);
      break;
    case "online-players-request":
      broadcast({ type: "online-players-response", count: clients.size });
      break;
    case "active-rooms-request":
      broadcast({
        type: "active-rooms-response",
        rooms: Object.fromEntries(roomsActivity),
      });
      break;
    case "active-rooms":
      assignRoom(ws, data.room, data.uuid);
      break;
    case "ScreenshotRequest":
      requestScreenshot(data.uuid);
      break;
    case "ScreenshotUnityResponse":
      forwardScreenshot(data);
      break;
    case "StageTimeNotification":
      forwardStageTime(data);
      break;
  }
}

function assignUUID(ws, uuid) {
  const clientInfo = clients.get(ws);
  if (clientInfo) {
    clientInfo.uuid = uuid;
    console.log(`Assigned UUID ${uuid} to connection`);
  }
}

function assignRoom(ws, room, uuid) {
  const client = clients.get(ws);
  if (!client) return;

  client.room = room;
  client.uuid = uuid;
  console.log(`Assigned client ${uuid} to room ${room}`);

  if (!roomsActivity.has(room)) {
    roomsActivity.set(room, { count: 0, users: [] });
  }

  const roomData = roomsActivity.get(room);
  if (!roomData.users.includes(uuid)) {
    roomData.count += 1;
    roomData.users.push(uuid);
  }

  console.log(
    "Updated Rooms Activity:",
    JSON.stringify([...roomsActivity.entries()], null, 2)
  );
  broadcast({
    type: "active-rooms-response",
    rooms: Object.fromEntries(roomsActivity),
  });
}

function requestScreenshot(uuid) {
  const targetClient = findClientByUUID(uuid);
  if (targetClient) {
    targetClient.send(JSON.stringify({ type: "ScreenshotUnityRequest" }));
  } else {
    console.log(`Client with UUID ${uuid} not found or not connected.`);
  }
}

function forwardScreenshot(data) {
  console.log("Received screenshot from Unity.");
  if (webPanel && webPanel.readyState === WebSocket.OPEN) {
    console.log("Forwarding screenshot to Web Panel.");
    webPanel.send(JSON.stringify(data));
  } else {
    console.log("Web Panel is not connected.");
  }
}

function forwardStageTime(data) {
  if (webPanel && webPanel.readyState === WebSocket.OPEN) {
    console.log("Forwarding Stage Notification to Web Panel.");
    webPanel.send(JSON.stringify(data));
  } else {
    console.log("Web Panel is not connected.");
  }
}

function findClientByUUID(uuid) {
  for (const [ws, clientInfo] of clients.entries()) {
    if (clientInfo.uuid === uuid) return ws;
  }
  return null;
}

function handleDisconnection(ws) {
  if (ws === webPanel) {
    console.log("Web Panel disconnected.");
    webPanel = null;
    return;
  }

  const clientInfo = clients.get(ws);
  if (!clientInfo) return;

  console.log(`Client with UUID ${clientInfo.uuid} disconnected`);
  if (clientInfo.room) {
    removeUserFromRoom(clientInfo.room, clientInfo.uuid);
  }

  clients.delete(ws);
  console.log("Deleted client from clients map");
  broadcast({ type: "online-players-response", count: clients.size });
}

function removeUserFromRoom(room, uuid) {
  const roomData = roomsActivity.get(room);
  if (!roomData) return;

  roomData.users = roomData.users.filter((user) => user !== uuid);
  roomData.count = roomData.users.length;

  if (roomData.count === 0) {
    roomsActivity.delete(room);
    console.log(`Room ${room} is now empty and deleted.`);
  } else {
    console.log(`Updated users in room ${room}:`, roomData.users);
  }

  broadcast({
    type: "active-rooms-response",
    rooms: Object.fromEntries(roomsActivity),
  });
}

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
