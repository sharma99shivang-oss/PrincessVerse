import { io } from "socket.io-client";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const socket = io(API_URL, {
  withCredentials: true,
  // Read the latest access token for every initial connection/reconnect.
  auth: (callback) => {
    callback({
      token: localStorage.getItem("pv_access_token"),
    });
  },
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// The singleton is configured here; lifecycle listeners are registered by
// ChatProvider so they are mounted and cleaned up exactly once per provider.
export default socket;