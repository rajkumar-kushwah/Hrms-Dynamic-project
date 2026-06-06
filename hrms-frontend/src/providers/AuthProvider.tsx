import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getprofile } from "@/services/profile.service";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser,logout, setInitialized } = useAuthStore();
  // const logout = useAuthStore((state) => state.logout);
  // const [loading, setLoading] = useState(true);


  useEffect(() => {

    const loadUser = async () => {
      // setLoading(true);

      // if (user) {
      //   setLoading(false);
      //   return;
      // }
      try {
        const res = await getprofile()
        // console.log(" PROFILE RESPONSE FULL:", res);
        // console.log(" PROFILE DATA:", res.data);
        setUser(res.data.data);


      } catch (err) {
        console.log("PROFILE ERROR:", err);
         logout();


      } finally {
        // setLoading(false);
        setInitialized(true);
      }
    };

    loadUser();
  }, []);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return <>{children}</>;
};

export default AuthProvider;