import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ApiClient } from "../../../api/client";
import { User } from "../../../api/user";
import { popup } from "../../scripts/popup-slide";
import { setupWebSocket } from "./websocket";
import { MsgType } from "../../../api/chat";


/*enum MsgType {
  INIT = "INIT",
  HISTORY = "HISTORY",
  MESSAGE = "MESSAGE",
  ERROR = "ERROR",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  CANDIDATE = "ICE-CANDIDATE",
  JOIN_VOCAL = "JOIN_VOCAL",
  LEAVE_VOCAL = "LEAVE_VOCAL",
  INIT_CONNECTION = "INIT_CONNECTION", // For the "connected" state (online/offline)
  CONNECTED = "CONNECTED" // For the "connected" state (online/offline)
}*/

type AuthContextType = {
  isConnected: boolean;
  isAdmin: boolean;
  me: User;
  updateConnection: () => Promise<void>;
  refreshMe: () => Promise<void>,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const [connected, setConnected] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const reconnectDelay = useRef<number>(1000); // 1s de base

  const refreshMe = useCallback(async () => {
    const client = new ApiClient();
    const user = await client.getMe();
    setMe(user);
  }, []);

  
  const updateConnection = useCallback(async () => {
    const client = new ApiClient();
    setIsConnected(client.isConnected());
    await client.refreshUser();
    setIsAdmin(client.isAdmin());
    await refreshMe();
  }, [refreshMe]);

  const onReconnect = () => {
      openWebSocket();
  };
      
  const openWebSocket = React.useCallback(() => {
      const user = new ApiClient();
      setupWebSocket({
          wsUrl: `ws://localhost:3000/online`,
          wsRef,
          authToken: user.getAuthToken(),
          handlers: {
            onOpen: () => {},
            onClose: () => {
              setConnected(false)
              popup("Déconnecté")
            },
            onError: () => (""),
            onMessage: {
              CONNECTED: () => {
                if(!connected){
                    popup("Connecté")
                    setConnected(true)
                  }
              },
              ERROR: () => {
                  setConnected(false)
              }
            }
          },
          onReconnect,
      });
  }, []);

  useEffect(() => {
    updateConnection();
  }, [updateConnection]);

  useEffect(() => {
    openWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [])

  useEffect(() => {
    const handler = async () => {
      await updateConnection();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [updateConnection]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateConnection();
    }, 10000); // 10 sec
  
    return () => clearInterval(interval);
  }, [updateConnection]);  

  return (
    <AuthContext.Provider value={{ isConnected, isAdmin, me, updateConnection, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}