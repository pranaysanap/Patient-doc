# VaidyaSetu Backend API

Backend server for the VaidyaSetu Healthcare Platform connecting Dr. Sujal Jadhav with patients through real-time health monitoring.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account
- Google OAuth 2.0 credentials (for patient authentication)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your:
- MongoDB Atlas connection string
- Google OAuth credentials
- JWT secret
- Doctor password hash

3. **Generate doctor password hash**:
```bash
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```
Copy the output to `DOCTOR_PASSWORD_HASH` in `.env`

4. **Start the server**:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📋 API Documentation

### Health Check
```
GET /health
```

### Authentication Routes
```
POST /api/v1/auth/doctor/login       - Doctor login (username/password)
POST /api/v1/auth/patient/google     - Patient login (Google OAuth)
```

### More routes will be documented as they're implemented...

## 🗂️ Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js             # JWT authentication
│   └── errorHandler.js     # Error handling
├── models/                 # Mongoose schemas (to be added)
├── routes/                 # API routes (to be added)
├── server.js              # Express server entry point
├── package.json
├── .env.example           # Environment template
└── .gitignore
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **google-auth-library** - Google OAuth
- **cors** - CORS middleware
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **compression** - Response compression
- **express-rate-limit** - Rate limiting

## 🛠️ Development

```bash
npm run dev  # Start with nodemon for auto-reload
```

## 📝 License

MIT
