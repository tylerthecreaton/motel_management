# API Routes Structure

## Visual Route Map

```
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (/api)                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PUBLIC ROUTES (No Authentication Required)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/login                                          │
│     ├─ Controller: AuthController@login                     │
│     ├─ Middleware: None                                     │
│     ├─ Purpose: Login and get token                         │
│     └─ Returns: User + Token                                │
│                                                              │
│  2. POST /api/register                                       │
│     ├─ Controller: AuthController@register                  │
│     ├─ Middleware: None                                     │
│     ├─ Purpose: Register new user                           │
│     └─ Returns: User + Token                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PROTECTED ROUTES (Authentication Required)                 │
│  Middleware: auth:sanctum                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  3. POST /api/logout                                         │
│     ├─ Controller: AuthController@logout                    │
│     ├─ Middleware: auth:sanctum ✓                           │
│     ├─ Purpose: Logout and revoke current token             │
│     └─ Returns: Success message                             │
│                                                              │
│  4. GET /api/me                                              │
│     ├─ Controller: AuthController@me                        │
│     ├─ Middleware: auth:sanctum ✓                           │
│     ├─ Purpose: Get current user info                       │
│     └─ Returns: User object                                 │
│                                                              │
│  5. POST /api/logout-all                                     │
│     ├─ Controller: AuthController@logoutAll                 │
│     ├─ Middleware: auth:sanctum ✓                           │
│     ├─ Purpose: Logout from all devices                     │
│     └─ Returns: Success message                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

### Public Route Flow (Login)

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ POST /api/login
     │ { email, password }
     ▼
┌─────────────────┐
│  Laravel Router │
└────┬────────────┘
     │
     │ No Middleware
     ▼
┌──────────────────────┐
│  AuthController      │
│  @login              │
├──────────────────────┤
│ 1. Validate input    │
│ 2. Find user         │
│ 3. Check password    │
│ 4. Create token      │
│ 5. Return response   │
└────┬─────────────────┘
     │
     │ 200 OK
     │ { user, token }
     ▼
┌──────────┐
│  Client  │
│ (Stores  │
│  token)  │
└──────────┘
```

### Protected Route Flow (Get User)

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ GET /api/me
     │ Authorization: Bearer {token}
     ▼
┌─────────────────┐
│  Laravel Router │
└────┬────────────┘
     │
     │ Apply Middleware
     ▼
┌──────────────────────┐
│  auth:sanctum        │
│  Middleware          │
├──────────────────────┤
│ 1. Extract token     │
│ 2. Validate token    │
│ 3. Get user          │
│ 4. Attach to request │
└────┬─────────────────┘
     │
     │ Token Valid?
     ├─ YES ──────────────────┐
     │                        ▼
     │              ┌──────────────────────┐
     │              │  AuthController      │
     │              │  @me                 │
     │              ├──────────────────────┤
     │              │ 1. Get auth user     │
     │              │ 2. Hide password     │
     │              │ 3. Return user       │
     │              └────┬─────────────────┘
     │                   │
     │                   │ 200 OK
     │                   │ { user }
     │                   ▼
     │              ┌──────────┐
     │              │  Client  │
     │              └──────────┘
     │
     └─ NO ───────────────────┐
                              ▼
                    ┌──────────────────┐
                    │  401 Unauthorized│
                    │  { message }     │
                    └────┬─────────────┘
                         │
                         ▼
                    ┌──────────┐
                    │  Client  │
                    └──────────┘
```

---

## Middleware Application

```
routes/api.php
│
├─ Public Routes (No Middleware)
│  │
│  ├─ POST /login
│  │  └─ AuthController@login
│  │
│  └─ POST /register
│     └─ AuthController@register
│
└─ Route::middleware('auth:sanctum')->group()
   │
   ├─ POST /logout
   │  └─ AuthController@logout
   │
   ├─ GET /me
   │  └─ AuthController@me
   │
   └─ POST /logout-all
      └─ AuthController@logoutAll
```

---

## Authentication Flow

### Complete User Journey

```
1. REGISTER/LOGIN
   ┌──────────────────────────────────────┐
   │ POST /api/register or /api/login     │
   │ ↓                                    │
   │ User created/authenticated           │
   │ ↓                                    │
   │ Token generated                      │
   │ ↓                                    │
   │ Return: { user, token }              │
   └──────────────────────────────────────┘
                    ↓
   ┌──────────────────────────────────────┐
   │ Client stores token                  │
   │ (localStorage/cookie)                │
   └──────────────────────────────────────┘

2. ACCESS PROTECTED ROUTES
   ┌──────────────────────────────────────┐
   │ GET /api/me                          │
   │ Authorization: Bearer {token}        │
   │ ↓                                    │
   │ Middleware validates token           │
   │ ↓                                    │
   │ Return: { user }                     │
   └──────────────────────────────────────┘

3. LOGOUT
   ┌──────────────────────────────────────┐
   │ POST /api/logout                     │
   │ Authorization: Bearer {token}        │
   │ ↓                                    │
   │ Token revoked from database          │
   │ ↓                                    │
   │ Return: { message }                  │
   └──────────────────────────────────────┘
                    ↓
   ┌──────────────────────────────────────┐
   │ Client removes token                 │
   └──────────────────────────────────────┘
```

---

## Route Organization Benefits

### ✅ Clear Separation
```php
// Public routes clearly at the top
Route::post('/login', ...);
Route::post('/register', ...);

// Protected routes grouped together
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', ...);
    Route::get('/me', ...);
});
```

### ✅ Easy to Extend
```php
// Add new protected route - just add inside the group
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', ...);
    Route::get('/me', ...);
    
    // New route automatically protected
    Route::get('/profile', [ProfileController::class, 'show']);
});
```

### ✅ Maintainable
- All authentication routes in one place
- Clear which routes require authentication
- Easy to add/remove middleware
- Simple to understand for new developers

---

## HTTP Methods Used

| Method | Route | Purpose | Idempotent |
|--------|-------|---------|------------|
| POST | /login | Create session/token | No |
| POST | /register | Create user | No |
| POST | /logout | Delete token | No |
| GET | /me | Read user data | Yes |
| POST | /logout-all | Delete all tokens | No |

**Note:** 
- GET is idempotent (same result on multiple calls)
- POST is not idempotent (may have different results)

---

## Security Layers

```
┌─────────────────────────────────────────┐
│         Client Request                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 1: HTTPS (Production)            │
│  Encrypts all traffic                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 2: CORS                          │
│  Validates origin domain                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 3: Route Middleware              │
│  auth:sanctum validates token           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 4: Controller Validation         │
│  Validates input data                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 5: Business Logic                │
│  Hash::check, authorization, etc.       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         Response                        │
│  (Password always hidden)               │
└─────────────────────────────────────────┘
```

---

## Quick Reference Table

| Endpoint | Method | Auth | Controller Method | Response |
|----------|--------|------|-------------------|----------|
| `/api/login` | POST | ❌ | `login()` | User + Token |
| `/api/register` | POST | ❌ | `register()` | User + Token |
| `/api/logout` | POST | ✅ | `logout()` | Message |
| `/api/me` | GET | ✅ | `me()` | User |
| `/api/logout-all` | POST | ✅ | `logoutAll()` | Message |

**Legend:**
- ✅ = Authentication required (auth:sanctum middleware)
- ❌ = No authentication required (public route)

---

## Testing Routes

### Test Public Route
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Protected Route
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Verify Routes
```bash
php artisan route:list --path=api
```

---

## Summary

### ✅ All Requirements Met

1. ✅ **POST /login** route created → `AuthController@login`
2. ✅ **POST /logout** route created → `AuthController@logout`
3. ✅ **GET /me** route created → `AuthController@me`
4. ✅ **auth:sanctum middleware** applied to `/logout` and `/me`
5. ✅ **Protected routes grouped** using `Route::middleware()->group()`

### 📊 Route Statistics

- **Total Routes:** 5
- **Public Routes:** 2
- **Protected Routes:** 3
- **Middleware Groups:** 1
- **Controllers:** 1 (AuthController)

### 🎯 Key Features

- ✅ RESTful API design
- ✅ Clear route organization
- ✅ Proper middleware application
- ✅ Well-documented code
- ✅ Easy to extend and maintain
- ✅ Follows Laravel best practices
