<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    /*
    | Paths ที่จะใช้ CORS middleware
    | กำหนด path patterns ที่ต้องการให้ CORS ทำงาน
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
    | Allowed Methods
    | HTTP methods ที่อนุญาตให้เรียกใช้จาก cross-origin requests
    */
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
    | Allowed Origins
    | กำหนด origins (domains) ที่อนุญาตให้เข้าถึง API
    | 
    | Development: ระบุ URL ของ frontend app (React/Vite dev server)
    | Production: เปลี่ยนเป็น domain จริง เช่น 'https://yourdomain.com'
    | 
    | หมายเหตุ: ใช้ '*' เพื่ออนุญาตทุก origins (ไม่แนะนำสำหรับ production)
    */
    'allowed_origins' => [
        'http://localhost:3000',      // React dev server (Create React App, Next.js)
        'http://localhost:5173',      // Vite dev server (default port)
        'http://localhost:5174',      // Vite dev server (alternative port)
        'http://127.0.0.1:3000',      // Alternative localhost notation
        'http://127.0.0.1:5173',      // Alternative localhost notation
        
        // Production domains (uncomment and update when deploying)
        // 'https://yourdomain.com',
        // 'https://www.yourdomain.com',
    ],

    /*
    | Allowed Origins Patterns
    | ใช้ regex patterns สำหรับ dynamic origins
    | ตัวอย่าง: ['^https?://.*\.example\.com$']
    */
    'allowed_origins_patterns' => [],

    /*
    | Allowed Headers
    | HTTP headers ที่อนุญาตให้ส่งมาใน requests
    | 
    | Authorization: สำหรับ Bearer token
    | Content-Type: สำหรับระบุ type ของ request body
    | Accept: สำหรับระบุ type ของ response ที่ต้องการ
    | X-Requested-With: สำหรับ AJAX requests
    */
    'allowed_headers' => [
        'Authorization',
        'Content-Type',
        'Accept',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
    ],

    /*
    | Exposed Headers
    | Headers ที่อนุญาตให้ JavaScript เข้าถึงได้
    | เช่น custom headers ที่ต้องการให้ frontend อ่านได้
    */
    'exposed_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'Retry-After',
    ],

    /*
    | Max Age
    | ระยะเวลา (วินาที) ที่ browser จะ cache preflight request
    | Preflight = OPTIONS request ที่ browser ส่งก่อน actual request
    */
    'max_age' => 86400, // 24 hours

    /*
    | Supports Credentials
    | อนุญาตให้ส่ง cookies และ authentication credentials
    | ตั้งเป็น true ถ้าใช้ session-based authentication
    | สำหรับ token-based (Sanctum) สามารถเป็น true หรือ false ก็ได้
    */
    'supports_credentials' => true,

];
