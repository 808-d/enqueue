import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../models/user";
import axios from "axios";
import { endpoints } from "../utils/endpoints";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetched = useRef(false);

  const fetchUser = async () => {
    try {
      const response = await axios.get<User>(endpoints.me, {
        withCredentials: true,
      });
      setUser(response.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    fetchUser().finally(() => setLoading(false));
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
