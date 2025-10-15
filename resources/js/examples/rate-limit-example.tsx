/**
 * Rate Limiting Example
 * 
 * ตัวอย่างการจัดการ rate limit error ใน React component
 * แสดงวิธีการแสดงข้อความเตือนและ countdown timer
 */

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';

export function RateLimitedLoginExample() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // State สำหรับจัดการ rate limit
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);

    /**
     * Countdown timer สำหรับแสดงเวลาที่เหลือก่อนสามารถลองใหม่ได้
     */
    useEffect(() => {
        if (retryAfter > 0) {
            const timer = setInterval(() => {
                setRetryAfter((prev) => {
                    if (prev <= 1) {
                        setIsRateLimited(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [retryAfter]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            // Login สำเร็จ
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);

            // ตรวจสอบว่าเป็น rate limit error หรือไม่
            if (errorMessage.includes('Too many login attempts')) {
                setIsRateLimited(true);
                
                // Extract retry time จากข้อความ (ถ้ามี)
                const match = errorMessage.match(/(\d+)\s+seconds/);
                if (match) {
                    setRetryAfter(parseInt(match[1]));
                } else {
                    setRetryAfter(60); // Default 60 seconds
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Rate Limit Warning */}
            {isRateLimited && retryAfter > 0 && (
                <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                        Please wait {retryAfter} seconds before trying again.
                    </AlertDescription>
                </Alert>
            )}

            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={loading || isRateLimited}
                required
            />

            <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading || isRateLimited}
                required
            />

            <Button
                type="submit"
                className="w-full"
                disabled={loading || isRateLimited}
            >
                {isRateLimited 
                    ? `Wait ${retryAfter}s` 
                    : loading 
                    ? 'Logging in...' 
                    : 'Login'
                }
            </Button>
        </form>
    );
}
