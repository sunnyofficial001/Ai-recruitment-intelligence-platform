/**
 * Vector / TF-IDF Semantic Similarity Engine
 * @license Apache-2.0
 */

/**
 * Tokenizes text into normalized word frequency vector
 */
function textToVector(text: string): Record<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return freq;
}

/**
 * Calculates Cosine Similarity between two term frequency vectors
 */
export function calculateCosineSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;

  const vecA = textToVector(textA);
  const vecB = textToVector(textB);

  const wordsA = Object.keys(vecA);
  const wordsB = Object.keys(vecB);

  const allWords = new Set([...wordsA, ...wordsB]);

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const word of allWords) {
    const valA = vecA[word] || 0;
    const valB = vecB[word] || 0;

    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  }

  if (magA === 0 || magB === 0) return 0;

  const similarity = dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
  return Math.min(100, Math.round(similarity * 100 * 1.6)); // Scaled similarity 0-100%
}
