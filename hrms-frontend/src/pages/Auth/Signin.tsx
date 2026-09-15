import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldDescription } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { signinUser } from "@/services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff } from "lucide-react";
import { signinSchema } from "@/validation/auth.validation";
import Light_BG from "@/assets/Light_BG.png";

const Signin = () => {
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError({});

        if (!email || !password) {
            setError({
                email: !email ? "Email is required" : undefined,
                password: !password ? "Password is required" : undefined,
            });
            return;
        }

        const result = signinSchema.safeParse({
            email,
            password,
        });

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setError({
                email: fieldErrors.email?.[0],
                password: fieldErrors.password?.[0],
            });

            return;
        }

        try {
            setSpinner(true);
            setLoading(true);

            const res = await signinUser({
                email,
                password,
            });

            setUser(res.data);

            toast.success("Login successful");

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Invalid email or password");
        } finally {
            setSpinner(false);
            setLoading(false);
        }
    };

    const handleChange = (
        name: "email" | "password",
        value: string
    ) => {
        if (name === "email") {
            setEmail(value);
        } else {
            setPassword(value);
        }

        const fieldSchema = signinSchema.shape[name];
        const result = fieldSchema.safeParse(value);

        setError((prev) => ({
            ...prev,
            [name]: result.success
                ? undefined
                : result.error.issues[0]?.message,
        }));
    };

    return (
        <div className="min-h-screen bg-background">

            {/* Main */}
            <main className="flex min-h-screen items-center justify-center px-5 py-5">

                <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border bg-card shadow-xl lg:grid-cols-2">

                    {/* Left Branding Section */}

                    <div className="relative hidden overflow-hidden bg-[var(--themePrimary)]/5 p-10 lg:flex lg:flex-col lg:justify-between">

                        {/* Background Shapes */}
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--themePrimary)]/5" />

                        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[var(--themePrimary)]/5" />

                        <div className="relative z-10">

                            {/* Logo */}
                            <div className="mb-10 flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border p-2 shadow-sm">
                                    <img
                                        src={Light_BG}
                                        alt="Dynamic HRMS"
                                        className="h-full w-full rounded-md object-contain"
                                    />
                                </div>

                                <div>
                                    <p className="text-lg font-bold text-foreground">
                                        Dynamic HRMS
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Human Resource Management
                                    </p>
                                </div>
                            </div>

                            {/* Heading */}
                            <h1 className="max-w-md text-4xl font-bold leading-tight text-foreground">
                                Manage Your Workforce

                                <span className="block text-[var(--themePrimary)]">
                                    Smarter & Simpler
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
                                A complete HR management solution to manage your workforce,
                                <span className="block">
                                    attendance, leave, payroll, branches, and roles
                                </span>
                                <span className="block">
                                    — all in one place.
                                </span>
                            </p>

                        </div>
                    </div>



                    {/* Login Section */}
                    <div className="flex items-center justify-center p-6 sm:p-10">

                        <div className="w-full max-w-md">

                            {/* Login Heading */}
                            <div className="mb-8 text-center lg:text-left">

                                {/* Mobile Logo */}
                                <div className="mb-5 flex justify-center lg:hidden">
                                    <img
                                        src={Light_BG}
                                        alt="Dynamic HRMS Logo"
                                        className="h-14 w-auto object-contain"
                                    />
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight">
                                    Welcome back
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Sign in to your HRMS account to continue
                                </p>

                            </div>

                            {/* Login Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* Email */}
                                <Field>
                                    <Label htmlFor="email">
                                        Email
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            handleChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        className="mt-2"
                                    />

                                    {error.email && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {error.email}
                                        </p>
                                    )}
                                </Field>

                                {/* Password */}
                                <Field>
                                    <Label htmlFor="password">
                                        Password
                                    </Label>

                                    <div className="relative mt-2">

                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) =>
                                                handleChange(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            className="pr-10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>

                                    </div>

                                    {error.password && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {error.password}
                                        </p>
                                    )}
                                </Field>

                                {/* Forgot Password */}
                                <div className="flex justify-end">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-[var(--themePrimary)] hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Sign In Button */}
                                <Button
                                    type="submit"
                                    disabled={spinner}
                                    className="w-full cursor-pointer bg-[var(--themePrimary)] py-5 text-base hover:bg-[var(--card-green-hover)]"
                                >
                                    {spinner ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>

                                {/* Back */}
                                <FieldDescription className="pt-2 text-center">
                                    <Link
                                        to="/"
                                        className="text-sm text-[var(--themePrimary)] hover:underline"
                                    >
                                        ← Back to HRMS
                                    </Link>
                                </FieldDescription>

                            </form>
                        </div>
                    </div>

                </div>
            </main>
        </div >
    );
};

export default Signin;


