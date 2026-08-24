# Production Security & Audit Standards

## Security Architecture

### 1. Zero Credential Exposure
- No credentials, JWT secrets, database connection strings, or Gemini API keys are committed to Git.
- Environment variables are isolated via `.env` with a safe template in [`.env.example`](file:///d:/project/ai-resume-&-ats-analyzer/.env.example).

### 2. Authentication & JWT Token Security
- Passwords stored securely using `bcrypt` hashing with salt rounds.
- JWT tokens signed using `HS256` algorithm with configurable secret keys and expiration timeouts.
- Route authorization enforced via Express bearer token middleware (`verifyToken`).

### 3. File Upload & Ingestion Security
- Multipart file uploads (`/api/v1/resumes/parse-file`) restricted to validated document MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`).
- File buffers parsed in memory without persisting untrusted binary files to public disk storage.

### 4. Grounding Guard & Anti-Hallucination Controls
- Candidate evidence verification tags all AI recommendations (`SUPPORTED`, `INFERRED`, `SUGGESTED`, `UNSUPPORTED`).
- Prevents LLM generation of unverified skill claims or metric fabrications.

### 5. Audit Logging
- Structural security events (login attempts, parsing requests, database mutations) logged in the `audit_logs` SQLite table.
