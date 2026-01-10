import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getDonorToken, setDonorToken, clearDonorToken } from "./queryClient";

interface Donor {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  donor: Donor | null;
  login: (token: string, donor: Donor) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [donor, setDonor] = useState<Donor | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = getDonorToken();
    const storedDonor = localStorage.getItem("donor-info");

    if (token && storedDonor) {
      try {
        setDonor(JSON.parse(storedDonor));
        setIsAuthenticated(true);
      } catch {
        // Invalid stored data, clear it
        clearDonorToken();
        localStorage.removeItem("donor-info");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, donorData: Donor) => {
    setDonorToken(token);
    localStorage.setItem("donor-info", JSON.stringify(donorData));
    setDonor(donorData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearDonorToken();
    localStorage.removeItem("donor-info");
    setDonor(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, donor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
