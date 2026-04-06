import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AuthService from "@/services/authService";

type AppRole = "admin" | "student" | "employer";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  isVerified: boolean;
  phone?: string;
  address?: string;
  profile?: {
    university?: string;
    major?: string;
    year?: number;
    semester?: string;
    gpa?: string;
    skills?: string[];
    bio?: string;
    avatar?: string;
    cv?: string;
    cvName?: string;
  };
}

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<any>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<any>;
  getProfile: () => Promise<any>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  updatePassword: async () => {},
  getProfile: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getCurrentUserFromStorage();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });
    if (response.success) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (userData: any) => {
    const response = await AuthService.register(userData);
    // Don't automatically set user for unverified accounts
    // Let the calling component handle the OTP verification flow
    return response;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const updateProfile = async (profileData: any) => {
    const response = await AuthService.updateProfile(profileData);
    if (response.success) {
      setUser(response.data.user);
    }
    return response;
  };

  const getProfile = async () => {
    const response = await AuthService.getProfile();
    if (response.success) {
      setUser(response.data.user);
    }
    return response;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    return await AuthService.updatePassword(currentPassword, newPassword);
  };

  const isAuthenticated = !!user;
  const role = user?.role || null;

  const setUserContext = (newUser: User | null) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        role, 
        loading, 
        isAuthenticated,
        login, 
        register, 
        logout, 
        updateProfile,
        updatePassword,
        getProfile,
        setUser: setUserContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};