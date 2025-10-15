import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * LoginForm Component
 * 
 * A responsive login form component that connects to Laravel API
 * Features:
 * - Email and password input fields with validation
 * - Loading state during submission
 * - Error state handling
 * - Responsive design for all screen sizes
 */
export function LoginForm() {
    // ใช้ Auth Context สำหรับจัดการ authentication
    const { login } = useAuth();

    // State management for form inputs
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    // State management for UI states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    /**
     * Handle form submission
     * Prevents default form behavior and calls login API
     * 
     * @param e - Form event
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Clear previous errors
        setError('');

        // Set loading state
        setLoading(true);

        try {
            // เรียก login function จาก AuthContext
            await login({ email, password });

            // Login สำเร็จ - AuthContext จะจัดการ redirect หรือ state update
            console.log('Login successful!');
        } catch (err) {
            // จัดการ error และแสดงข้อความให้ผู้ใช้
            setError(err instanceof Error ? err.message : 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
            {/* Gradient Background Effects */}
            <div className="absolute inset-0 -z-10">
                {/* Primary gradient blob */}
                <div className="absolute -left-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" />
                {/* Secondary gradient blob */}
                <div className="absolute -bottom-20 -right-20 h-64 w-64 animate-pulse rounded-full bg-primary/5 blur-3xl delay-1000 sm:h-96 sm:w-96" />
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Card with glass morphism effect */}
            <Card className="w-full max-w-md border bg-card/50 shadow-xl backdrop-blur-sm transition-all duration-200 hover:shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Login
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Email Input Field with Icon */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Password Input Field with Icon and Toggle */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
