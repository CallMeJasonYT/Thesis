"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: object) => void;
  addListener: (type: string, callback: (data: any) => void) => void;
  removeListener: (type: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false); // Track connection status
  const listeners = useRef(new Map<string, Set<(data: any) => void>>());

  useEffect(() => {
    const socket = new WebSocket("ws://host.docker.internal", "web-panel");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type && listeners.current.has(data.type)) {
        listeners.current.get(data.type)?.forEach((callback) => callback(data));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setTimeout(() => setWs(new WebSocket("ws://host.docker.internal")), 3000); // Auto-reconnect
    };

    setWs(socket);

    return () => socket.close();
  }, []);

  const sendMessage = (message: object) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const addListener = (type: string, callback: (data: any) => void) => {
    if (!listeners.current.has(type)) {
      listeners.current.set(type, new Set());
    }
    listeners.current.get(type)?.add(callback);
  };

  const removeListener = (type: string, callback: (data: any) => void) => {
    listeners.current.get(type)?.delete(callback);
  };

  return (
    <WebSocketContext.Provider
      value={{ ws, isConnected, sendMessage, addListener, removeListener }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context;
};
