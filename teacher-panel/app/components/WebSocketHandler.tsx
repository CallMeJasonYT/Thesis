import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

const WebSocketHandler = ({
  onOnlinePlayersUpdate,
}: {
  onOnlinePlayersUpdate: (count: number) => void;
}) => {
  const { sendMessage, addListener, removeListener } = useWebSocket();

  useEffect(() => {
    const handleOnlinePlayers = (data: { count: number }) => {
      onOnlinePlayersUpdate(data.count);
    };

    addListener("online-players-response", handleOnlinePlayers);
    sendMessage({ type: "online-players-request" });

    return () => removeListener("online-players-response", handleOnlinePlayers);
  }, [addListener, removeListener, sendMessage]);

  return null;
};

export default WebSocketHandler;
