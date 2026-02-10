# MongoDB Atlas - Quick Setup Checklist

## ✅ Step 1: Wait for Cluster Creation
Your cluster "Cluster0" is being created. Wait for it to show "Active" status (1-3 minutes).

## ✅ Step 2: Add IP Address
1. Click **"Connect"** button on Cluster0
2. Click **"Add Current IP Address"**
   - Or add `0.0.0.0/0` for testing (allows any IP)

## ✅ Step 3: Create Database User
1. Username: `admin` (or your choice)
2. Password: Choose a strong password
   - **SAVE THIS PASSWORD!**
3. Click "Create Database User"

## ✅ Step 4: Get Connection String
1. Choose **"Connect your application"**
2. Driver: **Node.js**
3. Copy the connection string that looks like:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## ✅ Step 5: Update .env File
Open `backend/.env` and update:

```env
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vaidyasetu?retryWrites=true&w=majority
```

**Important Changes:**
- Replace `YOUR_PASSWORD` with the password you created
- Add `/vaidyasetu` before the `?` (this is your database name)

## ✅ Step 6: Generate Other Environment Variables

### JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy output to `JWT_SECRET` in .env

### Doctor Password Hash
```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
```
Copy output to `DOCTOR_PASSWORD_HASH` in .env

## ✅ Step 7: Initialize Database
```bash
cd backend
npm install
npm run init-db
```

## ✅ Step 8: Start Server
```bash
npm run dev
```

Server should start on http://localhost:5000

---

**Need Help?**
- ❌ Can't connect? Check username/password are correct
- ❌ IP blocked? Add your IP or use 0.0.0.0/0
- ❌ Database name missing? Make sure you added `/vaidyasetu` before `?`
