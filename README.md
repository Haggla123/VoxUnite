# VoxUnite - University Digital Voting Platform

VoxUnite is a MERN stack university election platform with student OTP verification, administrator election management, vote records, audit logs, and real-time election monitoring.

![VoxUnite](https://img.shields.io/badge/VoxUnite-Secure_Democracy-6366f1?style=for-the-badge)

## Architecture

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Real-time | Socket.io |
| Auth | JWT sessions in HttpOnly cookies, student OTP verification |
| Charts | Recharts |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas URI

### 1. Clone and Install

```bash
cd server
npm install

cd ../client
npm install --legacy-peer-deps
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voxunite
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h
OTP_EXPIRY_MINUTES=5
OTP_MAX_RETRIES=3
OTP_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
COOKIE_SAME_SITE=lax
```

Use `COOKIE_SAME_SITE=none` only when the API and client are on different sites over HTTPS. In that mode, cookies are sent with the `Secure` flag.

### 3. Seed Demo Data

```bash
cd server
npm run seed
```

This creates:

- Admin: `admin@university.edu` / `Admin@VoxUnite2024`
- 200 eligible students across 6 faculties
- An active election with candidates across multiple positions

### 4. Start Development

```bash
cd server
npm run dev

cd client
npm run dev
```

Open `http://localhost:5173`.

## Authentication Flow

### Student Login

1. A student submits Student ID and institutional email.
2. The server verifies that the student is in the eligible voter registry.
3. The server generates a short-lived OTP and stores only a bcrypt hash of it.
4. After OTP verification, the server sets a student JWT session in an HttpOnly cookie.
5. Student-only APIs, including vote submission, read the cookie server-side.

The demo UI still displays the OTP so local testers can complete the flow without email delivery. Production deployments should send the OTP through an institutional email provider and stop returning `demoOtp`.

### Admin Login

1. An admin submits email and password.
2. The server verifies the bcrypt-hashed admin password.
3. The server sets an admin JWT session in an HttpOnly cookie.
4. Admin-only APIs verify the cookie and enforce role-based access.

## Security Model

- JWTs are stored in `HttpOnly`, `SameSite` cookies and are not written to `localStorage`.
- Admin and student sessions use separate cookies, and successful login clears the other session type.
- Logout endpoints clear both session cookies.
- Student OTPs are bcrypt-hashed before database storage, expire automatically, and enforce retry limits.
- Socket.io handshakes require a valid admin or student session cookie before real-time events are delivered.
- Vote submission requires a valid student session and checks election status, voter eligibility, duplicate vote records, and the voter's election history.
- Admin APIs use authenticated middleware and role checks where needed.
- Audit logs record authentication events, vote submission, and administrative actions.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and deployment guidance.

## Features

### Student

- OTP-based student verification
- Mobile-responsive voting booth
- Candidate and manifesto review
- Vote receipt confirmation
- Live election monitor for authenticated users

### Admin

- CSV/XLSX voter import with header normalization
- Election lifecycle management: draft, scheduled, active, closed
- Candidate management with photo upload
- Analytics dashboard
- Searchable audit logs
- Safe/live results visibility controls

## Project Structure

```text
VoxUnite/
|-- server/
|   |-- src/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- middleware/
|   |   |-- services/
|   |   |-- index.ts
|   |   `-- seed.ts
|   `-- uploads/
|-- client/
|   |-- src/
|   |   |-- pages/
|   |   |-- components/
|   |   |-- contexts/
|   |   `-- lib/
|   `-- index.html
|-- README.md
`-- SECURITY.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/admin/login` | Public | Admin login; sets admin session cookie |
| POST | `/api/admin/logout` | Cookie | Clears session cookies |
| GET | `/api/admin/me` | Admin | Current admin profile |
| POST | `/api/auth/request-otp` | Public | Request student OTP |
| POST | `/api/auth/verify-otp` | Public | Verify OTP; sets student session cookie |
| POST | `/api/auth/logout` | Cookie | Clears session cookies |
| GET | `/api/auth/me` | Student | Current student profile |
| GET | `/api/elections` | Public | List elections |
| POST | `/api/elections` | Admin | Create election |
| POST | `/api/elections/:id/activate` | Admin | Activate election |
| POST | `/api/elections/:id/close` | Admin | Close election |
| POST | `/api/voters/upload` | Admin | Import voter CSV/XLSX |
| POST | `/api/candidates` | Admin | Add candidate |
| POST | `/api/votes` | Student | Cast vote |
| GET | `/api/votes/check/:electionId` | Student | Check vote status |
| GET | `/api/results/:id` | Public | Get results according to visibility rules |
| GET | `/api/analytics/dashboard` | Admin | Dashboard stats |
| GET | `/api/analytics/audit-logs` | Admin | Audit logs |

## Deployment

### Backend

```bash
cd server
npm run build
npm start
```

### Frontend

```bash
cd client
npm run build
```

Set production environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `OTP_EXPIRY_MINUTES`
- `OTP_MAX_RETRIES`
- `OTP_SALT_ROUNDS`
- `CORS_ORIGIN`
- `COOKIE_SAME_SITE`

For production, use HTTPS, a long random `JWT_SECRET`, restricted CORS origins, secure cookie settings, database backups, and a real OTP delivery provider.

## License

MIT License - Built for academic institutions.
