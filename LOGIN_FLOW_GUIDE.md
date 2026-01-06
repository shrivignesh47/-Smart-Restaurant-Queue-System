# Login Persistence & Session Management - Complete Guide

## ✅ What's Been Fixed

### 1. **Token Expiration (1 Hour)**
- JWT token now expires after 1 hour
- Stored in localStorage with expiration timestamp
- Automatically checked on every `isAuthenticated()` call
- Auto-logout when token expires

### 2. **Persistent Login State**
- User stays logged in across page refreshes
- Session loaded from localStorage on app startup
- No more redirect to login page after successful login

### 3. **Real-time Navbar Updates**
- Navbar automatically updates when user logs in
- Shows user avatar and name
- Displays "Logout" button when logged in
- Shows "Login" button when logged out
- No page reload required!

### 4. **Improved Logout Flow**
- Logout clears all session data
- User stays on current page (no forced redirect)
- Navbar updates immediately to show login button

## 🔐 Complete Login Flow

### Step 1: User Opens App
```
1. App loads → AuthService constructor runs
2. loadUserFromStorage() checks localStorage
3. If token exists and not expired → User is logged in
4. user$ BehaviorSubject emits user data
5. Header subscribes to user$ and displays user info
```

### Step 2: User Clicks Login
```
1. Login dialog opens
2. User enters phone number
3. Click "Send OTP"
4. API call: POST /api/auth/send-otp
5. Backend returns: { otp, otpToken }
6. OTP shown in snackbar
```

### Step 3: User Verifies OTP
```
1. User enters OTP
2. Click "Verify & Login"
3. API call: POST /api/auth/verify-otp
4. Backend returns: { accessToken, id, name, role, contact_info }
5. AuthService.setSession() stores:
   - accessToken in localStorage
   - tokenExpiry (current time + 1 hour)
   - user object in localStorage
6. user$ BehaviorSubject emits new user
7. Header receives update and shows user info
8. Dialog closes automatically
```

### Step 4: User Navigates Around
```
1. User stays logged in
2. HTTP Interceptor adds "Authorization: Bearer <token>" to all requests
3. AuthGuard allows access to protected routes
4. Token expiration checked automatically
```

### Step 5: User Refreshes Page
```
1. App reloads
2. AuthService constructor runs
3. loadUserFromStorage() reads from localStorage
4. Checks if token expired
5. If valid → User stays logged in
6. If expired → Auto-logout
```

### Step 6: User Clicks Logout
```
1. Click "Logout" in profile menu
2. AuthService.logout() clears:
   - accessToken
   - tokenExpiry
   - user object
3. user$ BehaviorSubject emits null
4. Header receives update and shows login button
5. User stays on current page
```

## 📦 LocalStorage Data Structure

### When Logged In:
```javascript
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiry": "1704390000000",  // Timestamp (1 hour from login)
  "user": "{\"id\":2,\"name\":\"New Customer\",\"role\":\"Customer\",\"contact_info\":\"9159234842\"}"
}
```

### When Logged Out:
```javascript
{
  // All cleared
}
```

## 🧪 Testing the Flow

### Test 1: Login and Stay Logged In
1. Open `http://localhost:4200`
2. Click "Login" button
3. Enter phone: `9159234842`
4. Send OTP and verify
5. ✅ Header should show your name
6. ✅ Refresh page → Still logged in
7. ✅ Open DevTools → Check localStorage for token

### Test 2: Logout
1. While logged in, click your name in header
2. Click "Logout"
3. ✅ Header should show "Login" button
4. ✅ LocalStorage should be cleared
5. ✅ You stay on the same page

### Test 3: Token Expiration
1. Login successfully
2. Open DevTools → Application → LocalStorage
3. Find `tokenExpiry` and change it to a past timestamp
4. Refresh the page
5. ✅ Should auto-logout (token expired)

### Test 4: Protected Routes
1. Logout completely
2. Try to navigate to `/tables` or `/reservation`
3. ✅ Should redirect to `/auth/login`
4. Login again
5. ✅ Should redirect back to the page you tried to access

## 🔍 Console Logs to Watch

### On Login:
```
[LoginDialog] Sending OTP for: 9159234842
[AuthService] Sending OTP to: 9159234842
[AuthService] OTP Response: {...}
[LoginDialog] Verifying OTP for: 9159234842
[AuthService] Verify Response: {...}
[AuthService] Setting session for user: New Customer
[AuthService] Session set. Token expires at: 1/5/2026, 12:38:53 AM
[Header] User state changed: {id: 2, name: "New Customer", ...}
[Header] Login successful, user logged in
```

### On Page Refresh (Logged In):
```
[Header] User state changed: {id: 2, name: "New Customer", ...}
```

### On Logout:
```
[AuthService] Logging out user
[Header] User logged out
[Header] User state changed: null
```

### On Token Expiry:
```
[AuthService] Token expired, logging out
[AuthService] Logging out user
[Header] User state changed: null
```

## 🎯 Key Features

✅ **Persistent Login** - User stays logged in across page refreshes
✅ **1 Hour Token** - Automatic expiration after 1 hour
✅ **Real-time UI Updates** - No page reload needed
✅ **Secure Storage** - JWT token in localStorage
✅ **Auto-logout** - When token expires
✅ **Protected Routes** - AuthGuard checks authentication
✅ **HTTP Interceptor** - Auto-attaches token to API requests
✅ **Clean Logout** - Clears all session data

## 📝 Files Modified

1. `src/app/core/services/auth.service.ts` - Token expiration & session management
2. `src/app/layout/header/header.component.ts` - Real-time user state subscription
3. `src/app/shared/components/login-dialog/login-dialog.component.ts` - Connected to API

## 🚀 Ready to Test!

Your login system is now fully functional with:
- ✅ Real backend API integration
- ✅ JWT token authentication
- ✅ 1-hour session expiration
- ✅ Persistent login state
- ✅ Real-time navbar updates
- ✅ Proper logout flow

Open your app and try logging in! The user should stay logged in even after page refresh. 🎉
