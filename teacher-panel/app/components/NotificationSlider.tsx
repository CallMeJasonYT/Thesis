"use client";
import { useState, useEffect } from "react";
import { NotificationIcon, XIcon } from "../icons";
import Notification from "./Notification";
import { useWebSocket } from "../contexts/WebSocketContext";

const NotificationSlider = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { username: string; message: string }[]
  >([]);
  const { sendMessage, addListener, removeListener, isConnected } =
    useWebSocket();

  const hasNotifications = notifications.length > 0;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDismiss = (index: number) => {
    setNotifications((prev) => {
      const updatedNotifications = [...prev];
      const dismissedNotification = updatedNotifications.splice(index, 1)[0];

      if (dismissedNotification) {
        sendMessage({
          type: "DismissNotification",
          username: dismissedNotification.username,
        });
      }

      return updatedNotifications;
    });
  };

  const handleStageTimeNotification = (data: {
    username: string;
    room: string;
    stage: string;
    time: string;
  }) => {
    const message = `⚠️ ${data.username} has been stuck in ${data.room}, stage ${data.stage}, for ${data.time} seconds!`;
    setNotifications((prev) => [...prev, { username: data.username, message }]);
  };

  const handleStoredNotifications = (data: { notifications: any[] }) => {
    const storedMessages = data.notifications.map((notif) => ({
      username: notif.username,
      message: `⚠️ ${notif.username} has been stuck in ${notif.room}, stage ${notif.stage}, for ${notif.time} seconds!`,
    }));

    setNotifications((prev) => [...prev, ...storedMessages]);
  };

  useEffect(() => {
    addListener("StoredStageNotifications", handleStoredNotifications);
    addListener("StageTimeNotification", handleStageTimeNotification);

    if (isConnected) {
      sendMessage({ type: "StoredStageNotifications" });
    }

    return () => {
      removeListener("StageTimeNotification", handleStageTimeNotification);
      removeListener("StoredStageNotifications", handleStoredNotifications);
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

      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 bg-dark transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
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
                username={notification.username} // Pass username to Notification component
                message={notification.message}
                onDismiss={() => handleDismiss(index)}
                onInspect={() => console.log("Inspect Now clicked")}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSlider;
