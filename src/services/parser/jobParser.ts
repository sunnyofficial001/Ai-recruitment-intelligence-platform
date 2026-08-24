/**
 * Job Description Intelligence & Requirement Extractor
 * @license Apache-2.0
 */

import { ParsedJobDescription } from '../../types/domain';
import { extractSkillsFromText, normalizeSkill } from '../taxonomy/skillTaxonomy';

/**
 * Parses raw Job Description text into structured requirements
 */
export function parseJobDescription(rawText: string): ParsedJobDescription {
  const cleanText = rawText.replace(/\r\n/g, '\n');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract job title (usually top line)
  let title = "Target Role / Position";
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.toLowerCase().includes('position:') || firstLine.toLowerCase().includes('role:') || firstLine.toLowerCase().includes('job:')) {
      title = firstLine.replace(/^(position|role|job):\s*/i, '');
    } else if (firstLine.length < 60) {
      title = firstLine;
    }
  }

  // Extract all skills from text
  const allSkills = extractSkillsFromText(cleanText);

  // Separate required vs preferred skills
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];

  let isPreferredSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('preferred') || lower.includes('nice to have') || lower.includes('plus') || lower.includes('bonus')) {
      isPreferredSection = true;
    } else if (lower.includes('required') || lower.includes('must have') || lower.includes('qualifications') || lower.includes('requirements')) {
      isPreferredSection = false;
    }

    const lineSkills = extractSkillsFromText(line);
    if (isPreferredSection) {
      preferredSkills.push(...lineSkills);
    } else {
      requiredSkills.push(...lineSkills);
    }
  }

  // Deduplicate
  const uniqueRequired = Array.from(new Set(requiredSkills));
  const uniquePreferred = Array.from(new Set(preferredSkills)).filter(s => !uniqueRequired.includes(s));

  // If section separation didn't yield distinct sets, split 70% required / 30% preferred
  if (uniquePreferred.length === 0 && uniqueRequired.length > 3) {
    const reqCount = Math.ceil(uniqueRequired.length * 0.7);
    const req = uniqueRequired.slice(0, reqCount);
    const pref = uniqueRequired.slice(reqCount);
    return {
      rawText: cleanText,
      title,
      requiredSkills: req,
      preferredSkills: pref,
      yearsExperienceRequired: extractYearsExperience(cleanText),
      responsibilities: lines.filter(l => l.startsWith('-') || l.startsWith('•')),
      toolsAndTech: allSkills,
      softSkills: ['Communication', 'Problem Solving', 'Teamwork']
    };
  }

  return {
    rawText: cleanText,
    title,
    requiredSkills: uniqueRequired.length > 0 ? uniqueRequired : allSkills,
    preferredSkills: uniquePreferred,
    yearsExperienceRequired: extractYearsExperience(cleanText),
    responsibilities: lines.filter(l => l.startsWith('-') || l.startsWith('•')),
    toolsAndTech: allSkills,
    softSkills: ['Communication', 'Problem Solving', 'Teamwork']
  };
}

function extractYearsExperience(text: string): number {
  const match = text.match(/(\d+)\+?\s*(?:years|yrs)\b/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 3; // Default benchmark
}
