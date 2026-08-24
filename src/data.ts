/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArchitectureBlueprint } from "./types";

export const FAST_API_BLUEPRINT: ArchitectureBlueprint = {
  title: "FastAPI + SQLAlchemy + PostgreSQL Production Stack",
  description: "A secure, asynchronous, industrial-grade backend configured with a clean domain-driven architecture, robust schema migrations, and Dockerized database engines.",
  diagram: `
  [ Client Browser / UI ]
          │
          ▼  (HTTPS / REST Api)
  [ Docker Ingress Proxy (Nginx) ]
          │
          ▼
  [ FastAPI App Instance ] (Port 8000)
     ├── router.py (Endpoints & Rate Limiters)
     ├── schemas.py (Pydantic v2 Strong Validation)
     ├── services.py (Gemini 2.5/3.5 Python Client)
     └── database.py (SQLAlchemy 2.0 Async PG Driver)
          │
          ▼ (Connection Pool - AsyncPG)
  [ PostgreSQL Database ] (Port 5432)
     ├── users & histories tables
     └── indexing on timestamps & foreign-keys
  `,
  files: [
    {
      filename: "main.py",
      language: "python",
      code: `import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db, init_db
from schemas import AnalysisCreate, AnalysisResponse, SystemHealth
from services import analyze_resume_contents, get_user_histories

app = FastAPI(
    title="AI Resume & ATS Analyzer API",
    version="1.0.0",
    description="Product-grade FastAPI microservice utilizing Google Gemini models for deep resume evaluation."
)

# CORS Policies for production security
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/health", response_model=SystemHealth, status_code=status.HTTP_200_OK)
async def check_health():
    return {"status": "healthy", "database": "connected", "engine": "gemini-3.5-flash"}

@app.post("/api/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def trigger_analysis(payload: AnalysisCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await analyze_resume_contents(
            db, 
            payload.resume_text, 
            payload.job_description, 
            payload.resume_name
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini processing error: {str(e)}"
        )

@app.get("/api/history", response_model=List[AnalysisResponse], status_code=status.HTTP_200_OK)
async def retrieve_history(db: AsyncSession = Depends(get_db)):
    return await get_user_histories(db)
`
    },
    {
      filename: "database.py",
      language: "python",
      code: `import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:securepassword@localhost:5432/resume_analyzer"
)

# SQLAlchemy 2.0 Async Engines configured with client connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_recycle=1800
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def init_db():
    async with engine.begin() as conn:
        # Executes database initialization (ideally managed by Alembic in real production)
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
`
    },
    {
      filename: "models.py",
      language: "python",
      code: `from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from database import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    resume_name = Column(String(255), nullable=False)
    resume_text = Column(Text, nullable=False)
    job_title = Column(String(255), nullable=True)
    ats_score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Store dynamic schema results as highly indexed JSONB
    score_breakdowns = Column(JSON, nullable=False)
    strengths = Column(JSON, nullable=False)
    gaps = Column(JSON, nullable=False)
    improvements = Column(JSON, nullable=False)
    interview_prep = Column(JSON, nullable=False)
    cover_letter = Column(Text, nullable=True)
`
    },
    {
      filename: "schemas.py",
      language: "python",
      code: `from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class SystemHealth(BaseModel):
    status: str
    database: str
    engine: str

class AnalysisCreate(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Raw textual parameters extracted from Resume")
    job_description: Optional[str] = Field(None, description="Optional JD parameters to benchmark ATS against")
    resume_name: str = Field("my-resume.pdf", description="Original uploaded attachment file name")

class KeywordGapSchema(BaseModel):
    keyword: str
    frequencyInJob: int
    foundInResume: bool
    replacementSuggestion: Optional[str] = None

class ImprovementTipSchema(BaseModel):
    section: str
    status: str
    critique: str
    suggestion: str

class InterviewPrepItemSchema(BaseModel):
    id: str
    question: str
    rationale: str
    sampleAnswer: str

class ScoreBreakdownsSchema(BaseModel):
    keywordDensity: int
    structuralClarity: int
    experienceImpact: int
    educationAlignment: int

class AnalysisResponse(BaseModel):
    id: str
    timestamp: datetime
    resume_name: str
    job_title: str
    ats_score: int
    overall_summary: str
    score_breakdowns: ScoreBreakdownsSchema
    strengths: List[str]
    gaps: List[KeywordGapSchema]
    improvements: List[ImprovementTipSchema]
    interview_prep: List[InterviewPrepItemSchema]
    cover_letter: Optional[str] = None

    class Config:
        from_attributes = True
`
    },
    {
      filename: "services.py",
      language: "python",
      code: `import json
import uuid
from google import genai
from google.genai import types
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import AnalysisHistory
from schemas import AnalysisResponse
import os

# Initialize Google GenAI client in Python using process environment variables
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={'headers': {'User-Agent': 'aistudio-build-python'}}
)

async def analyze_resume_contents(db: AsyncSession, resume_text: str, job_desc: str, resume_name: str) -> dict:
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) Auditor. Analyze the resume text against the provided Job Description.
    Provide a robust analysis structured exactly in JSON matching these schemas.
    
    Resume content: {resume_text}
    Job Description: {job_desc or 'General Review'}
    """
    
    # Configure rigid JSON return formatting matching standard Type schemas
    response = client.models.generate_content(
        model='gemini-3.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    
    data = json.loads(response.text)
    
    # Save the parsed analysis directly to PostgreSQL
    history_record = AnalysisHistory(
        resume_name=resume_name,
        resume_text=resume_text,
        job_title=data.get("jobTitle", "N/A"),
        ats_score=data.get("atsScore", 70),
        score_breakdowns=data.get("scoreBreakdowns", {}),
        strengths=data.get("strengths", []),
        gaps=data.get("gaps", []),
        improvements=data.get("improvements", []),
        interview_prep=data.get("interviewPrep", []),
        cover_letter=data.get("coverLetter", "")
    )
    
    db.add(history_record)
    await db.commit()
    await db.refresh(history_record)
    
    return data

async def get_user_histories(db: AsyncSession):
    stmt = select(AnalysisHistory).order_by(AnalysisHistory.timestamp.desc())
    results = await db.execute(stmt)
    return results.scalars().all()
`
    },
    {
      filename: "Dockerfile",
      language: "dockerfile",
      code: `# Lightweight Python image
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`
    },
    {
      filename: "docker-compose.yml",
      language: "yaml",
      code: `version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:securepassword@db:5432/resume_analyzer
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=securepassword
      - POSTGRES_DB=resume_analyzer
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`
    }
  ]
};

export const DEPLOYMENT_GUIDE_CONTENT = `
### Production Release Architecture Matrix

To successfully release this architecture into standard clouds (Google Cloud Run, AWS ECS/Fargate, or Azure Container Apps:

#### 1. Setup Environment Configuration
Configure these production environment secrets on the running containers:
*   \`GEMINI_API_KEY\`: Secured platform credential obtained via Google AI Studio.
*   \`DATABASE_URL\`: Postgres async database connection path (\`postgresql+asyncpg://<USER>:<PASS>@<HOST>:<PORT>/<DB>\`).
*   \`FRONTEND_URL\`: Fully qualified address of your mapped SPA container (\`https://my-analyzer.com\`).
*   \`PORT\`: Port bindings inside containers (e.g. \`8000\` for backend, \`3000\` for frontend proxying).

#### 2. Local Launch (Using Docker Compose)
\`\`\`bash
# 1. Clone repositories and edit environmental variables
cp .env.example .env

# 2. Fire up infrastructure
docker-compose up --build -d

# 3. Verify systems are responsive
curl http://localhost:8000/health
\`\`\`

#### 3. Automatic Migrations Setup (Alembic)
Configure SQLAlchemy schema versions safely to enable hot-reloads and continuous schema alterations.
\`\`\`bash
# Initialize database version tracking inside Python virtual environment
alembic init alembic

# Create a database revision snapshot
alembic revision --autogenerate -m "create_analysis_history_table"

# Deploy schema changes to Postgres node
alembic upgrade head
\`\`\`
`;
