import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  getNotifications,
  type AppNotification,
} from "@/app/services/notifications.service";

const SOCKET_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const items = await getNotifications(50);
        if (!active) return;
        setNotifications(items);
      } catch (error) {
        console.error("Unable to load notifications", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const pollTimer = setInterval(load, 30000);

    // Real-time socket connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 5000,
    });
    socketRef.current = socket;

    socket.on("connect", () => console.log("📡 Socket connected for notifications"));
    socket.on("notification", (notif: AppNotification) => {
      if (active) {
        setNotifications(prev => [notif, ...prev]);
      }
    });
    socket.on("disconnect", () => console.log("📡 Socket disconnected"));

    return () => {
      active = false;
      clearInterval(pollTimer);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { notifications, loading };
}
