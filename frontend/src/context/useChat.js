import { createContext, useContext } from "react";

// Kept separate from ChatProvider so Vite can Fast Refresh the component file.
export const ChatContext = createContext(null);

export function useChat() {
    return useContext(ChatContext);
}
