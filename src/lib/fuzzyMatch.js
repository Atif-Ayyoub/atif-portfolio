// Fuzzy matching for project names with typo tolerance
// Uses Levenshtein distance to find best match

export function levenshteinDistance(str1, str2) {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0))

  for (let i = 0; i <= len1; i++) matrix[0][i] = i
  for (let j = 0; j <= len2; j++) matrix[j][0] = j

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      )
    }
  }

  return matrix[len2][len1]
}

export function fuzzyMatchProject(userText, projects) {
  const normalizedInput = userText
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '')

  const matches = projects
    .map((project) => {
      const normalizedProject = project.title
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^\w]/g, '')

      const distance = levenshteinDistance(normalizedInput, normalizedProject)
      const similarity = 1 - distance / Math.max(normalizedInput.length, normalizedProject.length)

      // Classify confidence level
      let confidence = 'low'
      if (similarity >= 0.85) confidence = 'high'
      else if (similarity >= 0.7) confidence = 'medium'

      return { project, distance, similarity, confidence }
    })
    .filter((match) => match.similarity >= 0.6) // 60% match threshold
    .sort((a, b) => b.similarity - a.similarity)

  if (matches.length > 0) {
    return { project: matches[0].project, confidence: matches[0].confidence, similarity: matches[0].similarity }
  }

  return { project: null, confidence: 'none', similarity: 0 }
}

export function detectProjectInText(text, projects) {
  // First try exact phrase match (most reliable)
  const projectNames = projects.map((p) => p.title)

  for (const projectName of projectNames) {
    const regex = new RegExp(`\\b${projectName.replace(/\s+/g, '\\s+')}\\b`, 'i')
    if (regex.test(text)) {
      return { project: projectName, confidence: 'high', source: 'exact_match' }
    }
  }

  // Then try fuzzy match for typos
  const words = text.split(/\s+/)
  for (const word of words) {
    if (word.length > 3) {
      // Only match words longer than 3 chars to avoid false positives
      const fuzzyResult = fuzzyMatchProject(word, projects)
      if (fuzzyResult.confidence === 'high') {
        return { project: fuzzyResult.project.title, confidence: 'high', source: 'word_fuzzy', similarity: fuzzyResult.similarity }
      }
      if (fuzzyResult.confidence === 'medium') {
        return { project: fuzzyResult.project.title, confidence: 'medium', source: 'word_fuzzy', similarity: fuzzyResult.similarity }
      }
    }
  }

  // Try matching full text against all projects
  const fuzzyResult = fuzzyMatchProject(text, projects)
  if (fuzzyResult.confidence === 'high') {
    return { project: fuzzyResult.project.title, confidence: 'high', source: 'full_text_fuzzy', similarity: fuzzyResult.similarity }
  }
  if (fuzzyResult.confidence === 'medium') {
    return { project: fuzzyResult.project.title, confidence: 'medium', source: 'full_text_fuzzy', similarity: fuzzyResult.similarity }
  }

  return { project: null, confidence: 'none', source: 'no_match', similarity: 0 }
}
