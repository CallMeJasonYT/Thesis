import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

const WebSocketHandler = ({
  onOnlinePlayersUpdate,
  onActiveRoomsUpdate,
}: {
  onOnlinePlayersUpdate?: (count: number) => void;
  onActiveRoomsUpdate?: (count: number) => void;
}) => {
  const { sendMessage, addListener, removeListener } = useWebSocket();

  useEffect(() => {
    // Handle online players count update
    const handleOnlinePlayers = (data: { count: number }) => {
      if (onOnlinePlayersUpdate) onOnlinePlayersUpdate(data.count);
    };

    // Handle active rooms update
    const handleActiveRooms = (data: {
      rooms: Record<string, { count: number; users: string[] }>;
    }) => {
      if (onActiveRoomsUpdate) {
        console.log("Active Rooms:", Object.keys(data.rooms).length);
        onActiveRoomsUpdate(Object.keys(data.rooms).length);
      }
    };

    addListener("online-players-response", handleOnlinePlayers);
    addListener("active-rooms-response", handleActiveRooms);

    sendMessage({ type: "online-players-request" });
    sendMessage({ type: "active-rooms-request" });

    return () => {
      removeListener("online-players-response", handleOnlinePlayers);
      removeListener("active-rooms-response", handleActiveRooms);
    };
  }, [addListener, removeListener, sendMessage]);

  return null;
};

export default WebSocketHandler;
