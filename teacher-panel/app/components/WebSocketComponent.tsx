import React, { useEffect, useState } from "react";
import WebSocketManager from "../utils/WebSocketManager";

interface Position {
  x: number;
  y: number;
  z: number;
}

const WebSocketComponent: React.FC<{ wsManager: WebSocketManager }> = ({ wsManager }) => {
  const [objectPosition, setObjectPosition] = useState<Position | null>(null);

  useEffect(() => {
    const handlePositionMessage = (event: Event) => {
      const customEvent = event as CustomEvent<{ position: Position }>;
      setObjectPosition(customEvent.detail.position);
    };

    wsManager.addEventListener("positionUpdate", handlePositionMessage);

    return () => {
      wsManager.removeEventListener("positionUpdate", handlePositionMessage);
    };
  }, [wsManager]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-700">Object Position</h3>
      {objectPosition ? (
        <p className="text-gray-600">
          X: <span className="text-blue-600">{objectPosition.x}</span>, Y:{" "}
          <span className="text-blue-600">{objectPosition.y}</span>, Z:{" "}
          <span className="text-blue-600">{objectPosition.z}</span>
        </p>
      ) : (
        <p className="text-gray-500">No position data received yet.</p>
      )}
    </div>
  );
};

export default WebSocketComponent;
