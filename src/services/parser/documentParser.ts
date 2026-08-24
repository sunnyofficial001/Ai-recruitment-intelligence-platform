/**
 * Document Ingestion Pipeline & Resume Normalization Engine
 * @license Apache-2.0
 */

import { createRequire } from 'module';
import mammoth from 'mammoth';
import { 
  NormalizedResume, 
  ContactInfo, 
  WorkExperience, 
  EducationItem, 
  ProjectItem 
} from '../../types/domain';
import { extractSkillsFromText } from '../taxonomy/skillTaxonomy';

const require = createRequire(import.meta.url);

export interface ExtractedDocument {
  rawText: string;
  fileType: 'pdf' | 'docx' | 'txt';
  pageCount?: number;
  wordCount: number;
}

/**
 * Pure fallback PDF text extractor that parses text objects from raw PDF buffer
 */
function fallbackExtractPdfText(buffer: Buffer): string {
  const str = buffer.toString('binary');
  const textBlocks: string[] = [];
  
  // Extract text strings inside BT (Begin Text) ... ET (End Text) blocks
  const btRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;
  
  while ((match = btRegex.exec(str)) !== null) {
    const block = match[0];
    // Extract literal strings inside (text) or hex strings inside <hex>
    const strRegex = /\((.*?)\)|<([0-9a-fA-F]+)>/g;
    let strMatch: RegExpExecArray | null;
    while ((strMatch = strRegex.exec(block)) !== null) {
      if (strMatch[1]) {
        textBlocks.push(strMatch[1]);
      } else if (strMatch[2]) {
        try {
          const hex = strMatch[2];
          let decoded = '';
          for (let i = 0; i < hex.length; i += 2) {
            decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }
          textBlocks.push(decoded);
        } catch (e) {}
      }
    }
  }

  const result = textBlocks.join(' ').replace(/\\\(|\x5C\)/g, '').replace(/\s+/g, ' ').trim();
  return result.length > 30 ? result : str.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Robustly parses PDF buffer using native CJS module loader with fail-safe fallback
 */
async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    const pdfParse = require('pdf-parse');
    const fn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default || pdfParse;
    if (typeof fn === 'function') {
      const data = await fn(buffer);
      if (data && data.text && data.text.trim().length > 10) {
        return { text: data.text.replace(/\r\n/g, '\n'), pageCount: data.numpages || 1 };
      }
    }
  } catch (err) {
    console.warn('CJS pdf-parse loading fallback triggered:', err);
  }

  // Fail-safe pure JS PDF text parser
  const text = fallbackExtractPdfText(buffer);
  return { text, pageCount: 1 };
}

/**
 * Parses binary buffer or text stream into clean raw string content
 */
export async function parseDocumentBuffer(
  buffer: Buffer, 
  mimeType: string, 
  filename: string
): Promise<ExtractedDocument> {
  const lowerName = filename.toLowerCase();

  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      const data = await extractTextFromPDF(buffer);
      const text = (data.text || '').replace(/\r\n/g, '\n');
      return {
        rawText: text,
        fileType: 'pdf',
        pageCount: data.pageCount || 1,
        wordCount: text.split(/\s+/).filter(Boolean).length
      };
    } catch (err: any) {
      throw new Error(`Failed to parse PDF document (${filename}): ${err.message}`);
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    mimeType === 'application/msword' || 
    lowerName.endsWith('.docx') || 
    lowerName.endsWith('.doc')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || '').replace(/\r\n/g, '\n');
      return {
        rawText: text,
        fileType: 'docx',
        wordCount: text.split(/\s+/).filter(Boolean).length
      };
    } catch (err: any) {
      throw new Error(`Failed to parse Word document (${filename}): ${err.message}`);
    }
  }

  // Fallback to UTF-8 plain text processing
  const text = buffer.toString('utf-8').replace(/\r\n/g, '\n');
  return {
    rawText: text,
    fileType: 'txt',
    wordCount: text.split(/\s+/).filter(Boolean).length
  };
}

/**
 * Extracts contact information (email, phone, location, links) from raw resume text
 */
export function extractContactInfo(text: string): ContactInfo {
  const contact: ContactInfo = {};

  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  if (emailMatch) contact.email = emailMatch[1];

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) contact.phone = phoneMatch[0];

  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) contact.linkedin = linkedinMatch[0];

  const githubMatch = text.match(/(?:github\.com\/|github:\s*)([a-zA-Z0-9_-]+)/i);
  if (githubMatch) contact.github = githubMatch[0];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.toLowerCase().includes('resume')) {
      contact.name = firstLine;
    }
  }

  return contact;
}

/**
 * Normalizes raw text into standard canonical NormalizedResume JSON structure
 */
export function normalizeResumeText(rawText: string): NormalizedResume {
  const cleanText = (rawText || '').replace(/\r\n/g, '\n');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  const contact = extractContactInfo(cleanText);
  const skills = extractSkillsFromText(cleanText);

  let currentSection = 'summary';
  const sections: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: []
  };

  const sectionHeaderRegex = /^(summary|professional summary|work experience|experience|employment|education|academic background|projects|personal projects|technical skills|skills|certifications|achievements|honors|languages)$/i;

  for (const line of lines) {
    if (sectionHeaderRegex.test(line)) {
      const lower = line.toLowerCase();
      if (lower.includes('experience') || lower.includes('employment')) {
        currentSection = 'experience';
      } else if (lower.includes('education') || lower.includes('academic')) {
        currentSection = 'education';
      } else if (lower.includes('project')) {
        currentSection = 'projects';
      } else if (lower.includes('skill')) {
        currentSection = 'skills';
      } else if (lower.includes('certification')) {
        currentSection = 'certifications';
      } else if (lower.includes('achievement') || lower.includes('honor')) {
        currentSection = 'achievements';
      } else {
        currentSection = 'summary';
      }
      continue;
    }

    if (sections[currentSection]) {
      sections[currentSection].push(line);
    }
  }

  const experience: WorkExperience[] = [];
  const expLines = sections.experience;
  let currentExp: Partial<WorkExperience> | null = null;

  for (const line of expLines) {
    if (line.includes('|') || line.includes(' - ') || /\b(20\d{2}|19\d{2})\b/.test(line)) {
      if (currentExp && currentExp.company) {
        experience.push(currentExp as WorkExperience);
      }
      const parts = line.split(/[-|]/).map(p => p.trim());
      currentExp = {
        role: parts[0] || 'Software Engineer',
        company: parts[1] || 'Technology Company',
        startDate: parts[2] || '',
        description: [],
        skillsMentioned: extractSkillsFromText(line)
      };
    } else if (currentExp) {
      currentExp.description?.push(line);
      const lineSkills = extractSkillsFromText(line);
      currentExp.skillsMentioned = Array.from(new Set([...(currentExp.skillsMentioned || []), ...lineSkills]));
    }
  }
  if (currentExp && currentExp.company) {
    experience.push(currentExp as WorkExperience);
  }

  const education: EducationItem[] = [];
  for (const line of sections.education) {
    if (line.toLowerCase().includes('bachelor') || line.toLowerCase().includes('master') || line.toLowerCase().includes('b.s.') || line.toLowerCase().includes('m.s.') || line.toLowerCase().includes('degree')) {
      education.push({
        institution: 'University / Institute',
        degree: line
      });
    }
  }

  return {
    rawText: cleanText,
    contact,
    summary: sections.summary.join(' ').slice(0, 500) || 'Experienced professional with technical skills.',
    skills,
    experience: experience.length > 0 ? experience : [
      {
        company: 'General Experience',
        role: 'Professional Contributor',
        description: expLines,
        skillsMentioned: skills
      }
    ],
    education: education.length > 0 ? education : [
      {
        institution: 'Higher Education Institution',
        degree: sections.education.join(' ') || 'Degree in Related Field'
      }
    ],
    projects: sections.projects.map(p => ({ name: 'Project', description: p, technologies: extractSkillsFromText(p) })),
    certifications: sections.certifications,
    achievements: sections.achievements,
    languages: ['English']
  };
}
