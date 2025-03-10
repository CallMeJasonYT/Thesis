"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotificationIcon, XIcon } from "../icons";
import Notification from "./Notification";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useNotification } from "../contexts/NotificationContext"; // Use the notification context

const NotificationSlider = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { notifications, addNotification, removeNotification } =
    useNotification();
  const { sendMessage, addListener, removeListener, isConnected } =
    useWebSocket();
  const router = useRouter();

  const hasNotifications = notifications.length > 0;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDismiss = (username: string) => {
    removeNotification(username);
    sendMessage({
      type: "DismissNotification",
      username,
    });
  };

  const handleInspect = (username: string) => {
    toggleSidebar();
    router.push(`/Inspect?username=${username}`);
  };

  const handleStageTimeNotification = (data: {
    username: string;
    room: string;
    stage: string;
    time: string;
  }) => {
    const message = `⚠️ ${data.username} has been stuck in ${data.room}, stage ${data.stage}, for ${data.time} seconds!`;
    addNotification({ username: data.username, message });
  };

  const handleStoredNotifications = (data: { notifications: any[] }) => {
    const storedMessages = data.notifications.map((notif) => ({
      username: notif.username,
      message: `⚠️ ${notif.username} has been stuck in ${notif.room}, stage ${notif.stage}, for ${notif.time} seconds!`,
    }));

    storedMessages.forEach(addNotification);
  };

  // Handle notification removal when a player disconnects
  const handleRemoveUserNotifications = (data: { username: string }) => {
    removeNotification(data.username);
  };

  useEffect(() => {
    addListener("StoredStageNotifications", handleStoredNotifications);
    addListener("StageTimeNotification", handleStageTimeNotification);
    addListener("RemoveUserNotifications", handleRemoveUserNotifications);

    if (isConnected) {
      sendMessage({ type: "StoredStageNotifications" });
    }

    return () => {
      removeListener("StageTimeNotification", handleStageTimeNotification);
      removeListener("StoredStageNotifications", handleStoredNotifications);
      removeListener("RemoveUserNotifications", handleRemoveUserNotifications);
    };
  }, [addListener, removeListener, sendMessage, isConnected]);

  return (
    <div>
      <button onClick={toggleSidebar}>
        <NotificationIcon
          className={`w-8 transition-all ${
            hasNotifications ? "animate-bell text-red-500" : "text-white"
          }`}
        />
      </button>

      <div
        className={`fixed inset-0 bg-dark transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      <div
        className={`fixed left-0 top-0 w-full sm:w-96 md:w-[400px] lg:w-[500px] xl:w-[700px] h-full bg-zinc-950 transition-all transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative p-6 text-center">
          <div className="flex justify-between">
            <h3 className="font-semibold text-xl">Notifications</h3>
            <button onClick={toggleSidebar}>
              <XIcon className="text-white w-6 h-6" />
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
