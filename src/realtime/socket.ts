import { io, Socket } from "socket.io-client";

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "https://bcare.my.id";
//https://t22bhmg5-4000.asse.devtunnels.ms/

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
      
    });
    socket.on("disconnect", (reason) => {
      
    });
    socket.on("connect_error", (err: any) => {
      
    });
    socket.io.on("error", (err: any) => {
      
    });
    socket.io.on("reconnect_error", (err: any) => {
      
    });
  }
  return socket;
};

