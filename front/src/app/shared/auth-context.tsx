import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiClient } from "../../api/client";

type AuthContextType = {
  isConnected: boolean;
  updateHeaderConnected: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handler = () => {
      const user = new ApiClient();
      setIsConnected(user.isConnected());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const updateHeaderConnected = () => {
    const user = new ApiClient
    setIsConnected(user.isConnected())
  }

  return (
    <AuthContext.Provider value={{ isConnected/*, login, logout*/, updateHeaderConnected }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}