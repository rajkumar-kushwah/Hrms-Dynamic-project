import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getprofile } from "@/services/profile.service";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getprofile()
        console.log(" PROFILE RESPONSE FULL:", res);
        console.log(" PROFILE DATA:", res.data);
        setUser(res.data.data);

      } catch (err) {
        console.log(" PROFILE ERROR:", err);
        logout();

      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return <>{children}</>;
};

export default AuthProvider;