import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const socket = io(API_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("💖 Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected:", reason);
});

export default socket;