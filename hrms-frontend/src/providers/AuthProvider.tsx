import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getprofile } from "@/services/profile.service";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser,logout, setInitialized } = useAuthStore();

  useEffect(() => {

    const loadUser = async () => {
      try {
        const res = await getprofile()
        setUser(res.data.data);


      } catch (err) {
        console.log("PROFILE ERROR:", err);
         logout();


      } finally {
        
        setInitialized(true);
      }
    };

    loadUser();
  }, [setUser,logout, setInitialized]);



  return <>{children}</>;
};

export default AuthProvider;