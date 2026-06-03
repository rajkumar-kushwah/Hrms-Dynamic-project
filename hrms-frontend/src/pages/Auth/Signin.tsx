import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field, FieldDescription } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'
import { signinUser } from '@/services/auth.service'
// import { useAuthStore } from "@/store/auth.store"
import { useNavigate } from 'react-router-dom'


function Signin() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await signinUser({ email, password });
            
            console.log("login",res.data);
            toast.success(res.data.message || "Signin successful");
            navigate("/dashboard");

        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Error");
            } else {
                console.error(error);
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='bg-card flex justify-center items-center min-h-screen'>
            <div className='bg-card  w-full max-w-md p-6 space-y-4 shadow-lg border rounded-2xl'>
                <h1 className="text-2xl text-center">Signin</h1>

                <form  className='space-y-4'>
                    {/* <div>
                        <Label>Company code </Label>
                        <Input placeholder='Company code' required />
                    </div> */}

                    <div>
                        <Label>Email</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email..' required />

                    </div>
                    <div>
                        <Label>Password</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
                    </div>
                    <Field>
                        <div className='flex items-center'>
                            <a href="" className="ml-auto text-sm underline-offset-4 hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                    </Field>

                    <Button type="submit" className='btn btn-primary w-full cursor-pointer' onClick={handleSubmit}>
                        {loading && <Spinner />}
                        Signin
                    </Button>
                    <FieldDescription>
                        Don't have an account? <a href="">Signup</a>
                    </FieldDescription>
                </form>
            </div>
        </div >
    )
}

export default Signin
