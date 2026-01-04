# Quick Debug Checklist

## ✅ Login Working?

### Check Browser Console (F12)
Should see these logs in order:

**On Login:**
```
[LoginDialog] Sending OTP for: 9159234842
[AuthService] Sending OTP to: 9159234842
[AuthService] API URL: http://localhost:3000/api/auth/send-otp
[AuthService] OTP Response: {message: "OTP sent successfully!", otp: "123456", otpToken: "eyJ..."}
```

**On OTP Verify:**
```
[LoginDialog] Verifying OTP for: 9159234842
[AuthService] Verifying OTP for: 9159234842
[AuthService] API URL: http://localhost:3000/api/auth/verify-otp
[AuthService] Verify Response: {id: 2, name: "New Customer", role: "Customer", ...}
[AuthService] Setting session for user: New Customer
[AuthService] Session set. Token expires at: [timestamp]
[Header] User state changed: {id: 2, name: "New Customer", ...}
```

### Check Network Tab (F12)
Should see these requests:

1. **POST** `http://localhost:3000/api/auth/send-otp`
   - Status: 200 OK
   - Response: `{otp, otpToken}`

2. **POST** `http://localhost:3000/api/auth/verify-otp`
   - Status: 200 OK
   - Response: `{accessToken, id, name, role, contact_info}`

### Check LocalStorage (F12 → Application → Local Storage)
After login should have:
- `accessToken`: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
- `tokenExpiry`: "1704390000000"
- `user`: "{\"id\":2,\"name\":\"New Customer\",...}"

### Check UI
- ✅ Header shows user name
- ✅ Profile menu has "Logout" button
- ✅ No "Login" button visible
- ✅ User avatar displayed

## ❌ Not Working?

### No API Calls?
1. Check backend is running: `http://localhost:3000/api/test`
2. Check CORS in `backend/server.js`: `origin: 'http://localhost:4200'`
3. Check environment file: `src/environments/environment.development.ts`

### User Not Staying Logged In?
1. Check localStorage has `accessToken`
2. Check console for "[AuthService] Token expired"
3. Verify `tokenExpiry` is in the future

### Header Not Updating?
1. Check console for "[Header] User state changed"
2. Verify `currentUser` is not null in component
3. Check template uses `*ngIf="currentUser"`

### Token Expiring Too Fast?
1. Check `setSession()` in AuthService
2. Should be: `60 * 60 * 1000` (1 hour in milliseconds)
3. Check backend JWT expiry: `expiresIn: 86400` (24 hours)

## 🔧 Quick Fixes

### Clear Everything and Start Fresh
```javascript
// Run in browser console
localStorage.clear();
location.reload();
```

### Check Token Expiry Time
```javascript
// Run in browser console
const expiry = localStorage.getItem('tokenExpiry');
console.log('Token expires at:', new Date(parseInt(expiry)).toLocaleString());
```

### Manually Set Long Expiry (for testing)
```javascript
// Run in browser console
const oneWeekFromNow = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
localStorage.setItem('tokenExpiry', oneWeekFromNow.toString());
```

### Check if Authenticated
```javascript
// Run in browser console
const token = localStorage.getItem('accessToken');
const expiry = localStorage.getItem('tokenExpiry');
const now = new Date().getTime();
console.log('Has token:', !!token);
console.log('Token expired:', now > parseInt(expiry));
console.log('Is authenticated:', !!token && now <= parseInt(expiry));
```

## 📞 Common Issues

### Issue: "Login button shows even when logged in"
**Fix:** Check if `currentUser` is being set in header component

### Issue: "Page redirects to login after successful login"
**Fix:** Removed `window.location.reload()` from dialog close handler

### Issue: "User logged out immediately after login"
**Fix:** Check token expiry is set correctly (should be 1 hour from now)

### Issue: "Protected routes not working"
**Fix:** Verify AuthGuard is imported and used in routing module

### Issue: "API requests don't have Authorization header"
**Fix:** Check HTTP Interceptor is provided in CoreModule

## 🎯 Expected Behavior

✅ Login → Header updates immediately (no reload)
✅ Refresh page → User stays logged in
✅ Logout → Header updates immediately (no redirect)
✅ Wait 1 hour → Auto-logout on next page load
✅ Protected routes → Redirect to login if not authenticated
✅ All API calls → Include "Authorization: Bearer <token>" header
