import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiClient } from "../../../api/client";

type AuthContextType = {
  isConnected: boolean;
  isAdmin: boolean;
  updateConnection: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(() => {
    const user = new ApiClient();
    return user.isConnected();
  });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = new ApiClient();
      setIsConnected(user.isConnected());
      await user.refreshUser();
      setIsAdmin(user.isAdmin());
    };
    init();
  }, []);

  useEffect(() => {
    const handler = async () => {
      const user = new ApiClient();
      setIsConnected(user.isConnected());

      await user.refreshUser()
      setIsAdmin(user.isAdmin());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const updateConnection = async () => {
    const user = new ApiClient();
    setIsConnected(user.isConnected());
    await user.refreshUser();
    setIsAdmin(user.isAdmin());
  }

  return (
    <AuthContext.Provider value={{ isConnected, isAdmin, updateConnection }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}