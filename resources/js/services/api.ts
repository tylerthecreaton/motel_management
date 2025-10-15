import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client Configuration
 *
 * สร้าง Axios instance สำหรับเชื่อมต่อกับ Laravel API
 * ตั้งค่า base URL และ default headers
 */

// สร้าง Axios instance
const api: AxiosInstance = axios.create({
    // Base URL สำหรับ Laravel API
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

    // Default headers
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },

    // Timeout สำหรับ request (30 วินาที)
    timeout: 30000,

    // รองรับ CORS credentials (cookies, authorization headers)
    // จำเป็นเมื่อ Laravel ตั้งค่า 'supports_credentials' => true
    withCredentials: true,
});

/**
 * Request Interceptor
 *
 * ดักจับ request ทุกครั้งก่อนส่งไปยัง server
 * ใช้สำหรับแนบ Bearer token จาก localStorage ไปกับทุก request
 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // ดึง token จาก localStorage
        const token = localStorage.getItem('auth_token');

        // ถ้ามี token ให้แนบเข้าไปใน Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // จัดการ error ที่เกิดขึ้นก่อนส่ง request
        return Promise.reject(error);
    },
);

/**
 * Response Interceptor
 *
 * ดักจับ response ทุกครั้งที่ได้รับจาก server
 * ใช้สำหรับจัดการ error แบบ global (เช่น token หมดอายุ)
 */
api.interceptors.response.use(
    (response) => {
        // ส่ง response กลับไปตามปกติถ้าสำเร็จ
        return response;
    },
    (error) => {
        // จัดการ error responses
        if (error.response) {
            // กรณี token หมดอายุหรือไม่ valid (401 Unauthorized)
            if (error.response.status === 401) {
                // ลบ token ที่หมดอายุออกจาก localStorage
                localStorage.removeItem('auth_token');

                // สามารถ redirect ไปหน้า login ได้ที่นี่
                // window.location.href = '/login';

                console.error('Authentication failed. Please login again.');
            }

            // กรณี Forbidden (403)
            if (error.response.status === 403) {
                console.error('Access denied. You do not have permission.');
            }

            // กรณี Server Error (500)
            if (error.response.status >= 500) {
                console.error('Server error. Please try again later.');
            }
        } else if (error.request) {
            // Request ถูกส่งแต่ไม่ได้รับ response (network error)
            console.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    },
);

/**
 * Export API instance
 *
 * ใช้ instance นี้สำหรับทุก API calls ในแอปพลิเคชัน
 *
 * @example
 * import api from '@/services/api';
 *
 * // GET request
 * const response = await api.get('/users');
 *
 * // POST request
 * const response = await api.post('/login', { email, password });
 *
 * // PUT request
 * const response = await api.put('/users/1', { name: 'John' });
 *
 * // DELETE request
 * const response = await api.delete('/users/1');
 */
export default api;
