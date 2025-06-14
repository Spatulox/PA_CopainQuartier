import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ApiClient } from "../../../api/client";
import { User } from "../../../api/user";
import { popup } from "../../scripts/popup-slide";


enum MsgType {
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
}

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

  function openWebSocket(){
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    const ws = new window.WebSocket(`ws://localhost:3000/online`);
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      let data = typeof event.data === "string" ? event.data : await event.data.text();
      let msg;
      try { msg = JSON.parse(data); } catch { return; }
      if (msg.type === MsgType.ERROR) {
        alert(msg.error);
        ws.close();
        return;
      }
      if (msg.type === MsgType.CONNECTED && !connected){
        popup("Connecté")
        setConnected(true)
      }
    };

    ws.onopen = () => {
      const client = new ApiClient()
      reconnectDelay.current = 1000;
      ws.send(JSON.stringify({ type: MsgType.INIT_CONNECTION, token: client.getAuthToken() }));
    };

    ws.onclose = () => {
      setConnected(false)
      popup("Déconnecté")
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 1.2, 30000); // max 30s
        openWebSocket();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }

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