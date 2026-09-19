import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const socket = io(API_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
});

export default socket;