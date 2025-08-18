import { io, Socket } from "socket.io-client";

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io",
      withCredentials: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      timeout: 20000,
      extraHeaders: { "x-client": "expo" },
    });

    socket.on("connect", () => {
      console.log("[socket] connected", socket?.id);
    });
    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnect:", reason);
    });
    socket.on("connect_error", (err: any) => {
      console.log("[socket] connect_error:", err?.message || err);
    });
    socket.io.on("error", (err: any) => {
      console.log("[socket.io] error:", err?.message || err);
    });
    socket.io.on("reconnect_error", (err: any) => {
      console.log("[socket.io] reconnect_error:", err?.message || err);
    });
  }
  return socket;
};
