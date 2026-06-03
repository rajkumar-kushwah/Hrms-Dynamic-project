import { useAuthStore } from "@/store/auth.store";

const Profile = () => {
    const { user } = useAuthStore();
    console.log("👤 PROFILE COMPONENT USER:", user);
    return (

        <div className=" bg-card max-w-md p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-4">Profile</h2>

            <p><b>Name:</b> {user?.name}</p>
            <p><b>Email:</b> {user?.email}</p>
            <p><b>Last Login:</b> {user?.lastLogin ? new Date(user.lastLogin).toLocaleString("en-US") : "Naver logged in"}</p>

        </div>

    );
};

export default Profile;