"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  username: string;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (username: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => {
      console.log("Before update:", prev);

      // Find the index of the oldest notification with the same username
      const index = prev.findIndex(
        (notif) => notif.username === notification.username
      );

      let updatedNotifications;
      if (index !== -1) {
        // Remove the oldest notification
        updatedNotifications = [...prev];
        updatedNotifications.splice(index, 1);
        updatedNotifications.push(notification);
      } else {
        updatedNotifications = [...prev, notification];
      }

      console.log("After update:", updatedNotifications);
      return updatedNotifications;
    });
  };

  const removeNotification = (username: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.username !== username)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
