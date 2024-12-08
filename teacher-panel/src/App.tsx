import React from 'react';
import WebSocketManager from './WebSocketManager';
import WebSocketComponent from './WebSocketComponent';
import PlayerActivity from './PlayerActivity';

const wsManager = new WebSocketManager('ws://localhost:8080'); // Central WebSocketManager instance

const App = () => (
    <div>
        <WebSocketComponent wsManager={wsManager} />
        <PlayerActivity wsManager={wsManager} />
    </div>
);

export default App;
