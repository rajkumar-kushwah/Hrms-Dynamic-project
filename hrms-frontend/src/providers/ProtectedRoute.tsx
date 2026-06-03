import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";


export const ProtectedRoute = () => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated === null) return null;

    if (!isAuthenticated && !user) {
        return <Navigate to="/" />
    }
    
    return <Outlet />
}