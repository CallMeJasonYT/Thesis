"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Notification from "./Notification";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useNotification } from "@/contexts/NotificationContext";
import { IconBellExclamation, IconX } from "@tabler/icons-react";

const NotificationSlider = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { notifications, addNotification, removeNotification } =
    useNotification();
  const { sendMessage, addListener, removeListener, isConnected } =
    useWebSocket();
  const router = useRouter();
  const hasNotifications = notifications.length > 0;

  const hasFetchedNotifications = useRef(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDismiss = (username: string) => {
    removeNotification(username);
    sendMessage({ type: "DismissNotification", username });
  };

  const handleInspect = (username: string) => {
    toggleSidebar();
    router.push(`/Inspect?username=${username}`);
  };

  const handleStageTimeNotification = useCallback(
    (data: any) => {
      const notificationMessage =
        data.enhancedMessage ||
        data.message ||
        `⚠️ ${data.username} has been stuck in ${data.room}, stage ${data.stage}, for ${data.time} seconds!`;

      addNotification({
        username: data.username,
        message: notificationMessage,
      });
    },
    [addNotification]
  );

  const handleStoredNotifications = useCallback(
    (notifications: any[]) => {
      notifications.forEach((notification) => {
        // For each stored notification, process it like a new notification
        handleStageTimeNotification(notification);
      });
    },
    [handleStageTimeNotification]
  );

  const handleRemoveUserNotifications = useCallback(
    (data: { username: string }) => {
      removeNotification(data.username);
    },
    [removeNotification]
  );

  useEffect(() => {
    addListener("StoredStageNotifications", handleStoredNotifications);
    addListener("StageTimeNotification", handleStageTimeNotification);
    addListener("RemoveUserNotifications", handleRemoveUserNotifications);

    if (isConnected && !hasFetchedNotifications.current) {
      sendMessage({ type: "StoredStageNotifications" });
      hasFetchedNotifications.current = true; // Mark as fetched
    }

    return () => {
      removeListener("StageTimeNotification", handleStageTimeNotification);
      removeListener("StoredStageNotifications", handleStoredNotifications);
      removeListener("RemoveUserNotifications", handleRemoveUserNotifications);
    };
  }, [
    addListener,
    removeListener,
    sendMessage,
    isConnected,
    handleStoredNotifications,
    handleStageTimeNotification,
    handleRemoveUserNotifications,
  ]);

  return (
    <div className="p-1">
      <IconBellExclamation
        onClick={toggleSidebar}
        className={`w-7 xl:w-8 transition-all cursor-pointer ${
          hasNotifications ? "animate-bell text-red-500" : "text-white"
        }`}
      />

      <div
        className={`fixed inset-0 bg-dark transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      <div
        className={`fixed left-0 top-0 w-full sm:w-96 md:w-[400px] lg:w-[500px] xl:w-[700px] z-15 h-full bg-zinc-950 transition-all transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative p-6 text-center">
          <div className="flex justify-between">
            <h3 className="font-semibold text-xl">Notifications</h3>
            <button onClick={toggleSidebar}>
              <IconX className="text-white cursor-pointer" />
            </button>
          </div>

          <ul>
            {notifications.map((notification, index) => (
              <Notification
                key={index}
                username={notification.username}
                message={notification.message}
                onDismiss={() => handleDismiss(notification.username)}
                onInspect={() => handleInspect(notification.username)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSlider;
