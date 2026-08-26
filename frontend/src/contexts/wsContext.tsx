import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { endpoints } from "../utils/endpoints";
import { useNotifications } from "./notificationContext";
import { useAuth } from "./authContext";

type WSContextType = {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
};

const WSContext = createContext<WSContextType | null>(null);

export function WSProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const hasConnected = useRef(false);
  const { addNotification } = useNotifications();
  const { user, loading } = useAuth();

  const connect = () => {
    if (socketRef.current || hasConnected.current || loading || !user) return;

    hasConnected.current = true;
    const socket = new WebSocket(endpoints.subscribe);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        addNotification(notification);
      } catch {
        console.log("Message from server: ", event.data);
      }
    };

    socket.onclose = () => {
      console.log("WS disconnected");
      setIsConnected(false);
      socketRef.current = null;
      hasConnected.current = false;
    };

    socket.onerror = (error) => {
      console.error("WS error:", error);
      setIsConnected(false);
      socketRef.current = null;
      hasConnected.current = false;
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      hasConnected.current = false;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      connect();
    } else if (!user) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, loading]);

  return (
    <WSContext.Provider value={{ isConnected, connect, disconnect }}>
      {children}
    </WSContext.Provider>
  );
}

export function useWS() {
  const context = useContext(WSContext);

  if (!context) {
    throw new Error("useWS must be used inside WSProvider");
  }

  return context;
}
