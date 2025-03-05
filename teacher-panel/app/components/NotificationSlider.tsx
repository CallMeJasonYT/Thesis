"use client";
import { useState, useEffect } from "react";
import { NotificationIcon, XIcon } from "../icons";
import Notification from "./Notification";
import { useWebSocket } from "../contexts/WebSocketContext";

const NotificationSlider = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const { addListener, removeListener } = useWebSocket();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDismiss = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStageTimeNotification = (data: {
    username: string;
    room: string;
    stage: string;
    time: string;
  }) => {
    const message = `⚠️ ${data.username} has been stuck in ${data.room}, stage ${data.stage}, for ${data.time} seconds!`;
    setNotifications((prev) => [...prev, { message }]);
  };

  useEffect(() => {
    // Add the listener when the component mounts
    addListener("StageTimeNotification", handleStageTimeNotification);

    // Cleanup listener when the component unmounts
    return () => {
      removeListener("StageTimeNotification", handleStageTimeNotification);
    };
  }, [addListener, removeListener]);

  return (
    <div>
      <button onClick={toggleSidebar}>
        <span style={{ display: isSidebarOpen ? "none" : "block" }}>
          <NotificationIcon className="text-white w-8" />
        </span>
      </button>

      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 bg-neutral transition-opacity ${
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
        <div className="relative p-4 text-center">
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
