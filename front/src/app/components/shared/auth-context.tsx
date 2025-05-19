import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ApiClient } from "../../../api/client";
import { User } from "../../../api/user";

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

  setTimeout(async() => {await updateConnection()}, 10000)

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