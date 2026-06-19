import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signin from "@/pages/Auth/Signin";
import Dashboard from "@/pages/dashboard/Dashboard";
import Layout from "@/components/layout";
import { ProtectedRoute } from "../providers/ProtectedRoute";
import Profile from "@/pages/Profile";
import { Toaster } from "sonner";
import Unauthorized from "@/Unauthorized/Unauthorized";
import ErrorPage from "@/ErrorHandling/ErrorPage";
import CompanyList from "@/pages/CompanyList";
import Users from "../pages/Users";
import Roles from "@/pages/Roles";
import BranchList from "@/pages/BranchList";
import CategoryList from "@/pages/CategoryList";
import EmployeeList from "@/pages/EmployeeList";

const AppRoutes = () => {
    return (
        <BrowserRouter>

            <Toaster position="top-right" />
            <Routes>

                <Route path="/" element={<Navigate to="/signin" />} />
                <Route path="/signin" element={<Signin />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/company" element={<CompanyList />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/branch" element={<BranchList />} />
                        <Route path="/category" element={<CategoryList />} />
                        <Route path="/employee" element={<EmployeeList />} />
                    </Route>
                </Route>
                {/* Error hanlding */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<ErrorPage status={404} />} />
                <Route path="/403" element={<ErrorPage status={403} />} />
                <Route path="/404" element={<ErrorPage status={404} />} />
                <Route path="/500" element={<ErrorPage status={500} />} />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;