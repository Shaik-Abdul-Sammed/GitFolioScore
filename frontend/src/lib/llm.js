/**
 * LLM Advisor service using window.anna.llm.complete.
 */

const SYSTEM_PROMPT =
  'You are a senior software engineer and career coach. Given a scored GitHub portfolio, produce exactly 3 prioritized actions each tied to a specific signal in the report, plus a 2-sentence shareable summary, an estimated time-to-hire in weeks (e.g. 4-12), and a list of 4-8 missing ATS keywords. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.';

const ROAST_SYSTEM_PROMPT =
  'You are a brutally honest, sarcastic senior engineer. Roast this developer\'s portfolio harshly but constructively, pointing out every missing README and dead project. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.';

const PERSONA_PROMPTS = {
  'Friendly Mentor':
    'You are an encouraging, experienced software engineering mentor. Help this developer level up their portfolio with empathetic, constructive, highly practical guidance. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.',
  'Strict FAANG Recruiter':
    'You are an elite, highly demanding FAANG staff technical recruiter. You evaluate candidates with uncompromising standards around high-scale system design, code quality, testing rigor, and documentation. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.',
  'Open Source Maintainer':
    'You are a veteran open-source maintainer. You judge portfolios by architectural clarity, reproducible build setups, explicit licensing, contribution hygiene, and clean README standards. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.',
};

/**
 * Clean and parse JSON from LLM text response.
 */
function extractJSON(rawText) {
  if (!rawText) throw new Error('Empty text response');

  // Strip possible markdown fences ```json ... ```
  let text = rawText.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  } else {
    // If no fence, find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      text = text.substring(start, end + 1);
    }
  }

  const parsed = JSON.parse(text);
  if (!parsed.summary || !Array.isArray(parsed.actions) || !parsed.shareText) {
    throw new Error('JSON response does not match expected schema');
  }

  if (typeof parsed.timeToHireWeeks !== 'number') {
    parsed.timeToHireWeeks = 6;
  }
  if (!Array.isArray(parsed.atsMissingKeywords) || parsed.atsMissingKeywords.length === 0) {
    parsed.atsMissingKeywords = ['Docker', 'CI/CD Pipelines', 'Automated Testing', 'Cloud Deployment'];
  }

  return parsed;
}

/**
 * Map Anna Host API errors to user-friendly error objects with userMessage.
 */
function handleLLMError(err) {
  const code = err.code || err.status || '';
  let userMessage = 'The AI advisor encountered an error. Please retry.';

  if (code === 'APP_QUOTA_EXCEEDED') {
    userMessage = "You're out of Anna credits. Top up in Anna settings, then retry.";
  } else if (code === 'APP_PROVIDER_ERROR') {
    userMessage = 'No AI model set up on your Anna account. Configure one in settings, then retry.';
  } else if (code === 'APP_NOT_GRANTED') {
    // eslint-disable-next-line no-console
    console.error('App configuration error: host_api.llm not granted in manifest.', err);
    userMessage = 'App configuration error. Please contact the developer.';
  } else if (code === 'APP_INVALID_REQUEST') {
    userMessage = 'Something went wrong. Please retry.';
  } else if (
    code === 'TIMEOUT' ||
    err.name === 'TimeoutError' ||
    /timeout|timed\s*out/i.test(err.message || '')
  ) {
    userMessage = 'The AI advisor timed out. Retry — your score is already computed.';
  }

  const error = new Error(userMessage);
  error.code = code || 'LLM_ERROR';
  error.userMessage = userMessage;
  error.originalError = err;
  return error;
}

/**
 * Generate career & portfolio advice using the Anna Host API LLM.
 * @param {object} report - The computed portfolio report.
 * @param {string} [targetRole] - Optional target role (e.g. "Senior Frontend Engineer").
 * @param {object} [options] - Options including roastMode: boolean.
 * @returns {Promise<{summary: string, actions: Array<{action: string, rationale: string}>, shareText: string}>}
 */
export async function generateAdvice(report, targetRole = '', options = {}) {
  if (!window.anna?.llm?.complete) {
    const error = new Error('Anna Host API (window.anna.llm.complete) is not available.');
    error.code = 'API_UNAVAILABLE';
    error.userMessage = 'Anna AI environment not detected. Please run within Anna AI OS.';
    throw error;
  }

  let activeSystemPrompt = SYSTEM_PROMPT;
  if (options?.roastMode) {
    activeSystemPrompt = ROAST_SYSTEM_PROMPT;
  } else if (options?.persona && PERSONA_PROMPTS[options.persona]) {
    activeSystemPrompt = PERSONA_PROMPTS[options.persona];
  }

  // Build condensed report payload to avoid context bloat
  const condensedReport = {
    username: report.profile?.login,
    targetRole: targetRole || 'Software Engineer',
    roastMode: !!options?.roastMode,
    overallScore: report.score,
    scoreBreakdown: report.scoreBreakdown,
    topStrengths: report.strengths?.slice(0, 4),
    topRedFlags: report.redFlags?.slice(0, 4),
    topSuggestions: report.suggestions?.slice(0, 4),
    languages: report.mostUsedLanguages?.slice(0, 5),
    topRepositories: report.topRepos?.map((r) => ({
      name: r.name,
      stars: r.stars,
      forks: r.forks,
      language: r.language,
      hasReadme: r.hasReadme,
    })),
  };

  const userPrompt = `Target Role: ${targetRole || 'Software Engineer'}\nRoast Mode: ${
    options?.roastMode ? 'ACTIVE (harsh, sarcastic, constructive)' : 'OFF'
  }\n\nPortfolio Report Data:\n${JSON.stringify(condensedReport, null, 2)}`;

  const startTime = Date.now();
  const maxTotalBudget = 45000;

  try {
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: userPrompt }],
        systemPrompt: activeSystemPrompt,
        maxTokens: 800,
        temperature: options?.roastMode ? 0.7 : 0.4,
        modelPreferences: {
          speedPriority: 0.9,
          costPriority: 0.7,
          intelligencePriority: 0.5,
        },
      },
      { timeoutMs: maxTotalBudget }
    );

    const rawText = response?.content?.text || '';
    try {
      return extractJSON(rawText);
    } catch {
      // First parse failed — retry once with remaining time budget
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(5000, maxTotalBudget - elapsed);

      const retryResponse = await window.anna.llm.complete(
        {
          messages: [
            { role: 'user', content: userPrompt },
            { role: 'assistant', content: rawText },
            {
              role: 'user',
              content:
                'Your output could not be parsed as JSON. Return ONLY the raw JSON object: {"summary":"...", "actions":[{"action":"...","rationale":"..."}], "shareText":"..."} without markdown or commentary.',
            },
          ],
          systemPrompt: activeSystemPrompt,
          maxTokens: 800,
          temperature: 0.2,
          modelPreferences: { speedPriority: 0.9, costPriority: 0.7, intelligencePriority: 0.5 },
        },
        { timeoutMs: remainingTime }
      );

      return extractJSON(retryResponse?.content?.text || '');
    }
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Generate a complete README markdown template for a specific repository.
 * @param {object} repo - The repository object { name, description, language, stars, forks }.
 * @returns {Promise<string>} - Markdown string for the generated README.
 */
export async function generateReadme(repo) {
  if (!window.anna?.llm?.complete) {
    const error = new Error('Anna Host API (window.anna.llm.complete) is not available.');
    error.code = 'API_UNAVAILABLE';
    error.userMessage = 'Anna AI environment not detected. Please run within Anna AI OS.';
    throw error;
  }

  const prompt = `Write a production-ready, beautiful GitHub README.md for this repository:
- Repository Name: ${repo.name}
- Primary Language: ${repo.language || 'JavaScript/TypeScript'}
- Description: ${repo.description || 'Modern open-source development project.'}
- Stars: ${repo.stars ?? 0}, Forks: ${repo.forks ?? 0}

Include:
1. Title & dynamic status badges (Build, License, Version, Tech)
2. Project Overview & Key Value Proposition
3. Core Features with clear bullet points
4. Architecture & Tech Stack overview
5. Getting Started (Prerequisites, Clone, Install, Run)
6. Environment Variables & Configuration
7. Testing & Linting
8. Contributing & License

Format cleanly in GitHub Flavored Markdown.`;

  try {
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt:
          'You are a staff open-source engineer and technical writer. Generate a comprehensive, beautiful GitHub README.md in markdown format.',
        maxTokens: 1200,
        temperature: 0.5,
      },
      { timeoutMs: 30000 }
    );
    return response?.content?.text || '# ' + repo.name + '\n\n' + (repo.description || '');
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Match portfolio against a pasted Job Description.
 */
export async function matchJobDescription(report, jdText) {
  if (!window.anna?.llm?.complete) {
    const error = new Error('Anna Host API (window.anna.llm.complete) is not available.');
    error.code = 'API_UNAVAILABLE';
    throw error;
  }

  const prompt = `Candidate Portfolio Data:
- Top Languages: ${JSON.stringify(report.mostUsedLanguages?.slice(0, 5) || [])}
- Top Repositories: ${JSON.stringify(report.topRepos?.map((r) => ({ name: r.name, desc: r.description, lang: r.language })) || [])}
- Portfolio Score: ${report.score}

Job Description:
"""
${(jdText || '').slice(0, 2500)}
"""

Evaluate how well the candidate matches this Job Description.
Return ONLY valid JSON:
{
  "matchPercentage": 78,
  "matchingSkills": ["React", "JavaScript", "REST APIs", "Git"],
  "missingSkills": ["Kubernetes", "AWS", "GraphQL"],
  "verdict": "Strong match on frontend fundamentals and state management, but requires cloud deployment and containerization artifacts to meet senior requirements."
}`;

  try {
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt:
          'You are an AI Technical Hiring Evaluator and ATS Matcher. Analyze job descriptions against developer GitHub portfolios and output only valid JSON.',
        maxTokens: 800,
        temperature: 0.3,
      },
      { timeoutMs: 35000 }
    );
    const text = response?.content?.text || '';
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = fenceMatch ? fenceMatch[1].trim() : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(cleaned);
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Generate a high-converting, professional 160-character GitHub bio.
 */
export async function generateBio(profile, topRepos = [], languages = []) {
  if (!window.anna?.llm?.complete) {
    const error = new Error('Anna Host API (window.anna.llm.complete) is not available.');
    error.code = 'API_UNAVAILABLE';
    throw error;
  }

  const prompt = `Write a catchy, modern, professional GitHub bio (strictly MAXIMUM 160 characters) for developer @${profile?.login || 'dev'}:
- Primary Languages: ${languages.slice(0, 3).map((l) => l.lang || l.name || '').join(', ') || 'TypeScript, React'}
- Flagship Projects: ${topRepos.slice(0, 2).map((r) => r.name).join(', ') || 'open-source tools'}
- Current Bio: "${profile?.bio || 'Building software'}"

Return ONLY the plain bio text (max 160 characters). Do not include quotes or surrounding formatting.`;

  try {
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt:
          'You are a developer branding specialist. Craft a memorable, executive 160-character GitHub profile bio.',
        maxTokens: 100,
        temperature: 0.7,
      },
      { timeoutMs: 20000 }
    );
    let bio = (response?.content?.text || '').trim().replace(/^["']|["']$/g, '');
    if (bio.length > 160) bio = bio.substring(0, 157) + '...';
    return bio;
  } catch (err) {
    throw handleLLMError(err);
  }
}
