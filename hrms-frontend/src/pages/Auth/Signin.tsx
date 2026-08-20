import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field, FieldDescription } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useState } from 'react'
import { toast } from 'sonner'
// import axios from "axios";
import { signinUser } from '@/services/auth.service'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from "@/store/auth.store"
import { Eye, EyeOff } from "lucide-react";
import { signinSchema } from "@/validation/auth.validation";
import Light_BG from "@/assets/Light_BG.png"


function Signin() {
    const navigate = useNavigate();
    const { setUser, setLoading } = useAuthStore();

    const [spinner, setSpinner] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<{
        email?: string;
        password?: string;
    }>({});


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Email and password are required");
            return;
        }

        const result = signinSchema.safeParse({
            email,
            password,
        });

        if (!result.success) {
            toast.error(result.error.issues[0]?.message);
            setLoading(false);
            setSpinner(false);
            return;
        }
        setLoading(true);
        setSpinner(true);

        try {
            const res = await signinUser({ email, password });
            setUser(res.data);
            toast.success(res.data.message || "Signin successful");
            navigate("/dashboard");

        } catch (error: any) {

            const message = error?.message || "Error";
            toast.error(message);

        } finally {
            setLoading(false);
            setSpinner(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        }

        const schema = signinSchema.shape[name as "email" | "password"];
        const result = schema.safeParse(value);

        setError((prev) => ({
            ...prev,
            [name]: result.success
                ? undefined
                : result.error.issues[0]?.message,
        }));
    };




    return (
        <div className='bg-card flex justify-center items-center min-h-screen'>
            <div className='bg-card  w-full max-w-md p-6 space-y-4 shadow-lg border rounded-2xl'>
                <div className="flex flex-col items-center gap-3">
                    <img
                        src={Light_BG}
                        alt="HRMS Logo"
                        className="h-12 w-auto object-contain rounded-md"
                    />

                    <h1 className="text-2xl font-semibold text-center">
                        Welcome to <span className="text-primary">HRMS</span>
                    </h1>

                    <h2 className="text-md  text-gray-400 text-center">
                        Sign in to your account to continue
                    </h2>
                </div>
                <form className='space-y-4' onSubmit={handleSubmit}>
                    {/* <div>
                        <Label>Company code </Label>
                        <Input placeholder='Company code' required />
                    </div> */}

                    <div className='space-y-2'>
                        <Label>Username</Label>
                        <Input value={email} name="email" type="email" onChange={handleChange} placeholder='Enter your Username here' required className=" bg-[var(--themePrimary)]/5 rounded-full focus-visible:border-[var(--themePrimary)] focus-visible:border-[var(--themePrimary)] focus-visible:ring-0"
                        />
                        {error.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {error.email}
                            </p>
                        )}
                    </div>

                    <div className='space-y-2'>
                        <Label>Password</Label>
                        <div className='relative'>
                            <Input type={showPassword ? 'text' : 'password'} name="password" className='bg-[var(--themePrimary)]/5 rounded-full focus-visible:border-[var(--themePrimary)] focus-visible:border-[var(--themePrimary)] focus-visible:ring-0' value={password} onChange={handleChange} placeholder='Enter your Password here' autoComplete="current-password" />
                            <button
                                type="button"
                                className="absolute right-3 border-logo-green hover:border-logo-green/80 top-1/2 -translate-y-1/2"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}

                            </button>
                        </div>
                        {error.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {error.password}
                            </p>
                        )}
                    </div>

                    <Field>
                        <div className='flex items-center'>
                            <Link to="/forgot-password" className="ml-auto text-sm text-blue-500 hover:text-black ">
                                Forgot password ?
                            </Link>
                        </div>
                    </Field>

                    <Button type="submit" className='text-md w-full cursor-pointer rounded-full w-full bg-[var(--themePrimary)] text-white hover:bg-[var(--themePrimary)]/80'>
                        {spinner && <Spinner />}
                        Signin
                    </Button>
                    <FieldDescription>
                        Don't have an account? <a href=""></a>
                    </FieldDescription>
                </form>
            </div>
        </div >
    )
}

export default Signin
