/**
 * Prompt Registry & Structured AI Reasoning Service
 * @license Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { 
  NormalizedResume, 
  ParsedJobDescription, 
  ATSScoreBreakdown, 
  KeywordGap, 
  ImprovementTip, 
  InterviewPrepItem 
} from '../../types/domain';
import { sanitizeAndGuardImprovements } from './groundingGuard';

export const PROMPT_VERSION = "v1.2.0";
export const MODEL_VERSION = "gemini-3.5-flash";

let aiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'recruitment-intelligence-platform' } }
    });
  }
  return aiClient;
}

export interface AIReasoningOutput {
  overallSummary: string;
  strengths: string[];
  improvements: ImprovementTip[];
  interviewPrep: InterviewPrepItem[];
  coverLetter: string;
}

export async function generateAIReasoning(
  resume: NormalizedResume,
  jd: ParsedJobDescription,
  atsBreakdown: ATSScoreBreakdown,
  gaps: KeywordGap[]
): Promise<AIReasoningOutput> {
  const ai = getGenAIClient();

  // High quality fallback if API key is not provisioned or offline
  if (!ai) {
    return generateLocalFallbackReasoning(resume, jd, atsBreakdown, gaps);
  }

  const systemInstruction = `You are a Principal Technical Recruiter and ATS Optimization Expert.
Your task is to analyze candidate resume data against a target job description and provide evidence-grounded insights.
You are given a deterministic ATS score of ${atsBreakdown.overallScore}/100.
Do NOT invent fake metric numbers, fake companies, or fake degrees.
Ground all strengths, interview prep, and cover letter in the candidate's actual provided experience bullets.

Respond strictly in valid JSON matching the specified schema format.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      overallSummary: { type: Type.STRING, description: "Professional high-level recruiter summary of match alignment." },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 3-5 solid competitive strengths supported by resume evidence."
      },
      improvements: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING },
            status: { type: Type.STRING, description: "critical, warning, or optimal" },
            critique: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["section", "status", "critique", "suggestion"]
        }
      },
      interviewPrep: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            question: { type: Type.STRING },
            rationale: { type: Type.STRING },
            sampleAnswer: { type: Type.STRING },
            resumeEvidenceUsed: { type: Type.STRING }
          },
          required: ["id", "category", "question", "rationale", "sampleAnswer", "resumeEvidenceUsed"]
        }
      },
      coverLetter: { type: Type.STRING, description: "Professional cover letter template tailored strictly to user's real skills." }
    },
    required: ["overallSummary", "strengths", "improvements", "interviewPrep", "coverLetter"]
  };

  const promptContent = `
Candidate Resume Content:
${resume.rawText}

Target Job Description:
${jd.rawText}

Deterministic ATS Score Breakdown:
Overall: ${atsBreakdown.overallScore}%
Skill Alignment: ${atsBreakdown.skillAlignmentScore}%
Semantic Alignment: ${atsBreakdown.semanticMatchScore}%
Experience Alignment: ${atsBreakdown.experienceAlignmentScore}%
Missing Skills: ${gaps.map(g => g.keyword).join(', ')}
`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_VERSION,
      contents: promptContent,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.15
      }
    });

    if (!result.text) {
      throw new Error("Empty text block returned from AI provider.");
    }

    const parsed = JSON.parse(result.text.trim());
    const guardedImprovements = sanitizeAndGuardImprovements(parsed.improvements || [], resume.rawText);

    return {
      overallSummary: parsed.overallSummary || "Candidate shows alignment with target requirements.",
      strengths: parsed.strengths || ["Strong technical background"],
      improvements: guardedImprovements,
      interviewPrep: (parsed.interviewPrep || []).map((item: any, idx: number) => ({
        ...item,
        id: item.id || `prep_${Date.now()}_${idx}`,
        category: item.category || 'Technical'
      })),
      coverLetter: parsed.coverLetter || "Cover letter draft based on candidate experience."
    };
  } catch (err: any) {
    console.warn("AI generation failed or key missing, falling back to deterministic reasoning generator:", err.message);
    return generateLocalFallbackReasoning(resume, jd, atsBreakdown, gaps);
  }
}

/**
 * Deterministic fallback generator when offline or API key not present
 */
export function generateLocalFallbackReasoning(
  resume: NormalizedResume,
  jd: ParsedJobDescription,
  atsBreakdown: ATSScoreBreakdown,
  gaps: KeywordGap[]
): AIReasoningOutput {
  const missingSkillsStr = gaps.map(g => g.keyword).slice(0, 3).join(', ') || 'None';

  return {
    overallSummary: `Candidate demonstrates a ${atsBreakdown.overallScore}% overall ATS match for ${jd.title}. Key technical strengths include ${resume.skills.slice(0, 4).join(', ') || 'technical proficiency'}. Priority areas for improvement include addressing gaps in ${missingSkillsStr}.`,
    strengths: [
      `Demonstrated experience with key tools: ${resume.skills.slice(0, 3).join(', ') || 'core frameworks'}`,
      `Structured experience bullets with documented accomplishments`,
      `Complete section layout including education and skills sections`
    ],
    improvements: [
      {
        section: "Skills Section",
        status: gaps.length > 2 ? "critical" : "warning",
        critique: `Missing ${gaps.length} target job keywords: ${missingSkillsStr}.`,
        suggestion: `Explicitly add missing keywords (${missingSkillsStr}) into your Skills list if you possess experience with them.`,
        grounding: "SUPPORTED"
      },
      {
        section: "Experience Section",
        status: atsBreakdown.achievementQualityScore < 70 ? "warning" : "optimal",
        critique: "Impact statements can be strengthened by adding quantifiable outcomes where available.",
        suggestion: "Add measurable numbers or scale indicators to your project bullets if substantiated by your actual work.",
        grounding: "SUGGESTED"
      }
    ],
    interviewPrep: [
      {
        id: "prep_1",
        category: "Technical",
        question: `How have you applied ${resume.skills[0] || 'core technologies'} in your previous projects to solve complex challenges?`,
        rationale: "Assesses technical depth and hands-on application of key tools listed on your resume.",
        sampleAnswer: `In my experience with ${resume.skills[0] || 'software development'}, I focused on building reliable solutions by breaking down system components and validating outcomes with automated testing.`,
        resumeEvidenceUsed: `Resume Skills: ${resume.skills[0] || 'Technical skills'}`
      },
      {
        id: "prep_2",
        category: "Behavioral",
        question: "Describe a project where you had to adapt quickly to new requirements or missing technologies.",
        rationale: "Evaluates adaptability, problem solving, and ability to handle technical gaps.",
        sampleAnswer: "Situation: Faced tight deadline with evolving specifications. Task: Identified core requirements and prioritized critical paths. Action: Communicated proactively with stakeholders and implemented modular components. Result: Delivered on schedule.",
        resumeEvidenceUsed: `Experience at ${resume.experience[0]?.company || 'prior role'}`
      }
    ],
    coverLetter: `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${jd.title} position. With my background in ${resume.skills.slice(0, 3).join(', ')} and my experience at ${resume.experience[0]?.company || 'technology organizations'}, I am confident in my ability to contribute effectively to your team.\n\nMy experience includes building scalable solutions and delivering high-quality technical outcomes. I would welcome the opportunity to discuss how my skills align with your goals.\n\nSincerely,\n${resume.contact.name || 'Applicant'}`
  };
}
