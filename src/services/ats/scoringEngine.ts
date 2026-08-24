/**
 * Deterministic & Reproducible Hybrid ATS Scoring Engine
 * @license Apache-2.0
 */

import { 
  NormalizedResume, 
  ParsedJobDescription, 
  ATSScoreBreakdown, 
  KeywordGap 
} from '../../types/domain';
import { calculateCosineSimilarity } from '../semantic/semanticMatcher';
import { normalizeSkill } from '../taxonomy/skillTaxonomy';

export function calculateDeterministicATSScore(
  resume: NormalizedResume,
  jd: ParsedJobDescription
): {
  breakdown: ATSScoreBreakdown;
  gaps: KeywordGap[];
} {
  const resumeSkills = resume.skills.map(s => s.toLowerCase());
  const reqSkills = jd.requiredSkills.map(s => s.toLowerCase());
  const prefSkills = jd.preferredSkills.map(s => s.toLowerCase());

  // 1. Skill Alignment Score (30%)
  let matchedReq = 0;
  const gaps: KeywordGap[] = [];

  for (const skill of jd.requiredSkills) {
    const norm = skill.toLowerCase();
    const found = resumeSkills.some(rs => rs.includes(norm) || norm.includes(rs));
    if (found) {
      matchedReq++;
    } else {
      gaps.push({
        keyword: skill,
        normalizedCategory: 'Required Technical Skill',
        importance: 'required',
        frequencyInJob: 5,
        foundInResume: false,
        replacementSuggestion: `Incorporate '${skill}' into your Experience section with a bullet demonstrating practical usage.`
      });
    }
  }

  for (const skill of jd.preferredSkills) {
    const norm = skill.toLowerCase();
    const found = resumeSkills.some(rs => rs.includes(norm) || norm.includes(rs));
    if (!found) {
      gaps.push({
        keyword: skill,
        normalizedCategory: 'Preferred Skill',
        importance: 'preferred',
        frequencyInJob: 3,
        foundInResume: false,
        replacementSuggestion: `Add '${skill}' under your Skills or Projects section if you have experience with it.`
      });
    }
  }

  const reqScore = reqSkills.length > 0 ? (matchedReq / reqSkills.length) * 100 : 75;
  const skillAlignmentScore = Math.min(100, Math.round(reqScore));

  // 2. Semantic Job Match Score (20%)
  const semanticMatchScore = calculateCosineSimilarity(resume.rawText, jd.rawText);

  // 3. Experience Alignment Score (15%)
  let experienceScore = 70;
  if (resume.experience.length >= 2) experienceScore += 15;
  if (resume.experience.some(e => e.description.length >= 3)) experienceScore += 15;
  experienceScore = Math.min(100, experienceScore);

  // 4. Resume Structure Score (10%)
  let structureScore = 100;
  if (!resume.contact.email) structureScore -= 20;
  if (!resume.contact.phone) structureScore -= 10;
  if (resume.skills.length < 3) structureScore -= 20;
  structureScore = Math.max(40, structureScore);

  // 5. Section Completeness Score (10%)
  let completenessScore = 0;
  if (resume.summary) completenessScore += 20;
  if (resume.skills.length > 0) completenessScore += 20;
  if (resume.experience.length > 0) completenessScore += 30;
  if (resume.education.length > 0) completenessScore += 20;
  if (resume.certifications.length > 0 || resume.projects.length > 0) completenessScore += 10;

  // 6. Achievement Quality Score (10%) - Detect quantified metrics (%, $, numbers)
  const numberMatches = (resume.rawText.match(/\b\d+(?:%|\$|k|M|x)?\b/g) || []).length;
  let achievementScore = Math.min(100, Math.max(40, numberMatches * 12));

  // 7. Education Alignment Score (5%)
  let educationScore = 80;
  if (resume.education.length > 0) educationScore = 95;

  // Weighted overall ATS score formula:
  // Skill: 30%, Semantic: 20%, Exp: 15%, Structure: 10%, Completeness: 10%, Achievement: 10%, Education: 5%
  const overallScore = Math.round(
    (skillAlignmentScore * 0.30) +
    (semanticMatchScore * 0.20) +
    (experienceScore * 0.15) +
    (structureScore * 0.10) +
    (completenessScore * 0.10) +
    (achievementScore * 0.10) +
    (educationScore * 0.05)
  );

  const breakdown: ATSScoreBreakdown = {
    overallScore,
    skillAlignmentScore,
    semanticMatchScore,
    experienceAlignmentScore: experienceScore,
    resumeStructureScore: structureScore,
    sectionCompletenessScore: completenessScore,
    achievementQualityScore: achievementScore,
    educationAlignmentScore: educationScore
  };

  return {
    breakdown,
    gaps
  };
}
