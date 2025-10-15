import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import api from '@/services/api';

/**
 * User Interface
 * กำหนดโครงสร้างของ user object
 */
interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

/**
 * Login Credentials Interface
 * ข้อมูลที่ต้องการสำหรับการ login
 */
interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Auth Context Type
 * กำหนด type ของ context value
 */
interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    init: () => Promise<void>;
}

/**
 * สร้าง Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider Component
 * 
 * Component นี้จะครอบคลุมทั้งแอปพลิเคชันเพื่อจัดการ authentication state
 * ทำหน้าที่:
 * - เก็บข้อมูล user และ token
 * - จัดการ login/logout
 * - ตรวจสอบ authentication status เมื่อแอปโหลด
 * - ซิงค์ข้อมูลกับ localStorage
 */
export function AuthProvider({ children }: AuthProviderProps) {
    // State สำหรับเก็บข้อมูล user
    const [user, setUser] = useState<User | null>(null);

    // State สำหรับเก็บ authentication token
    const [token, setToken] = useState<string | null>(null);

    // State สำหรับแสดงสถานะการโหลด
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * Login Function
     * 
     * ทำการ login โดยส่ง credentials ไปยัง Laravel API
     * หากสำเร็จจะเก็บ token และข้อมูล user ใน state และ localStorage
     * 
     * @param credentials - email และ password
     * @throws Error หากการ login ล้มเหลว
     */
    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            setLoading(true);

            // เรียก API endpoint สำหรับ login โดยใช้ API client instance
            const response = await api.post('/login', credentials);

            // ดึงข้อมูล token และ user จาก response
            const { token: authToken, user: userData } = response.data;

            // บันทึก token ลง localStorage
            localStorage.setItem('auth_token', authToken);

            // อัพเดท state
            setToken(authToken);
            setUser(userData);

            // Token จะถูกแนบอัตโนมัติโดย API interceptor
            // ไม่จำเป็นต้องตั้งค่า axios.defaults.headers.common อีกต่อไป

            setLoading(false);
        } catch (error) {
            setLoading(false);

            // จัดการ error และ throw ต่อไปเพื่อให้ component จัดการได้
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const message = error.response?.data?.message;

                // Rate limit exceeded (429 Too Many Requests)
                if (status === 429) {
                    const retryAfter = error.response?.headers['retry-after'];
                    const waitTime = retryAfter ? `${retryAfter} seconds` : 'a moment';
                    throw new Error(
                        `Too many login attempts. Please try again after ${waitTime}.`
                    );
                }

                // Unauthorized (401) - Invalid credentials
                if (status === 401) {
                    throw new Error(
                        message || 'Invalid email or password. Please try again.'
                    );
                }

                // Validation error (422)
                if (status === 422) {
                    throw new Error(
                        message || 'Please check your input and try again.'
                    );
                }

                // Generic error message
                throw new Error(
                    message || 'Login failed. Please check your credentials.'
                );
            }
            throw new Error('An unexpected error occurred during login.');
        }
    };

    /**
     * Logout Function
     * 
     * ทำการ logout โดยเรียก API และล้างข้อมูล authentication
     * ลบ token จาก localStorage และ reset state
     */
    const logout = async (): Promise<void> => {
        try {
            // เรียก API endpoint สำหรับ logout โดยใช้ API client instance
            // Token จะถูกแนบอัตโนมัติโดย interceptor
            if (token) {
                await api.post('/logout');
            }
        } catch (error) {
            // แม้ API call จะล้มเหลว ก็ยังต้อง logout ที่ฝั่ง client
            console.error('Logout API call failed:', error);
        } finally {
            // ลบ token จาก localStorage
            localStorage.removeItem('auth_token');

            // Reset state
            setToken(null);
            setUser(null);
        }
    };

    /**
     * Init Function
     * 
     * ตรวจสอบ authentication status เมื่อแอปโหลด
     * ดึง token จาก localStorage และตรวจสอบความถูกต้องโดยเรียก /api/me
     * หาก token ยังใช้งานได้จะโหลดข้อมูล user
     */
    const init = async (): Promise<void> => {
        try {
            setLoading(true);

            // ดึง token จาก localStorage
            const storedToken = localStorage.getItem('auth_token');

            // ถ้าไม่มี token ให้หยุดการทำงาน
            if (!storedToken) {
                setLoading(false);
                return;
            }

            // เรียก API เพื่อตรวจสอบ token และดึงข้อมูล user
            // Token จะถูกแนบอัตโนมัติโดย API interceptor
            const response = await api.get('/me');

            // อัพเดท state ด้วยข้อมูล user
            setToken(storedToken);
            setUser(response.data);

            setLoading(false);
        } catch (error) {
            // ถ้า token ไม่ valid หรือ expired ให้ล้างข้อมูล
            console.error('Token validation failed:', error);

            localStorage.removeItem('auth_token');

            setToken(null);
            setUser(null);
            setLoading(false);
        }
    };

    /**
     * useEffect Hook
     * 
     * เรียก init function เมื่อ component mount
     * เพื่อตรวจสอบ authentication status
     */
    useEffect(() => {
        init();
    }, []);

    // Context value ที่จะส่งให้ consumers
    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        logout,
        init,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth Custom Hook
 * 
 * Hook สำหรับเข้าถึง Auth Context
 * ใช้งานใน component ที่ต้องการข้อมูล authentication
 * 
 * @returns AuthContextType object ที่มี user, token, loading, login, logout, init
 * @throws Error ถ้าใช้งานนอก AuthProvider
 * 
 * @example
 * const { user, login, logout, loading } = useAuth();
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
