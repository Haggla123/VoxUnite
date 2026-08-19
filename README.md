# VoxUnite

### Secure University Digital Voting Platform

VoxUnite is a web-based university digital voting platform designed
to support secure election management, voter authentication, ballot
integrity, and privacy-aware voting workflows.

The project explores how authentication, authorization, vote
integrity, and election-management mechanisms can be combined in a
modern full-stack voting system.

---

## Project Overview

University elections can involve large numbers of students, multiple
candidates, different voting positions, and administrative processes
that are difficult to manage manually.

VoxUnite provides a centralized platform for:

- Voter authentication and verification
- Election creation and management
- Candidate management
- Secure vote submission
- Double-vote prevention
- Election monitoring
- Audit logging
- Election analytics

The system is designed as an academic project for exploring secure
software and digital voting workflows.

---

##  Key Features

### Student Voting

- Student authentication using Student ID and email
- OTP-based verification
- Election and candidate viewing
- Manifesto viewing
- Secure vote submission
- Vote confirmation/receipt
- Mobile-responsive voting interface
- Prevention of repeated voting

### Administration

- Administrator authentication
- Voter import using CSV/XLSX
- Candidate management
- Election creation and management
- Election lifecycle management
- Election activation and closure
- Searchable audit logs
- Election analytics

### Election Monitoring

- Real-time election activity
- Faculty participation statistics
- Turnout monitoring
- Countdown timer
- Participation leaderboard
- Socket.io-based updates

---

##  Security & Privacy

VoxUnite incorporates several mechanisms intended to protect the
integrity of the voting process.

### Authentication

Student authentication uses:

1. Student identification
2. Email verification
3. One-time password (OTP)
4. JWT-based authenticated session

OTP verification includes an expiry period and retry limitations.

### Authorization

Role-based access control separates administrative functionality
from student voting functionality.

Protected API routes use authentication and authorization middleware
to restrict access according to the user's role.

### Double-Vote Prevention

The system implements multiple layers of protection against repeated
voting:

- Client/session-level controls
- Backend validation
- Database-level uniqueness constraints

This layered approach is intended to reduce the possibility of a
student submitting more than one ballot for the same election.

### Vote Immutability

After a vote is submitted, the system does not provide a normal
workflow for editing or deleting the submitted ballot.

This is intended to preserve ballot integrity after submission.

### Audit Logging

Administrative and system activities are recorded through an audit
logging mechanism.

Audit records can be reviewed by authorized administrators to support
system monitoring and accountability.

### Privacy Considerations

The voting workflow is designed to reduce direct association between
voter authentication and ballot content.

However, anonymity in a real-world election system is a complex
security and privacy property that requires formal analysis and
additional controls beyond the mechanisms implemented in this
academic project.

---

##  System Architecture

VoxUnite uses a client-server architecture consisting of a React
frontend, Node.js/Express backend, and MongoDB database.


┌─────────────────────────────────────────────────────┐
│                     USERS                           │
│                                                     │
│       Students                  Administrators      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                 REACT FRONTEND                      │
│                                                     │
│  Authentication │ Voting │ Elections │ Analytics    │
└──────────────────────┬──────────────────────────────┘
                       │
                  REST API / HTTP
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              NODE.JS / EXPRESS                      │
│                                                     │
│ Routes │ Middleware │ Services │ Validation         │
│ Authentication │ Authorization │ Audit Logging      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                    MONGODB                          │
│                                                     │
│ Users │ Elections │ Candidates │ Votes │ Audit Logs │
└─────────────────────────────────────────────────────┘

             Socket.io Real-Time Updates

## Technology Stack
Frontend
React 18
TypeScript
Vite
Tailwind CSS
Framer Motion
Backend
Node.js
Express.js
TypeScript
Database
MongoDB
Mongoose
Authentication & Security
JSON Web Tokens (JWT)
OTP verification
Role-based access control
Database constraints
Real-Time Communication
Socket.io
Data Visualization
Recharts

## User Roles
## Student
Students can:
Authenticate and verify their identity
View active elections
Review candidates and manifestos
Cast their vote
Receive vote confirmation
Monitor available election information
Administrator

## Administrators can:
Manage voters
Manage candidates
Create elections
Activate and close elections
Monitor election activity
View analytics
Review audit logs

## Project Structure
VoxUnite/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── lib/
│   └── index.html
│
├── server/
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── index.ts
│       └── seed.ts
│
└── README.md

## Demo Environment
The project includes seeded accounts and sample election data for
local development and demonstration purposes.

Important: Demo credentials are intended exclusively for the
local/demo environment. Do not reuse these credentials in a
production environment.

## Demo Administrator
Email: admin@university.edu
Password: Admin@VoxUnite2024

The seed process also creates sample voters, candidates, faculties,
and election data.

## Getting Started
Prerequisites
Node.js 18+
MongoDB running locally or a MongoDB Atlas connection
npm
1. Clone the repository
git clone https://github.com/Haggla123/VoxUnite.git
cd VoxUnite
2. Install backend dependencies
cd server
npm install
3. Install frontend dependencies
cd ../client
npm install --legacy-peer-deps
4. Configure environment variables

## Create:
server/.env

## Configure the required environment variables for your local
environment.
Example:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/voxunite
JWT_SECRET=your_local_secret
CORS_ORIGIN=http://localhost:5173

For production deployments, use strong secrets and secure
configuration management.

Never commit .env files or real credentials to GitHub.

5. Seed demo data
cd server
npm run seed
6. Start the backend
npm run dev
7. Start the frontend

Open another terminal:

cd client
npm run dev

The application should then be available at:
http://localhost:5173

## API Overview
Method	Endpoint	Access	Description
POST	/api/admin/login	Public	Administrator login
POST	/api/auth/request-otp	Public	Request student OTP
POST	/api/auth/verify-otp	Public	Verify student OTP
GET	/api/elections	Public	List elections
POST	/api/elections	Admin	Create election
POST	/api/elections/:id/activate	Admin	Activate election
POST	/api/elections/:id/close	Admin	Close election
POST	/api/voters/upload	Admin	Import voters
POST	/api/candidates	Admin	Add candidate
POST	/api/votes	Student	Cast vote
GET	/api/results/:id	Public	Retrieve election results
GET	/api/analytics/dashboard	Admin	Dashboard analytics
GET	/api/analytics/audit-logs	Admin	Retrieve audit logs

## Screenshots

### Authentication

![VoxUnite Login](screenshots/login.png)

### OTP Verification

![OTP Verification](screenshots/otp-verification.png)

### Student Dashboard

![Student Dashboard](screenshots/student-dashboard.png)

### Voting

![Voting Interface](screenshots/voting.png)

### Administrator Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### Election Results

![Election Results](screenshots/results.png)

## Future Improvements

Potential future improvements include:
Formal security testing and penetration testing
Stronger privacy-preserving ballot mechanisms
Independent verification of election results
Enhanced audit integrity
More comprehensive automated testing
Improved accessibility
Expanded election analytics
Stronger production deployment controls

## Project Limitations

VoxUnite is an academic software project and should not be treated as
a production election infrastructure without further security
analysis, testing, auditing, and independent review.

Election security involves requirements that extend beyond
application-level authentication and database controls.

## Academic & Research Relevance

VoxUnite provides a practical foundation for exploring topics
including:
Software security
Authentication and authorization
Privacy-preserving systems
Secure database design
Digital voting systems
Access control
Auditability

## Security of web applications

The project can also serve as a basis for further investigation into
the relationship between claimed privacy properties and the
information that may remain observable through system behaviour.

## Author

Haggla Mensah Agyei
BSc Information Technology
University of Energy and Natural Resources (UENR), Ghana

GitHub: https://github.com/Haggla123
Portfolio: https://haggla.vercel.app
LinkedIn: https://www.linkedin.com/in/haggla
Email: hagglaagyei@gmail.com


## License

MIT License

### One important decision I made

I **didn't call VoxUnite "enterprise-level" or "production-grade."** The current README does make those claims, but the safer academic presentation is to describe the mechanisms you implemented and explicitly acknowledge that a real election deployment would require independent security testing and further analysis. :contentReference[oaicite:2]{index=2}

I also preserved the technical details currently documented in the repository—JWT, OTP, role-based access, layered double-vote prevention, audit logging, Socket.io, MongoDB, and the documented API structure. :contentReference[oaicite:3]{index=3}

**Don't add anything else yet.** Replace the README with the block above, preview it, and tell me when it's done. Then we'll handle the screenshots and architecture diagram for VoxUnite.
