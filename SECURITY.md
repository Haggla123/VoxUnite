# Security Policy

## Supported Versions

Security updates are applied to the current `main` branch unless a maintained release branch is documented separately.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately to the project maintainers instead of opening a public issue. Include:

- A description of the issue and affected area
- Steps to reproduce or a proof of concept
- Expected impact
- Any relevant logs, screenshots, or request examples

Maintainers should acknowledge reports promptly, investigate privately, and publish a fix or mitigation before public disclosure.

## Current Security Model

### Threat Model

VoxUnite is designed for authenticated campus election workflows where administrators manage elections and voter lists, and eligible students verify their identity with an OTP before voting. The current controls focus on reducing exposure from browser token theft, weak OTP storage, unauthenticated real-time clients, duplicate vote submission, and unauthorized administrative access.

The model assumes the application is deployed over HTTPS, `JWT_SECRET` is kept private, MongoDB access is restricted, administrator accounts are trusted institutional accounts, and the OTP delivery channel is controlled by the institution.

### Implemented Controls

- JWT sessions are issued by the API as `HttpOnly` cookies, not stored in browser `localStorage`.
- Admin and student sessions use separate cookies. Logging in clears any existing session for the other role.
- Logout endpoints clear both session cookies.
- Cookies default to `SameSite=Lax`. Use `COOKIE_SAME_SITE=none` only for HTTPS cross-site deployments.
- Student OTPs are generated with Node's cryptographically secure random number generator, hashed with bcrypt before storage, expire through MongoDB TTL indexes, and enforce retry limits.
- Socket.io connections require a valid admin or student session cookie during the handshake, and election room join requests are rejected when no authenticated socket user is present.
- Vote submission requires an authenticated student session and performs eligibility, election status, and duplicate-vote checks.
- Administrative APIs require an authenticated admin session, with additional role checks for privileged actions.

### Known Limitations

- Demo OTP delivery returns `demoOtp` in the API response so local testers can complete the flow. Production deployments should remove this behavior and send OTPs through a trusted email or SMS provider.
- Vote records currently retain voter-linked fields for duplicate-vote prevention and auditability, so the system should not be described as anonymous voting.
- The application-level duplicate-vote checks reduce accidental and basic repeat submissions, but stronger transactional guarantees should be used for high-contention production elections.
- Cookie-based JWT sessions are stateless; logout clears browser cookies but does not revoke an already issued token server-side before expiration.
- Public result and turnout endpoints may reveal aggregate election activity according to current visibility rules.
- The current implementation does not include CSRF tokens. `SameSite=Lax` reduces common cross-site form attacks, but sensitive deployments should add explicit CSRF protection.

## Deployment Checklist

- Use HTTPS in production.
- Set a long, random `JWT_SECRET`; do not reuse demo secrets.
- Restrict `CORS_ORIGIN` to the deployed frontend origin.
- Use a production email/SMS provider for OTP delivery and remove demo OTP exposure.
- Keep MongoDB credentials and backups protected.
- Rotate credentials after suspected compromise.
- Review audit logs for unusual authentication, admin, and voting activity.

## Future Security Improvements

- Add server-side session revocation or short-lived access tokens with refresh-token rotation.
- Add CSRF tokens for state-changing endpoints.
- Move OTP delivery to an institutional provider and remove demo OTP responses outside local development.
- Add rate limits to login, OTP request, OTP verification, vote submission, and Socket.io connection attempts.
- Use MongoDB transactions for vote creation, voter history updates, candidate counts, and election totals.
- Add structured security tests for authentication, cookie behavior, OTP retries, socket handshakes, and duplicate-vote prevention.
