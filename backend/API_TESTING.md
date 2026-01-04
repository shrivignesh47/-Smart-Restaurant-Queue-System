# Backend API Testing Guide

## Quick Start

### 1. Verify Backend is Running
The backend should be running on **port 3000**. Check the terminal output for:
```
Server is running on port 3000.
Successfully connected to the database.
Users table created or already exists.
```

### 2. Test API Endpoints

#### Using the Test HTML Page
1. Open `backend/test-api.html` in your browser
2. Click "Send OTP" - you should see the OTP in the response
3. The OTP and token will auto-fill in the verify section
4. Click "Verify OTP" to complete the login flow

#### Using Browser DevTools Console
Open your browser console (F12) and run:

```javascript
// Test Send OTP
fetch('http://localhost:3000/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contact_info: '9876543210' })
})
.then(r => r.json())
.then(data => {
  console.log('OTP Response:', data);
  // Save these for next step
  window.testOtp = data.otp;
  window.testToken = data.otpToken;
});

// Test Verify OTP (run after above completes)
fetch('http://localhost:3000/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    contact_info: '9876543210',
    otp: window.testOtp,
    otpToken: window.testToken
  })
})
.then(r => r.json())
.then(data => console.log('Login Response:', data));
```

### 3. Test from Angular Frontend

1. Navigate to `http://localhost:4200/auth/login`
2. Enter phone number: `9876543210`
3. Click "Send OTP"
4. Check browser console for:
   - `[AuthService] Sending OTP to: 9876543210`
   - `[AuthService] API URL: http://localhost:3000/api/auth/send-otp`
   - `[AuthService] OTP Response: {...}`
5. Enter the OTP shown in the response
6. Click "Verify & Login"
7. You should be logged in and redirected

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Verify backend `server.js` has `origin: 'http://localhost:4200'`
- Restart the backend server

### Connection Refused
- Check backend is running on port 3000
- Verify `.env` file has `PORT=3000`
- Check no other service is using port 3000

### Database Errors
- Ensure MySQL is running
- Verify credentials in `backend/.env`
- Check database `restaurant_queue_db` exists

## API Endpoints

### POST /api/auth/send-otp
**Request:**
```json
{
  "contact_info": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully!",
  "otp": "123456",
  "otpToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/verify-otp
**Request:**
```json
{
  "contact_info": "9876543210",
  "otp": "123456",
  "otpToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "id": 1,
  "name": "New Customer",
  "role": "Customer",
  "contact_info": "9876543210",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Environment Configuration

### Backend (.env)
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Shrivignesh@37
DB_NAME=restaurant_queue_db
```

### Frontend (environment.development.ts)
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```
