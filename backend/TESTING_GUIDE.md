# 🧪 Backend Testing Guide - Step by Step

## ⚠️ IMPORTANT: Restart Server First!

The routes have been enabled but the server needs to restart to load them.

### Step 1: Stop the Server

In the terminal where `npm run dev` is running (Terminal 12084):
- Press **Ctrl + C** to stop the server

### Step 2: Restart the Server

```bash
cd c:\Users\Sujal\Documents\Project\hackathon\VaidyaSetu\backend
npm run dev
```

Wait for:
```
✅ MongoDB Connected
🚀 VaidyaSetu Backend Server Started
📍 Environment: development
🌐 Server running on: http://localhost:5000
💚 Health check: http://localhost:5000/health
```

**Keep this terminal open!** The server runs here.

---

## 🧪 Testing the API (Use New Terminal)

Open a **new terminal** (or use Terminal 8844) and run these tests:

### Test 1: Health Check ✅
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "VaidyaSetu Backend API is running",
  "timestamp": "2026-02-11T...",
  "environment": "development"
}
```

---

### Test 2: Doctor Login 🔐
```bash
curl -X POST http://localhost:5000/api/v1/auth/doctor/login -H "Content-Type: application/json" -d "{\"username\":\"dr.sujal\",\"password\":\"admin123\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N...",
  "user": {
    "id": "...",
    "doctorId": "dr_sujal_jadhav_001",
    "name": "Dr. Sujal Jadhav",
    "email": "sujal.jadhav@vaidyasetu.com",
    "role": "doctor",
    "username": "dr.sujal"
  }
}
```

**Copy the token value!** You'll need it for next tests.

---

### Test 3: Get Current User (Protected Route) 👤

Replace `YOUR_TOKEN_HERE` with the token from Test 2:

```bash
curl http://localhost:5000/api/v1/auth/me -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Dr. Sujal Jadhav",
    "email": "sujal.jadhav@vaidyasetu.com",
    "role": "doctor"
  }
}
```

---

### Test 4: Get All Patients (Empty at First) 👥

```bash
curl http://localhost:5000/api/v1/patients -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 0,
  "patients": []
}
```

---

## 🎯 Alternative: Use Postman (Easier for Testing!)

If curl commands are difficult, use **Postman** or **Thunder Client** (VS Code extension):

### 1. Install Thunder Client in VS Code
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search "Thunder Client"
- Install it
- Click Thunder Client icon in sidebar

### 2. Create Requests in Thunder Client

**Health Check:**
- Method: `GET`
- URL: `http://localhost:5000/health`
- Click "Send"

**Doctor Login:**
- Method: `POST`
- URL: `http://localhost:5000/api/v1/auth/doctor/login`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "username": "dr.sujal",
  "password": "admin123"
}
```
- Click "Send"
- Copy the `token` from response

**Get Current User:**
- Method: `GET`
- URL: `http://localhost:5000/api/v1/auth/me`
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Click "Send"

---

## ✅ Success Checklist

After running tests, you should have:
- ✅ Health check returns success
- ✅ Doctor login returns JWT token
- ✅ Protected routes work with token
- ✅ No "Route not found" errors

---

## ❌ Troubleshooting

### Still getting "Route not found"?
**Solution**: Make sure you restarted the server after I enabled the routes!

### Getting "Unauthorized" or "Invalid token"?
**Solution**: Copy the full token from login response including `eyJ...` part

### Server won't start?
**Solution**: Check if port 5000 is already in use. Stop other processes or change PORT in .env

### MongoDB connection error?
**Solution**: Check .env file has correct MONGODB_URI with your cluster address

---

## 📊 All Available Endpoints

Once authenticated, you can test these endpoints:

### Authentication
- `POST /api/v1/auth/doctor/login` - Doctor login
- `POST /api/v1/auth/patient/google` - Patient Google OAuth
- `GET /api/v1/auth/me` - Get current user (protected)

### Patients
- `GET /api/v1/patients` - List all patients (doctor only)
- `GET /api/v1/patients/:patientId` - Get patient details
- `PUT /api/v1/patients/:patientId` - Update patient
- `PATCH /api/v1/patients/:patientId/status` - Update status

### Prescriptions
- `POST /api/v1/prescriptions` - Create prescription (doctor)
- `GET /api/v1/prescriptions/patient/:patientId` - Get patient prescriptions
- `GET /api/v1/prescriptions/:prescriptionId` - Get specific prescription
- `PUT /api/v1/prescriptions/:prescriptionId` - Update prescription
- `PATCH /api/v1/prescriptions/:prescriptionId/status` - Update status

### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/doctor` - Get doctor appointments
- `GET /api/v1/appointments/patient/:patientId` - Get patient appointments
- `PATCH /api/v1/appointments/:appointmentId/status` - Update status
- `PUT /api/v1/appointments/:appointmentId/report` - Add report (doctor)
- `DELETE /api/v1/appointments/:appointmentId` - Cancel

### Health Metrics
- `POST /api/v1/health-metrics/:patientId` - Upload metrics
- `GET /api/v1/health-metrics/:patientId/latest` - Get latest
- `GET /api/v1/health-metrics/:patientId/history` - Get history

---

## 🎉 Next Steps

Once all tests pass:
1. ✅ Backend is fully working
2. 🔗 Connect your doctor dashboard to API
3. 🔗 Connect your patient app to API
4. 🚀 Deploy to production (optional)

**Server running?** Go test now! 🚀
