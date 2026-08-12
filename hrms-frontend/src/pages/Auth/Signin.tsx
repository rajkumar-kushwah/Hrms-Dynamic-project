import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field, FieldDescription } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useState } from 'react'
import { toast } from 'sonner'
// import axios from "axios";
import { signinUser } from '@/services/auth.service'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from "@/store/auth.store"
import { Eye, EyeOff } from "lucide-react";
import { signinSchema } from "@/validation/auth.validation";


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
                <h1 className="text-2xl text-center">Signin</h1>

                <form className='space-y-4' onSubmit={handleSubmit}>
                    {/* <div>
                        <Label>Company code </Label>
                        <Input placeholder='Company code' required />
                    </div> */}

                    <div>
                        <Label>Email</Label>
                        <Input value={email} name="email" type="email" onChange={handleChange} placeholder='Email..' required />
                        {error.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {error.email}
                            </p>
                        )}
                    </div>
                    <div>

                        <Label>Password</Label>
                        <div className='relative'>
                            <Input type={showPassword ? 'text' : 'password'} name="password" className='pr-10' value={password} onChange={handleChange} placeholder='Password' autoComplete="current-password" />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
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
                            <a href="" className="ml-auto text-sm underline-offset-4 hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                    </Field>

                    <Button type="submit" className='btn btn-primary w-full cursor-pointer'>
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
