import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const socket = io(API_URL, {
  withCredentials: true,

  // Local + Render dono par stable connection
  transports: ["websocket", "polling"],

  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Debug (Console me dikhega)
socket.on("connect", () => {
  console.log("💖 Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("🚨 Socket Error:", err.message);
});

export default socket;