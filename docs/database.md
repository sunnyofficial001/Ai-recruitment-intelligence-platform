# Relational Database Schema & Persistence

## Entities & Tables

### 1. `users`
- `id` (TEXT, PK): Unique user identifier
- `email` (TEXT, UNIQUE): Account email
- `password_hash` (TEXT): Bcrypt hashed password
- `name` (TEXT): User full name
- `role` (TEXT): Role (`user` or `admin`)
- `created_at` (TEXT): ISO timestamp

### 2. `resumes`
- `id` (TEXT, PK): Resume identifier
- `user_id` (TEXT, FK): User owner
- `name` (TEXT): File name
- `file_type` (TEXT): Ingestion type (`pdf`, `docx`, `txt`)
- `raw_text` (TEXT): Ingested raw content
- `normalized_json` (TEXT): Canonical JSON representation

### 3. `analyses`
- `id` (TEXT, PK): Analysis scan ID
- `user_id` (TEXT, FK): User ID
- `resume_name` (TEXT): Target resume
- `job_title` (TEXT): Benchmark role
- `ats_score` (INTEGER): Deterministic ATS score (0-100)
- `result_json` (TEXT): Complete analysis payload

### 4. `applications`
- `id` (TEXT, PK): Application ID
- `user_id` (TEXT, FK): User ID
- `company` (TEXT): Company name
- `role` (TEXT): Applied role
- `status` (TEXT): Status (`Saved`, `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`, `Withdrawn`)
- `ats_score` (INTEGER): Match fit percentage

### 5. `audit_logs`
- `id` (TEXT, PK): Audit event ID
- `user_id` (TEXT): Actor user ID
- `event` (TEXT): Action event name
- `request_id` (TEXT): HTTP request ID
- `details` (TEXT): Event metadata JSON
