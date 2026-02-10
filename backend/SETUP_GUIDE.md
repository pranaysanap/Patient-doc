# VaidyaSetu Backend Setup Guide

Follow these steps in order to set up and run the backend server.

## Step 1: Install Dependencies

Open your terminal in the backend folder and run:

```bash
cd c:\Users\Sujal\Documents\Project\hackathon\VaidyaSetu\backend
npm install
```

This will install all required packages (Express, MongoDB, JWT, etc.)

---

## Step 2: Create .env File

Copy the example environment file:

```bash
copy .env.example .env
```

Then open `.env` file and fill in these values:

### 2.1 MongoDB Atlas Connection
1. Go to https://cloud.mongodb.com/
2. Create a free cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace in `.env`:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vaidyasetu?retryWrites=true&w=majority
```

### 2.2 Generate Doctor Password Hash

Run this command to hash your password:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
```

Copy the output and paste it in `.env`:
```
DOCTOR_PASSWORD_HASH=<paste_the_hash_here>
```

### 2.3 Google OAuth (For Patient Login Later)

For now, you can leave these as placeholders:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

We'll set these up when we integrate patient authentication.

### 2.4 JWT Secret

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `.env`:
```
JWT_SECRET=<paste_random_string_here>
```

---

## Step 3: Test the Server

Start the server in development mode:

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 VaidyaSetu Backend Server Started
📍 Environment: development
🌐 Server running on: http://localhost:5000
💚 Health check: http://localhost:5000/health
```

### Test Health Check

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "VaidyaSetu Backend API is running",
  "timestamp": "2026-02-11T...",
  "environment": "development"
}
```

---

## Next Steps

Once the basic server is running, I'll create:
1. MongoDB models (Doctor, Patient, Prescription, etc.)
2. Authentication routes (doctor login, patient OAuth)
3. API routes for all features

**The backend won't break your existing frontends!** They'll keep using mock data until you're ready to connect them.

---

## Troubleshooting

### Error: "Cannot find module 'dotenv'"
Solution: Run `npm install` again

### Error: "MongoDB connection failed"
Solution: Check your MONGODB_URI in `.env` file

### Error: "Port 5000 already in use"
Solution: Change PORT in `.env` to 5001 or another available port

### Error: "bcryptjs not found"
Solution: The password hash command requires bcryptjs. Install it first:
```bash
npm install
```

---

## Quick Reference

Start server: `npm run dev`
Stop server: `Ctrl + C`
View logs: Terminal output shows all requests
