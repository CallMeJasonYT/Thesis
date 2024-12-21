"use client";

import React, { useState } from "react";
import "../styles/TeleportForm.css";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface TeleportFormProps {
  websocket: WebSocket;
}

const TeleportForm: React.FC<TeleportFormProps> = ({ websocket }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, z: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPosition((prevPosition) => ({
      ...prevPosition,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const teleportData = JSON.stringify({
        id: 1,
        position,
      });
      websocket.send(teleportData);
      console.log("Sent teleport data:", teleportData);
    } else {
      console.error("WebSocket is not open");
    }
  };

  return (
    <div className="teleport-form-container">
      <h3>Teleport Object</h3>
      <form onSubmit={handleSubmit} className="teleport-form">
        <label>
          X:
          <input
            type="number"
            name="x"
            value={position.x}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            name="y"
            value={position.y}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Z:
          <input
            type="number"
            name="z"
            value={position.z}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Teleport</button>
      </form>
    </div>
  );
};

export default TeleportForm;
