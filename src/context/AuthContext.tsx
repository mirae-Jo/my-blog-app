import type { ReactNode } from "react";
import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  session: Session | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
      if (session?.user) {
        const userEmail = session.user.email;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

        if (userEmail !== adminEmail) {
          toast({
            title: "인증 실패",
            description: "권한이 없는 사용자입니다. 홈으로 이동합니다.",
            variant: "destructive",
            duration: 2000,
          });
          await supabase.auth.signOut();
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          setSession(session);
          setIsAuthenticated(true);
        }
      } else {
        setSession(null);
        setIsAuthenticated(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, session, setIsAuthenticated, setSession }}>
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
