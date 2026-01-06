# Login Dialog API Integration - Testing Guide

## ✅ FIXED: Login Dialog Now Connected to Backend

The login dialog component has been updated to use the real backend API instead of mock data.

## How to Test

### 1. Open the Application
Navigate to `http://localhost:4200`

### 2. Click the Login Button
The login dialog should appear

### 3. Enter Phone Number
- Enter: `9159234842` (or any 10-digit number starting with 6-9)
- Click "Send OTP"

### 4. Check Browser Console (F12)
You should see:
```
[LoginDialog] Sending OTP for: 9159234842
[AuthService] Sending OTP to: 9159234842
[AuthService] API URL: http://localhost:3000/api/auth/send-otp
[AuthService] OTP Response: {message: "OTP sent successfully!", otp: "123456", otpToken: "eyJ..."}
```

### 5. Check Network Tab
You should see:
- Request to: `http://localhost:3000/api/auth/send-otp`
- Method: POST
- Status: 200 OK
- Response body with `otp` and `otpToken`

### 6. Enter OTP
- The OTP will be shown in the snackbar notification (bottom of screen)
- Enter the OTP in the dialog
- Click "Verify & Login"

### 7. Verify Login
Console should show:
```
[LoginDialog] Verifying OTP for: 9159234842
[AuthService] Verifying OTP for: 9159234842
[AuthService] API URL: http://localhost:3000/api/auth/verify-otp
[AuthService] Verify Response: {id: 1, name: "New Customer", role: "Customer", ...}
[AuthService] Setting session for user: New Customer
```

### 8. Check Network Tab Again
You should see:
- Request to: `http://localhost:3000/api/auth/verify-otp`
- Method: POST
- Status: 200 OK
- Response with user data and `accessToken`

## What Changed

### Before (Mock):
```typescript
setTimeout(() => {
  this.otpSent = true;
  this.snackBar.open('OTP sent', 'Close');
}, 1000);
```

### After (Real API):
```typescript
this.authService.sendOtp(phone).subscribe({
  next: (res) => {
    this.otpSent = true;
    this.otpToken = res.otpToken;
    this.snackBar.open(`OTP: ${res.otp}`, 'Close');
  },
  error: (err) => {
    this.snackBar.open(err.error?.message, 'Close');
  }
});
```

## Debugging

### No API Call?
1. Check browser console for errors
2. Verify backend is running on port 3000
3. Check Network tab for CORS errors
4. Ensure `environment.development.ts` has correct API URL

### CORS Error?
Backend `server.js` should have:
```javascript
const corsOptions = {
  origin: 'http://localhost:4200'
};
app.use(cors(corsOptions));
```

### Backend Not Responding?
Check backend terminal for:
```
Server is running on port 3000.
Successfully connected to the database.
```

## Success Indicators

✅ Network tab shows API requests
✅ Console shows detailed logs
✅ Snackbar displays OTP
✅ Login succeeds and dialog closes
✅ User is logged in (check header for user name)
