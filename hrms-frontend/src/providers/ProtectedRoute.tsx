import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";


export const ProtectedRoute = () => {
    const { isAuthenticated, isInitialized, loading } = useAuthStore();

    // console.log("ProtectedRoute state:", { isAuthenticated, isInitialized, loading });

    if (!isInitialized || loading) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />
    }

    return <Outlet />
}