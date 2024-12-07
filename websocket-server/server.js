const WebSocket = require('ws');

// Create a WebSocket server listening on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

// Handle WebSocket connections
wss.on('connection', function connection(ws) {
    console.log('A new client connected');

    // Handle incoming messages from clients
    ws.on('message', function incoming(message) {
        console.log(`Received message: ${message}`);

        // Parse the incoming message
        try {
            const data = JSON.parse(message);
            
            console.log('Sending to WebPanel: ' + JSON.stringify(data))
            // Broadcast the message to all connected clients
            wss.clients.forEach(function each(client) {
                // Make sure the client is connected and is not the sender
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Handle connection closure
    ws.on('close', function close() {
        console.log('Client disconnected');
    });
});
