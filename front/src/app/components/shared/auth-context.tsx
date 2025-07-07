import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ApiClient } from "../../../api/client";
import { User } from "../../../api/user";
import { popup } from "../../scripts/popup-slide";
import { setupWebSocket } from "./websocket";

type AuthContextType = {
  isConnected: boolean;
  isAdmin: boolean;
  me: User;
  loading: boolean;
  error: string | null;
  updateConnection: () => Promise<void>;
  refreshMe: () => Promise<void>;
  clearConnection: () => void;
  connectedFriends: string[] | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const connectedRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [connectedFriends, setWhoIsConnected] = useState<string[]>()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    const client = new ApiClient();
    if(!client.isConnected()){
      return
    }
    try{
      const user = await client.getMe();
      setMe(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(user)) {
          return user;
        }
        return prev;
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch user data (auth)");
      setMe(null);
    }
  }, []);

  function clearConnection(){
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }
  
  const updateConnection = useCallback(async () => {

    setLoading(true);

    try{
      const client = new ApiClient();
      setIsConnected(client.isConnected());
      if(isConnected){
        await client.refreshUser();
        setIsAdmin(client.isAdmin());
      } else {
        setIsAdmin(false)
      }
      await refreshMe();
    } catch (err) {
      setIsConnected(false);
      setIsAdmin(false);
      setMe(null);
      setError("Failed to update connection");
    }
  }, [refreshMe]);
      
  const openWebSocket = React.useCallback(() => {
      const user = new ApiClient();
      if(!user.isConnected()){
        return
      }
      console.log("ouverture websocket")
      setupWebSocket({
          wsUrl: `/online`,
          wsRef,
          authToken: user.getAuthToken(),
          handlers: {
            onOpen: () => {},
            onClose: () => {
              connectedRef.current = false
              setWhoIsConnected([])
              popup("Déconnecté")
            },
            onError: () => (""),
            onMessage: {
              CONNECTED: (msg) => {
                if(!connectedRef.current){
                    popup("Connecté")
                    connectedRef.current = true
                  }
                setWhoIsConnected(msg.token)
              },
              ERROR: () => {
                  connectedRef.current = false
                  setWhoIsConnected([])
              }
            }
          },
      });
  }, []);

  useEffect(() => {
    console.log("ouverture")
    openWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateConnection();
  }, [updateConnection]);

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
    <AuthContext.Provider value={{ isConnected, isAdmin, me, loading, error, updateConnection, refreshMe, connectedFriends, clearConnection }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}