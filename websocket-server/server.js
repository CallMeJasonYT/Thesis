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

let webPanel = null;
const clients = new Map();
const roomsActivity = new Map();
const uuidToUsername = new Map();
let notifications = [];

console.log("WebSocket server has started Running!");

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
      assignUUID(ws, data.playerUUID, data.username);
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
    case "StoredStageNotifications":
      if (ws === webPanel) {
        notifications.forEach((notification) => {
          ws.send(JSON.stringify(notification));
        });
      }
    case "active-rooms":
      assignRoom(ws, data.room, data.uuid);
      break;
    case "ScreenshotRequest":
      requestScreenshot(data.username);
      break;
    case "ScreenshotUnityResponse":
      forwardScreenshot(data);
      break;
    case "StageTimeNotification":
      forwardStageTime(data);
      break;
    case "DismissNotification":
      eraseNotification(data);
    case "SendHint":
      forwardHint(data);
  }
}

function assignUUID(ws, uuid, username) {
  const clientInfo = clients.get(ws);
  if (clientInfo) {
    clientInfo.uuid = uuid;
    uuidToUsername.set(uuid, username);
    console.log(
      `Assigned UUID ${uuid} to connection with username ${username}`
    );
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

function requestScreenshot(username) {
  const targetClient = findClientByUsername(username);
  if (targetClient) {
    targetClient.send(JSON.stringify({ type: "ScreenshotUnityRequest" }));
  } else {
    console.log(`Client with username ${username} not found or not connected.`);
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
  // Remove any existing notifications with the same username
  const index = notifications.findIndex(
    (notif) => notif.username === data.username
  );
  if (index !== -1) {
    notifications.splice(index, 1);
    console.log(`Old notification for ${data.username} removed.`);
  }

  notifications.push(data);

  if (webPanel && webPanel.readyState === WebSocket.OPEN) {
    console.log("Forwarding Stage Notification to Web Panel.");
    webPanel.send(JSON.stringify(data));
  } else {
    console.log("Web Panel is not connected.");
  }
}

function eraseNotification(data) {
  const username = data.username;

  const index = notifications.findIndex((notif) => notif.username === username);
  if (index !== -1) {
    notifications.splice(index, 1);
    console.log(`Notification for ${username} erased.`);
  } else {
    console.log(`No notification found for ${username}.`);
  }
}

function forwardHint(data) {
  const username = data.username;
  const targetClient = findClientByUsername(username);
  if (targetClient) {
    targetClient.send(
      JSON.stringify({ type: "IncomingHint", message: data.message })
    );
  }
}

function findClientByUUID(uuid) {
  for (const [ws, clientInfo] of clients.entries()) {
    if (clientInfo.uuid === uuid) return ws;
  }
  return null;
}

function findClientByUsername(username) {
  // Step 1: Find the uuid based on the username
  for (const [uuid, storedUsername] of uuidToUsername.entries()) {
    if (storedUsername === username) {
      // Step 2: Now find the client by uuid in the clients map and return the ws connection
      for (const [ws, clientInfo] of clients.entries()) {
        if (clientInfo.uuid === uuid) {
          return ws;
        }
      }
    }
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

  // Get the username based on the client UUID
  const username = uuidToUsername.get(clientInfo.uuid);
  if (username) {
    removeUserNotifications(username); // Remove Notifications based on username
    uuidToUsername.delete(clientInfo.uuid); // Delete the UUID -> Username Mapping
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

function removeUserNotifications(username) {
  const initialLength = notifications.length;
  notifications = notifications.filter((notif) => notif.username !== username);

  if (notifications.length !== initialLength) {
    console.log(`Removed all notifications for ${username}`);

    if (webPanel && webPanel.readyState === WebSocket.OPEN) {
      webPanel.send(
        JSON.stringify({ type: "RemoveUserNotifications", username })
      );
    }
  }
}

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
