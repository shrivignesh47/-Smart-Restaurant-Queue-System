# Frontend-Backend Integration Summary

## ✅ Configuration Complete

### Backend Setup (Port 3000)
- **Server**: Running on `http://localhost:3000`
- **Database**: MySQL connected to `restaurant_queue_db`
- **CORS**: Configured for `http://localhost:4200`
- **JWT**: Stateless token-based authentication

### Frontend Setup (Port 4200)
- **API URL**: `http://localhost:3000/api`
- **Environment**: Configured in `src/environments/`
- **Auth Service**: Connected to backend endpoints
- **Interceptor**: Auto-attaches JWT tokens to requests

## 🔐 Authentication Flow

1. **Send OTP**
   - Frontend: `AuthService.sendOtp(phone)`
   - Backend: `POST /api/auth/send-otp`
   - Returns: `{ otp, otpToken }`

2. **Verify OTP**
   - Frontend: `AuthService.verifyOtp(phone, otp, otpToken)`
   - Backend: `POST /api/auth/verify-otp`
   - Returns: `{ accessToken, user }`

3. **Auto-Login**
   - Creates user if doesn't exist
   - Stores JWT in localStorage
   - Updates user state via BehaviorSubject

4. **Protected Routes**
   - AuthGuard checks `isAuthenticated()`
   - HTTP Interceptor adds `Authorization: Bearer <token>`
   - Auto-logout on 401 errors

## 📁 Key Files

### Backend
- `backend/server.js` - Main server configuration
- `backend/app/controllers/auth.controller.js` - OTP logic
- `backend/app/routes/user.routes.js` - API routes
- `backend/app/middleware/authJwt.js` - JWT verification
- `backend/.env` - Environment variables

### Frontend
- `src/app/core/services/auth.service.ts` - Authentication service
- `src/app/core/auth.guard.ts` - Route protection
- `src/app/core/http.interceptor.ts` - JWT injection
- `src/app/features/auth/login/` - Login component
- `src/environments/environment.development.ts` - API URL

## 🧪 Testing

### Quick Test (Browser Console)
```javascript
// At http://localhost:4200
fetch('http://localhost:3000/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contact_info: '9876543210' })
}).then(r => r.json()).then(console.log);
```

### Full Test Flow
1. Navigate to `http://localhost:4200/auth/login`
2. Enter phone: `9876543210`
3. Click "Send OTP"
4. Check console for OTP (e.g., `123456`)
5. Enter OTP and click "Verify & Login"
6. Should redirect to home page with user logged in

## 🔍 Debugging

### Enable Detailed Logs
The AuthService now includes console logging:
- `[AuthService] Sending OTP to: ...`
- `[AuthService] API URL: ...`
- `[AuthService] OTP Response: ...`
- `[AuthService] Verify Response: ...`

### Common Issues

**CORS Error**
- Check backend CORS origin matches frontend URL
- Restart backend after changes

**Connection Refused**
- Verify backend is running on port 3000
- Check `backend/.env` has `PORT=3000`

**401 Unauthorized**
- Check JWT token is being sent in headers
- Verify token hasn't expired (24 hours)

**Database Error**
- Ensure MySQL is running
- Verify credentials in `.env`
- Check database exists: `CREATE DATABASE restaurant_queue_db;`

## 🚀 Next Steps

1. **Test the connection** using the test page or login form
2. **Check browser console** for detailed logs
3. **Verify database** has users table created
4. **Test protected routes** after logging in

## 📞 Support

If you encounter issues:
1. Check both terminal outputs (frontend & backend)
2. Open browser DevTools (F12) and check Console & Network tabs
3. Review `backend/API_TESTING.md` for detailed testing instructions
