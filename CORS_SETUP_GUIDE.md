# CORS Configuration Guide for Laravel + React

## ปัญหา CORS Error

เมื่อ React app (`http://localhost:3000`) พยายามเรียก Laravel API (`http://localhost:8000`) จะเกิด CORS error:

```
Access to XMLHttpRequest at 'http://localhost:8000/api/login' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## ✅ วิธีแก้ไข: ตั้งค่า CORS ใน Laravel

### 1. สร้างไฟล์ `config/cors.php`

ไฟล์นี้ถูกสร้างเรียบร้อยแล้วพร้อมการตั้งค่าที่เหมาะสม:

```php
'allowed_origins' => [
    'http://localhost:3000',      // React dev server
    'http://localhost:5173',      // Vite dev server
    'http://127.0.0.1:3000',      // Alternative localhost
],

'allowed_methods' => [
    'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'
],

'allowed_headers' => [
    'Authorization',
    'Content-Type',
    'Accept',
    'X-Requested-With',
],
```

### 2. ตรวจสอบ Middleware

Laravel 11 ใช้ `statefulApi()` ใน `bootstrap/app.php` ซึ่งจะเปิดใช้ CORS middleware อัตโนมัติ ✅

---

## การทำงานของ CORS

### CORS Headers ที่ Laravel ส่งกลับ:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Preflight Request (OPTIONS)

Browser จะส่ง **OPTIONS request** ก่อน actual request เพื่อตรวจสอบว่า:
- Origin นี้ได้รับอนุญาตหรือไม่
- Method นี้ได้รับอนุญาตหรือไม่
- Headers เหล่านี้ได้รับอนุญาตหรือไม่

Laravel จะตอบกลับด้วย CORS headers และ browser จะ cache response นี้ไว้ 24 ชั่วโมง

---

## การทดสอบ CORS

### 1. ทดสอบด้วย Browser Console

```javascript
fetch('http://localhost:8000/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 2. ตรวจสอบ Network Tab

1. เปิด Browser DevTools (F12)
2. ไปที่ **Network** tab
3. ลอง login จาก React app
4. ดู request ที่เกิดขึ้น:
   - **OPTIONS /api/login** (Preflight request)
   - **POST /api/login** (Actual request)

### 3. ตรวจสอบ Response Headers

คลิกที่ request และดู **Response Headers** ควรเห็น:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

---

## การตั้งค่าเพิ่มเติม

### 1. อนุญาตทุก Origins (Development Only)

**⚠️ ไม่แนะนำสำหรับ Production**

```php
'allowed_origins' => ['*'],
```

### 2. ใช้ Environment Variable

**ไฟล์:** `.env`
```env
FRONTEND_URL=http://localhost:3000
```

**ไฟล์:** `config/cors.php`
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),
],
```

### 3. ใช้ Regex Pattern สำหรับ Subdomain

```php
'allowed_origins_patterns' => [
    '/^https?:\/\/.*\.yourdomain\.com$/',
],
```

---

## Troubleshooting

### ปัญหา: ยังเจอ CORS error หลังตั้งค่าแล้ว

**วิธีแก้:**

1. **Clear cache:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

2. **Restart Laravel server:**
   ```bash
   php artisan serve
   ```

3. **ตรวจสอบ URL ให้ตรงกัน:**
   - Frontend: `http://localhost:3000` (ไม่ใช่ `http://127.0.0.1:3000`)
   - ต้องตรงกับที่ตั้งค่าใน `allowed_origins`

4. **Hard refresh browser:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

### ปัญหา: Credentials ไม่ถูกส่ง

**วิธีแก้:**

ตั้งค่า `credentials: 'include'` ใน fetch/axios:

```javascript
// Fetch API
fetch(url, {
    credentials: 'include',
    // ...
});

// Axios
axios.defaults.withCredentials = true;
```

และตั้งค่าใน Laravel:
```php
'supports_credentials' => true,
```

### ปัญหา: Authorization header ไม่ถูกส่ง

**วิธีแก้:**

ตรวจสอบว่า `Authorization` อยู่ใน `allowed_headers`:

```php
'allowed_headers' => [
    'Authorization',
    'Content-Type',
    'Accept',
],
```

---

## Production Deployment

### 1. อัพเดท Allowed Origins

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

### 2. ลบ Development URLs

อย่าเหลือ `localhost` ใน production:

```php
'allowed_origins' => [
    env('FRONTEND_URL'),  // ดึงจาก .env
],
```

### 3. ตั้งค่า Environment Variable

**ไฟล์:** `.env` (Production)
```env
FRONTEND_URL=https://yourdomain.com
```

---

## Best Practices

✅ **ระบุ origins ที่ชัดเจน** - อย่าใช้ `'*'` ใน production  
✅ **ใช้ HTTPS ใน production** - ป้องกัน man-in-the-middle attacks  
✅ **จำกัด headers ที่จำเป็น** - อย่าอนุญาตทุก headers  
✅ **ตั้งค่า max_age ที่เหมาะสม** - ลด preflight requests  
✅ **ใช้ environment variables** - แยก config ระหว่าง dev และ production  

---

## สรุป Configuration

### ✅ Allowed Origins
```php
'http://localhost:3000'  // React app
'http://localhost:5173'  // Vite dev server
```

### ✅ Allowed Methods
```php
'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'
```

### ✅ Allowed Headers
```php
'Authorization'    // Bearer token
'Content-Type'     // JSON requests
'Accept'          // JSON responses
```

### ✅ Supports Credentials
```php
true  // อนุญาตให้ส่ง cookies และ authentication
```

---

## ตัวอย่างการใช้งานใน React

```typescript
import api from '@/services/api';

// API client จะส่ง headers อัตโนมัติ
const response = await api.post('/login', {
    email: 'user@example.com',
    password: 'password123'
});

// CORS headers จะถูกจัดการโดย Laravel
// ไม่ต้องตั้งค่าอะไรเพิ่มใน React
```

---

## คำสั่งที่เป็นประโยชน์

```bash
# Clear config cache
php artisan config:clear

# View current config
php artisan config:show cors

# Start Laravel server
php artisan serve

# Start Vite dev server
npm run dev
```

---

CORS configuration พร้อมใช้งานแล้ว! 🚀

หากยังพบปัญหา ให้ตรวจสอบ:
1. Laravel server ทำงานที่ `http://localhost:8000`
2. React app ทำงานที่ `http://localhost:3000`
3. Clear cache ทั้ง Laravel และ Browser
