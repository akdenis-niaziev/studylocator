import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  userId: string;
  isAdmin: boolean;
  loginAsAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Guest User Logic
    let storedUserId = localStorage.getItem("app_user_id");
    if (!storedUserId) {
      storedUserId = `guest-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("app_user_id", storedUserId);
    }
    setUserId(storedUserId);

    // Admin Auth Logic
    const adminAccess = localStorage.getItem("app_admin_access") === "true";
    setIsAdmin(adminAccess);
  }, []);

  const loginAsAdmin = (password: string): boolean => {
    // Simple MVP password check
    if (password === "teacher" || password === "admin") {
      setIsAdmin(true);
      localStorage.setItem("app_admin_access", "true");
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem("app_admin_access");
  };

  return (
    <AuthContext.Provider
      value={{ userId, isAdmin, loginAsAdmin, logoutAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
