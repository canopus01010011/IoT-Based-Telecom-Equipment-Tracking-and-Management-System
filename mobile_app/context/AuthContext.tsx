import type { Role } from "@/constants/roles";
import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

type User = {
  id: string;
  name: string;
  role: Role;
  phone?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  login: (id: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // LOGIN (ID + PASSWORD)
  const login = async (id: string, password: string, role: Role) => {
    // 🔸 TEMP MOCK (replace later with backend)
    if (id === "Abedmadjid" && password === "1234") {
      setUser({
        id: "Abedmadjid Teboun",
        name: role === "driver" ? "Driver User" : "Technician User",
        role,
        phone: role === "driver" ? "+213500000000" : "+213600000000",
        email: `${role}@example.com`,
      });
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook to use context
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
}
