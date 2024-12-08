import React, { useEffect, useState } from 'react';
import WebSocketManager from './WebSocketManager'; // Import the WebSocketManager

interface Position {
    x: number;
    y: number;
    z: number;
}

const WebSocketComponent: React.FC<{ wsManager: WebSocketManager }> = ({ wsManager }) => {
    const [objectPosition, setObjectPosition] = useState<Position | null>(null);

    useEffect(() => {
        const handlePositionMessage = (event: Event) => {
            console.log('Position event triggered:', event);
            const customEvent = event as CustomEvent<{ position: Position }>;
            setObjectPosition(customEvent.detail.position);
        };

        wsManager.addEventListener('positionUpdate', handlePositionMessage);

        return () => {
            wsManager.removeEventListener('positionUpdate', handlePositionMessage);
        };
    }, [wsManager]);

    return (
        <div>
            <h3>Object Position:</h3>
            {objectPosition ? (
                <p>
                    X: {objectPosition.x}, Y: {objectPosition.y}, Z: {objectPosition.z}
                </p>
            ) : (
                <p>No position data received yet.</p>
            )}
        </div>
    );
};

export default WebSocketComponent;
