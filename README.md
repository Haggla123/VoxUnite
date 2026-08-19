# VoxUnite — Secure University Digital Voting Platform

A production-grade MERN stack university election platform with enterprise-level security, real-time monitoring, and premium UI/UX.

![VoxUnite](https://img.shields.io/badge/VoxUnite-Secure_Democracy-6366f1?style=for-the-badge)

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB, Mongoose |
| **Real-time** | Socket.io |
| **Auth** | JWT, OTP verification |
| **Charts** | Recharts |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone and Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install --legacy-peer-deps
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voxunite
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Demo Data

```bash
cd server
npm run seed
```

This creates:
- **Admin**: admin@university.edu / Admin@VoxUnite2024
- **200 eligible students** across 6 faculties
- **Active election** with 9 candidates across 4 positions

### 4. Start Development

```bash
# Terminal 1: Server
cd server
npm run dev

# Terminal 2: Client
cd client
npm run dev
```

Open http://localhost:5173

## 🔐 Authentication Flow

### Student Login
1. Enter Student ID + Email (e.g., `STU2024000` / `adaeze.okafor0@university.edu`)
2. Receive OTP (shown in UI for demo mode)
3. Verify OTP → JWT session created
4. Vote once → session becomes read-only

### Admin Login
- Email: `admin@university.edu`
- Password: `Admin@VoxUnite2024`

## 🛡️ Security Features

- **Triple-layer double-vote prevention** (session, backend, database unique index)
- **OTP with expiry and retry limits** (5 min expiry, 3 max retries)
- **Immutable votes** (cannot be edited or deleted after submission)
- **Role-based access control** (admin/student JWT middleware)
- **Comprehensive audit logging** (every action tracked)
- **Anonymous voting** (voter identity never linked to ballot content)

## 📋 Features

### Student
- 🗳️ Ceremonial voting booth with manifesto reading
- 📱 Mobile-responsive voting experience
- 🧾 Vote receipt confirmation
- 📊 Live election monitor

### Admin
- 📤 CSV/XLSX voter import with smart header normalization
- 🏛️ Full election lifecycle management (Draft → Active → Closed)
- 👤 Candidate management with photo upload
- 📈 Enterprise analytics dashboard
- 📝 Searchable audit logs
- 🔴 Live results mode toggle (Safe/Live)

### Live Monitor
- ⏱️ Real-time countdown timer
- 📊 Faculty turnout charts
- 🔴 Live activity feed
- 🏆 Faculty participation leaderboard
- 📡 Socket.io real-time updates

## 🗂️ Project Structure

```
E-vote/
├── server/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, validation, upload
│   │   ├── services/         # OTP, audit, parser
│   │   ├── index.ts          # Server entry
│   │   └── seed.ts           # Demo data seeder
│   └── uploads/              # File storage
├── client/
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # Auth context
│   │   └── lib/              # API & socket
│   └── index.html
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/login` | — | Admin login |
| POST | `/api/auth/request-otp` | — | Request student OTP |
| POST | `/api/auth/verify-otp` | — | Verify OTP |
| GET | `/api/elections` | — | List elections |
| POST | `/api/elections` | Admin | Create election |
| POST | `/api/elections/:id/activate` | Admin | Activate election |
| POST | `/api/elections/:id/close` | Admin | Close election |
| POST | `/api/voters/upload` | Admin | Import voter CSV/XLSX |
| POST | `/api/candidates` | Admin | Add candidate |
| POST | `/api/votes` | Student | Cast vote |
| GET | `/api/results/:id` | — | Get results |
| GET | `/api/analytics/dashboard` | Admin | Dashboard stats |
| GET | `/api/analytics/audit-logs` | Admin | Audit logs |

## 🚢 Deployment

### Backend (Render/Railway)
```bash
cd server
npm run build
npm start
```

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

Set environment variables:
- `VITE_API_URL` → Backend URL
- `MONGODB_URI` → MongoDB Atlas connection string
- `JWT_SECRET` → Strong secret key

## 📄 License

MIT License — Built for academic institutions.
