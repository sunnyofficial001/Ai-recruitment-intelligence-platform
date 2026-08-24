/**
 * Skill Taxonomy & Alias Normalization Engine
 * @license Apache-2.0
 */

export interface TaxonomyCategory {
  name: string;
  skills: string[];
}

export const SKILL_CATEGORIES: TaxonomyCategory[] = [
  {
    name: "Languages",
    skills: [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", 
      "Ruby", "PHP", "Swift", "Kotlin", "Scala", "SQL", "HTML5", "CSS3", "Bash", "R", "Dart"
    ]
  },
  {
    name: "Frontend Development",
    skills: [
      "React", "Next.js", "Vue.js", "Angular", "Svelte", "Redux", "Tailwind CSS", 
      "Bootstrap", "Webpack", "Vite", "GraphQL", "WebSockets", "Progressive Web Apps", "RxJS"
    ]
  },
  {
    name: "Backend & APIs",
    skills: [
      "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "ASP.NET Core", 
      "NestJS", "RESTful APIs", "gRPC", "Microservices", "Celery", "RabbitMQ", "Kafka"
    ]
  },
  {
    name: "Databases & Storage",
    skills: [
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Cassandra", 
      "Elasticsearch", "Neo4j", "Firebase", "Supabase", "SQLAlchemy", "Prisma", "pgvector"
    ]
  },
  {
    name: "Cloud & DevOps",
    skills: [
      "AWS", "Amazon Web Services", "Azure", "Google Cloud Platform", "GCP", "Docker", 
      "Kubernetes", "Terraform", "Ansible", "CI/CD", "GitHub Actions", "Jenkins", "Nginx", 
      "Linux", "Serverless", "Helm", "Prometheus", "Grafana"
    ]
  },
  {
    name: "AI & Machine Learning",
    skills: [
      "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn", 
      "NLP", "Computer Vision", "LangChain", "LlamaIndex", "LLM", "Generative AI", 
      "Pandas", "NumPy", "OpenCV", "Hugging Face", "RAG"
    ]
  },
  {
    name: "Methodologies & Tools",
    skills: [
      "Git", "GitHub", "GitLab", "Jira", "Agile", "Scrum", "TDD", "CI/CD", 
      "System Design", "Unit Testing", "E2E Testing", "Jest", "Playwright", "Cypress"
    ]
  },
  {
    name: "Soft Skills & Leadership",
    skills: [
      "Cross-functional Leadership", "Communication", "Problem Solving", 
      "Project Management", "Technical Mentorship", "Stakeholder Management", 
      "Code Review", "Strategic Planning"
    ]
  }
];

export const SKILL_ALIASES: Record<string, string> = {
  // Cloud
  "aws": "AWS",
  "amazon web services": "AWS",
  "amazon web service": "AWS",
  "gcp": "Google Cloud Platform",
  "google cloud": "Google Cloud Platform",
  "azure": "Azure",
  "k8s": "Kubernetes",
  "k8": "Kubernetes",
  "docker container": "Docker",

  // Databases
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "mongo": "MongoDB",
  "elastic search": "Elasticsearch",
  "sqllite": "SQLite",

  // Languages
  "js": "JavaScript",
  "javascript": "JavaScript",
  "ts": "TypeScript",
  "typescript": "TypeScript",
  "py": "Python",
  "python3": "Python",
  "golang": "Go",
  "cpp": "C++",
  "c sharp": "C#",
  "c#": "C#",

  // Frameworks
  "react.js": "React",
  "reactjs": "React",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "vue": "Vue.js",
  "vuejs": "Vue.js",
  "vue.js": "Vue.js",
  "node": "Node.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "expressjs": "Express",
  "express.js": "Express",
  "fast api": "FastAPI",
  "fastapi": "FastAPI",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",

  // AI/ML
  "tf": "TensorFlow",
  "tensorflow": "TensorFlow",
  "pytorch": "PyTorch",
  "torch": "PyTorch",
  "llms": "LLM",
  "genai": "Generative AI",
  "gen ai": "Generative AI"
};

/**
 * Normalizes a given skill string to standard taxonomy canonical form
 */
export function normalizeSkill(skill: string): string {
  const trimmed = skill.trim();
  const lower = trimmed.toLowerCase();
  
  if (SKILL_ALIASES[lower]) {
    return SKILL_ALIASES[lower];
  }

  // Check case-insensitive match in categories
  for (const cat of SKILL_CATEGORIES) {
    for (const canonical of cat.skills) {
      if (canonical.toLowerCase() === lower) {
        return canonical;
      }
    }
  }

  // Capitalize nicely if not found in dictionary
  return trimmed.split(' ')
    .map(w => w.length > 3 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toUpperCase())
    .join(' ');
}

/**
 * Categorize a skill into taxonomy
 */
export function categorizeSkill(skill: string): string {
  const normalized = normalizeSkill(skill);
  const lower = normalized.toLowerCase();

  for (const cat of SKILL_CATEGORIES) {
    for (const s of cat.skills) {
      if (s.toLowerCase() === lower) {
        return cat.name;
      }
    }
  }

  return "Other Technical Skills";
}

/**
 * Extract all taxonomy skills present in raw text stream
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();

  // 1. Direct taxonomy matching
  for (const cat of SKILL_CATEGORIES) {
    for (const skill of cat.skills) {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Match whole word or exact pattern boundary
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
      if (regex.test(text)) {
        foundSkills.add(skill);
      }
    }
  }

  // 2. Alias matching
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    const escaped = alias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
    if (regex.test(text)) {
      foundSkills.add(canonical);
    }
  }

  return Array.from(foundSkills);
}
