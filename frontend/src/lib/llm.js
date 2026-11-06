/**
 * LLM Advisor service using window.anna.llm.complete.
 */

const SYSTEM_PROMPT =
  'You are an elite joint panel of 3 senior tech leaders evaluating a candidate: 1) A FAANG Hiring Manager (evaluating high-scale impact & architecture), 2) A Staff Software Engineer (evaluating code complexity, missing tests, and technical debt deductions), and 3) A Tech Recruiter (assessing ATS match and hiring readiness). Given a scored GitHub portfolio, produce exactly 3 prioritized actions each tied to a specific signal in the report, plus a 2-sentence shareable summary, an estimated time-to-hire in weeks (e.g. 4-12), a list of 4-8 missing ATS keywords, a predictive career trajectory, and a code complexity analysis with point deductions for missing descriptions/tests. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[], careerTrajectory?: string, codeComplexity?: {deduction: number, explanation: string}}.';

const ROAST_SYSTEM_PROMPT =
  'You are a brutally honest, sarcastic senior engineer. Roast this developer\'s portfolio harshly but constructively, pointing out every missing README and dead project. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.';

const PERSONA_PROMPTS = {
  'Friendly Mentor':
    'You are an encouraging, experienced software engineering mentor. Help this developer level up their portfolio with empathetic, constructive, highly practical guidance. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.',
  'Strict FAANG Recruiter':
    'You are an elite, highly demanding FAANG staff technical recruiter. You evaluate candidates with uncompromising standards around high-scale system design, code quality, testing rigor, and documentation. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.',
  'Open Source Maintainer':
    'You are a veteran open-source maintainer. You judge portfolios by architectural clarity, reproducible build setups, explicit licensing, contribution hygiene, and clean README standards. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.',
  'Tough FAANG Hiring Manager':
    'You are a tough FAANG Hiring Manager conducting a harsh technical review. Simulate grilling the candidate on their repo choices, missing tests, poor documentation, and lack of system design. Be brutally honest but constructive. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText, timeToHireWeeks: number, atsMissingKeywords: string[]}.',
};

export { PERSONA_PROMPTS };

/**
 * Wait for the Anna Host API bridge (window.anna.llm.complete) to be injected.
 * Checks every 200ms until available or timeoutMs (default 15000) is exceeded.
 * @param {number} [timeoutMs=15000]
 * @returns {Promise<object>} The window.anna object
 */
export async function waitForAnna(timeoutMs = 15000) {
  // eslint-disable-next-line no-console
  console.log('[Anna Bridge] Waiting for window.anna...');

  if (typeof window === 'undefined') {
    const error = new Error('Anna Host API (window.anna.llm.complete) is not available.');
    error.code = 'API_UNAVAILABLE';
    error.userMessage = 'Anna AI environment not detected. Please run within Anna AI OS.';
    throw error;
  }

  const checkAnna = () => {
    // 4. Iframe Parent Check: fallback to window.parent.anna if window.anna is missing
    if (!window.anna && typeof window.parent !== 'undefined' && window.parent) {
      try {
        if (window.parent.anna) {
          window.anna = window.parent.anna;
        }
      } catch {
        // Cross-origin iframe parent access might throw security error, ignore safely
      }
    }

    // 2. Deep Checking: window.anna, window.anna.llm, window.anna.llm.complete
    if (window.anna?.llm?.complete) {
      return window.anna;
    }
    if (window.anna?.llm) {
      return window.anna;
    }
    if (window.anna) {
      return window.anna;
    }
    return null;
  };

  // Immediate check
  if (checkAnna()?.llm?.complete) {
    // eslint-disable-next-line no-console
    console.log('[Anna Bridge] window.anna detected!');
    return window.anna;
  }

  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const effectiveTimeout = isTest && timeoutMs === 15000 ? 150 : timeoutMs;
  const pollInterval = isTest ? 25 : 200;

  const startTime = Date.now();
  while (Date.now() - startTime < effectiveTimeout) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    const detected = checkAnna();
    if (detected?.llm?.complete) {
      // eslint-disable-next-line no-console
      console.log('[Anna Bridge] window.anna detected!');
      return detected;
    }
  }

  // After polling loop, do a final deep check for window.anna, window.anna.llm, or window.anna.llm.complete
  const finalCheck = checkAnna();
  if (finalCheck) {
    // eslint-disable-next-line no-console
    console.log('[Anna Bridge] window.anna detected!');
    return finalCheck;
  }

  // eslint-disable-next-line no-console
  console.info('[Anna Bridge] Anna AI Host API (window.anna.llm.complete) not present in current environment.');

  const error = new Error('Anna Host API (window.anna.llm.complete) is not available.');
  error.code = 'API_UNAVAILABLE';
  error.userMessage = 'Anna AI environment not detected. Please run within Anna AI OS.';
  throw error;
}

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
 * Race a promise with an AbortSignal to immediately abort stale requests.
 */
function raceWithSignal(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) {
    const error = new Error('The operation was aborted.');
    error.name = 'AbortError';
    error.code = 'ABORTED';
    return Promise.reject(error);
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      const error = new Error('The operation was aborted.');
      error.name = 'AbortError';
      error.code = 'ABORTED';
      reject(error);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (res) => {
        signal.removeEventListener('abort', onAbort);
        resolve(res);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
}

/**
 * Map Anna Host API errors to user-friendly error objects with userMessage.
 */
function handleLLMError(err) {
  if (err?.name === 'AbortError' || err?.code === 'ABORTED') {
    const error = new Error('The operation was aborted.');
    error.name = 'AbortError';
    error.code = 'ABORTED';
    error.userMessage = '';
    return error;
  }

  if (err?.code === 'API_UNAVAILABLE') {
    const error = new Error(err.userMessage || err.message || 'Anna AI environment not detected. Please run within Anna AI OS.');
    error.code = 'API_UNAVAILABLE';
    error.userMessage = err.userMessage || 'Anna AI environment not detected. Please run within Anna AI OS.';
    error.originalError = err;
    return error;
  }

  const code = err.code || err.status || '';
  let userMessage = 'The AI advisor encountered an error. Please retry.';

  if (code === 'APP_QUOTA_EXCEEDED' || /quota/i.test(err?.message || '')) {
    userMessage = "You're out of Anna credits. Top up in Anna settings, then retry.";
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('anna_quota_exceeded', {
            detail: {
              title: 'Out of Anna Credits',
              message: "You're out of Anna Credits. Please top up in your Anna OS settings to continue generating AI advice.",
            },
          })
        );
      } catch {
        // best effort event dispatch
      }
    }
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
  try {
    await waitForAnna();

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

    if (options?.signal?.aborted) {
      const error = new Error('The operation was aborted.');
      error.name = 'AbortError';
      error.code = 'ABORTED';
      throw error;
    }

    const response = await raceWithSignal(
      window.anna.llm.complete(
        {
          messages: [{ role: 'user', content: userPrompt }],
          systemPrompt: activeSystemPrompt,
          maxTokens: 800,
          temperature: options?.roastMode ? 0.7 : 0.4,
          modelPreferences: {
            speedPriority: 0.8,
            costPriority: 0.5,
            intelligencePriority: 0.85,
          },
        },
        { timeoutMs: maxTotalBudget, signal: options?.signal }
      ),
      options?.signal
    );

    const rawText = response?.content?.text || response?.text || (typeof response === 'string' ? response : '');
    try {
      return extractJSON(rawText);
    } catch {
      // First parse failed — retry once with remaining time budget
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(5000, maxTotalBudget - elapsed);

      if (options?.signal?.aborted) {
        const error = new Error('The operation was aborted.');
        error.name = 'AbortError';
        error.code = 'ABORTED';
        throw error;
      }

      const retryResponse = await raceWithSignal(
        window.anna.llm.complete(
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
          { timeoutMs: remainingTime, signal: options?.signal }
        ),
        options?.signal
      );

      return extractJSON(retryResponse?.content?.text || retryResponse?.text || (typeof retryResponse === 'string' ? retryResponse : ''));
    }
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Generate a harsh roast advice report for a portfolio.
 * @param {object} report
 * @param {string} [targetRole]
 */
export async function generateRoast(report, targetRole = '') {
  return generateAdvice(report, targetRole, { roastMode: true });
}

/**
 * Generate a complete README markdown template for a specific repository.
 * @param {object} repo - The repository object { name, description, language, stars, forks }.
 * @returns {Promise<string>} - Markdown string for the generated README.
 */
export async function generateReadme(repo) {
  try {
    await waitForAnna();

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

    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt:
          'You are a staff open-source engineer and technical writer. Generate a comprehensive, beautiful GitHub README.md in markdown format.',
        maxTokens: 1200,
        temperature: 0.5,
        modelPreferences: {
          intelligencePriority: 0.85,
          speedPriority: 0.75,
          costPriority: 0.5,
        },
      },
      { timeoutMs: 45000 }
    );
    return response?.content?.text || response?.text || '# ' + repo.name + '\n\n' + (repo.description || '');
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Match portfolio against a pasted Job Description.
 */
export async function matchJobDescription(report, jdText) {
  try {
    await waitForAnna();

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

    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt:
          'You are an AI Technical Hiring Evaluator and ATS Matcher. Analyze job descriptions against developer GitHub portfolios and output only valid JSON.',
        maxTokens: 800,
        temperature: 0.3,
        modelPreferences: {
          intelligencePriority: 0.9,
          speedPriority: 0.7,
          costPriority: 0.5,
        },
      },
      { timeoutMs: 45000 }
    );
    const text = response?.content?.text || response?.text || '';
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
  try {
    await waitForAnna();

    const prompt = `Write a catchy, modern, professional GitHub bio (strictly MAXIMUM 160 characters) for developer @${profile?.login || 'dev'}:
- Primary Languages: ${languages.slice(0, 3).map((l) => l.lang || l.name || '').join(', ') || 'TypeScript, React'}
- Flagship Projects: ${topRepos.slice(0, 2).map((r) => r.name).join(', ') || 'open-source tools'}
- Current Bio: "${profile?.bio || 'Building software'}"

Return ONLY the plain bio text (max 160 characters). Do not include quotes or surrounding formatting.`;

    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt:
          'You are a developer branding specialist. Craft a memorable, executive 160-character GitHub profile bio.',
        maxTokens: 100,
        temperature: 0.7,
        modelPreferences: {
          intelligencePriority: 0.75,
          speedPriority: 0.9,
          costPriority: 0.6,
        },
      },
      { timeoutMs: 45000 }
    );
    let bio = (response?.content?.text || response?.text || '').trim().replace(/^["']|["']$/g, '');
    if (bio.length > 160) bio = bio.substring(0, 157) + '...';
    return bio;
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Generate a strong, metric-driven resume bullet point from a repo.
 */
export async function generateResumeBullet(repo) {
  try {
    await waitForAnna();
    const prompt = `Convert this GitHub repository into a single, strong, metric-driven resume bullet point (1-2 sentences max):\n- Name: ${repo.name}\n- Language: ${repo.language || 'JavaScript'}\n- Description: ${repo.description || 'Software project'}\n- Stars: ${repo.stars ?? 0}, Forks: ${repo.forks ?? 0}\n\nWrite like a senior engineer's resume: start with a strong action verb, include technologies, and estimate impact/metrics where possible.\nReturn ONLY the bullet point text (no "•" prefix, no quotes).`;
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are a professional resume writer specialising in software engineers. Write tight, metric-driven resume bullets.',
        maxTokens: 120,
        temperature: 0.5,
        modelPreferences: {
          intelligencePriority: 0.8,
          speedPriority: 0.8,
          costPriority: 0.6,
        },
      },
      { timeoutMs: 45000 }
    );
    return (response?.content?.text || response?.text || '').trim().replace(/^[•-]\s*/, '');
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Suggest 3 specific companies or open-source projects based on top languages.
 */
export async function suggestNetworkMatches(languages = [], targetRole = '') {
  try {
    await waitForAnna();
    const langList = languages.slice(0, 5).map((l) => l.lang || l.name || l).join(', ');
    const prompt = `Based on a developer proficient in [${langList}] targeting a "${targetRole || 'Software Engineer'}" role in 2026, suggest exactly 3 highly specific items:\n1. A company actively hiring this stack RIGHT NOW (name + why they match)\n2. An open-source project they should contribute to (name + why)\n3. A developer community or conference to join (name + platform)\n\nReturn ONLY valid JSON:\n{"suggestions": [{"type": "company|opensource|community", "name": "...", "reason": "..."}]}`;
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an expert tech career coach with deep knowledge of 2026 hiring trends.',
        maxTokens: 400,
        temperature: 0.5,
        modelPreferences: {
          intelligencePriority: 0.8,
          speedPriority: 0.8,
          costPriority: 0.6,
        },
      },
      { timeoutMs: 45000 }
    );
    const text = response?.content?.text || response?.text || '';
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = fenceMatch ? fenceMatch[1].trim() : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(cleaned);
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Compare two users' top repos to find similar projects or superior versions.
 */
export async function compareProjects(user1, user2) {
  try {
    await waitForAnna();
    const repos1 = (user1.report?.topRepos || []).slice(0, 5).map((r) => `${r.name} (${r.language || 'N/A'}): ${r.description || ''}`);
    const repos2 = (user2.report?.topRepos || []).slice(0, 5).map((r) => `${r.name} (${r.language || 'N/A'}): ${r.description || ''}`);
    const prompt = `Compare these two GitHub developers' top projects:\n\n@${user1.username} repos:\n${repos1.join('\n')}\n\n@${user2.username} repos:\n${repos2.join('\n')}\n\nIdentify: similar projects, overlapping tech stacks, who has a more polished version of the same type of project.\nReturn ONLY valid JSON:\n{"similarProjects": [{"description": "...", "user1Repo": "...", "user2Repo": "..."}], "stackOverlap": ["language or tech"], "verdict": "1-sentence comparison"}`;
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an expert code reviewer comparing GitHub developer portfolios.',
        maxTokens: 400,
        temperature: 0.4,
        modelPreferences: {
          intelligencePriority: 0.85,
          speedPriority: 0.75,
          costPriority: 0.5,
        },
      },
      { timeoutMs: 45000 }
    );
    const text = response?.content?.text || response?.text || '';
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = fenceMatch ? fenceMatch[1].trim() : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(cleaned);
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Feature 5 & 15: Simulated LinkedIn Audit with optional Roast Mode.
 */
export async function auditLinkedIn(profile, topRepos = [], languages = [], linkedInText = '', isRoast = false) {
  try {
    await waitForAnna();

    const repoList = topRepos.slice(0, 5).map((r) => `${r.name} (${r.language || 'N/A'}): ${r.description || ''}`).join('\n');
    const langList = languages.slice(0, 5).map((l) => (Array.isArray(l) ? l[0] : l.lang || l.name)).join(', ');

    const systemPrompt = isRoast
      ? 'You are a brutally sarcastic tech recruiter. Roast the developer\'s LinkedIn claims harshly, mocking buzzwords and pointing out every inconsistency with their actual GitHub code.'
      : 'You are an executive tech recruiter and technical auditor. Analyze alignment between a candidate\'s LinkedIn profile text and their verified GitHub repositories.';

    const userPrompt = `Developer GitHub Data:
- Username: @${profile?.login || 'dev'}
- Top Languages: ${langList}
- Real Repositories:
${repoList}

Candidate Pasted LinkedIn About / Headline:
"""
${linkedInText.slice(0, 2000)}
"""

Evaluate consistency between their LinkedIn claims and real GitHub code.
Return ONLY valid JSON:
{
  "consistencyScore": 75,
  "verdict": "Clear alignment on frontend stack, but claims around cloud architecture are unsupported by code.",
  "discrepancies": ["Claims to be a cloud architect but has 0 Docker/Kubernetes repos", "Highlights Python experience which represents < 5% of codebase"],
  "recommendations": ["Feature your TypeScript monorepo prominently in your LinkedIn featured section", "Clarify your primary stack around React & Node"]
}`;

    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: userPrompt }],
        systemPrompt,
        maxTokens: 600,
        temperature: isRoast ? 0.7 : 0.3,
        modelPreferences: {
          intelligencePriority: 0.85,
          speedPriority: 0.75,
          costPriority: 0.5,
        },
      },
      { timeoutMs: 45000 }
    );
    const text = response?.content?.text || response?.text || '';
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = fenceMatch ? fenceMatch[1].trim() : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.consistencyScore !== 'number') parsed.consistencyScore = 75;
    return parsed;
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Feature 6: Auto-generate catchy LinkedIn headlines based on GitHub score and repos.
 */
export async function generateLinkedInHeadlines(profile, score = 85, topRepos = [], languages = []) {
  try {
    await waitForAnna();

    const topLangs = languages.slice(0, 3).map((l) => (Array.isArray(l) ? l[0] : l.lang || l.name)).join(' & ');
    const topProject = topRepos[0]?.name || 'Open Source';

    const prompt = `Generate 3 catchy, high-converting LinkedIn headline variations for a software developer:
- Score: ${score}/100 on GitFolioScore
- Primary Stack: ${topLangs || 'Fullstack Engineering'}
- Flagship Project: ${topProject}
- GitHub: @${profile?.login || 'dev'}

Return ONLY valid JSON:
{
  "headlines": [
    "Fullstack Engineer | TypeScript & React | Building scalable systems | Top 10% GitHub Portfolio",
    "Software Engineer @ Open Source | Creator of ${topProject} | Node.js & Cloud Architecture",
    "Problem Solver & Engineer | ${topLangs} Specialist | Verified GitHub Score: ${score}/100"
  ]
}`;

    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are a career branding expert specializing in viral, executive LinkedIn headlines for engineers.',
        maxTokens: 300,
        temperature: 0.6,
        modelPreferences: {
          intelligencePriority: 0.75,
          speedPriority: 0.9,
          costPriority: 0.6,
        },
      },
      { timeoutMs: 45000 }
    );
    const text = response?.content?.text || response?.text || '';
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = fenceMatch ? fenceMatch[1].trim() : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(cleaned);
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Feature 8: Senior Engineer Peer Code Review in Compare Mode.
 */
export async function peerCodeReview(user1, user2) {
  try {
    await waitForAnna();

    const u1Repos = (user1.report?.topRepos || []).slice(0, 4).map((r) => `${r.name} (${r.language}): ${r.description || ''} [★${r.stars}]`).join('\n');
    const u2Repos = (user2.report?.topRepos || []).slice(0, 4).map((r) => `${r.name} (${r.language}): ${r.description || ''} [★${r.stars}]`).join('\n');

    const prompt = `Act as a Staff/Senior Software Engineer conducting an objective technical comparison between two developers:

Developer A (@${user1.username}): Score ${user1.report?.score}/100
Repos:
${u1Repos}

Developer B (@${user2.username}): Score ${user2.report?.score}/100
Repos:
${u2Repos}

Provide a candid, balanced comparison:
1. Who has the stronger architectural maturity or modern stack
2. Who has better documentation and testing discipline
3. Summary verdict comparing their hiring readiness

Return ONLY valid JSON:
{
  "verdict": "User A demonstrates higher production engineering standards with comprehensive documentation, while User B showcases modern ecosystem experimentation with Next.js.",
  "strengthsA": ["Strong documentation hygiene", "Higher star traction"],
  "strengthsB": ["Modern framework selection", "Diverse repository experimentation"]
}`;

    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an objective Staff Engineer reviewing peer developer portfolios.',
        maxTokens: 500,
        temperature: 0.4,
        modelPreferences: {
          intelligencePriority: 0.9,
          speedPriority: 0.7,
          costPriority: 0.5,
        },
      },
      { timeoutMs: 45000 }
    );
    const text = response?.content?.text || response?.text || '';
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleaned = fenceMatch ? fenceMatch[1].trim() : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(cleaned);
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Feature 10: Extract clean README template structure from competitor's repo.
 */
export async function stealReadmeStructure(repo) {
  try {
    await waitForAnna();

    const prompt = `Analyze this top-rated repository and extract a clean, reusable README markdown template skeleton that another developer can use for their own project:
- Repo Name: ${repo.name}
- Language: ${repo.language || 'Any'}
- Description: ${repo.description || ''}

Create a boilerplate template with placeholders like [Project Name], [Architecture Overview], [Installation], [Features], [Badges], [License].
Return ONLY markdown content.`;

    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an open source maintainer extracting clean README templates in markdown.',
        maxTokens: 700,
        temperature: 0.4,
        modelPreferences: {
          intelligencePriority: 0.8,
          speedPriority: 0.8,
          costPriority: 0.6,
        },
      },
      { timeoutMs: 45000 }
    );
    return response?.content?.text || response?.text || `# [Project Name]\n\n## Overview\n\n## Features\n\n## Installation\n\n## License\n`;
  } catch (err) {
    throw handleLLMError(err);
  }
}

/**
 * Algorithmic fallback for score explanation & career strategy when LLM is unavailable.
 */
export function buildLocalScoreExplanation(report, targetRole = 'Fullstack Engineer') {
  const score = report?.score ?? 0;
  const breakdown = report?.scoreBreakdown || {
    profile: 10,
    repoQuality: 20,
    activity: 15,
    impact: 10,
    diversity: 8,
    docs: 6,
  };

  const role = targetRole || report?.targetRole || 'Fullstack Engineer';
  const roleFit = report?.roleFitScore ?? (score >= 75 ? 85 : score >= 50 ? 65 : 45);

  const pillarAnalysis = [
    {
      pillar: 'Profile Polish',
      score: breakdown.profile ?? 0,
      max: 15,
      status: (breakdown.profile ?? 0) >= 12 ? 'Strong' : (breakdown.profile ?? 0) >= 8 ? 'Good' : 'Needs Work',
      explanation:
        (breakdown.profile ?? 0) >= 12
          ? 'Comprehensive GitHub profile with bio, avatar, and public details.'
          : 'Profile lacks complete bio, company affiliation, or location metadata.',
    },
    {
      pillar: 'Repo Quality',
      score: breakdown.repoQuality ?? 0,
      max: 25,
      status: (breakdown.repoQuality ?? 0) >= 20 ? 'Strong' : (breakdown.repoQuality ?? 0) >= 14 ? 'Good' : 'Needs Work',
      explanation:
        (breakdown.repoQuality ?? 0) >= 20
          ? 'High proportion of repositories with descriptive summaries and clear README files.'
          : 'Repositories have missing descriptions or brief, unformatted READMEs.',
    },
    {
      pillar: 'Activity Consistency',
      score: breakdown.activity ?? 0,
      max: 20,
      status: (breakdown.activity ?? 0) >= 16 ? 'Strong' : (breakdown.activity ?? 0) >= 10 ? 'Good' : 'Needs Work',
      explanation:
        (breakdown.activity ?? 0) >= 16
          ? 'Consistent push and commit velocity maintained across recent months.'
          : 'Inactivity gaps detected; multiple repositories show no commits in the last 6 months.',
    },
    {
      pillar: 'Community Impact',
      score: breakdown.impact ?? 0,
      max: 20,
      status: (breakdown.impact ?? 0) >= 15 ? 'Strong' : (breakdown.impact ?? 0) >= 8 ? 'Good' : 'Needs Work',
      explanation:
        (breakdown.impact ?? 0) >= 15
          ? 'Good community traction with multiple stars and external forks.'
          : 'Limited open-source discovery; portfolio would benefit from star curation and public releases.',
    },
    {
      pillar: 'Tech Diversity',
      score: breakdown.diversity ?? 0,
      max: 10,
      status: (breakdown.diversity ?? 0) >= 8 ? 'Strong' : (breakdown.diversity ?? 0) >= 5 ? 'Good' : 'Needs Work',
      explanation:
        (breakdown.diversity ?? 0) >= 8
          ? 'Broad fluency across multiple complementary languages and toolchains.'
          : 'Narrow language footprint; adding modern frameworks increases marketability.',
    },
    {
      pillar: 'Documentation & Licensing',
      score: breakdown.docs ?? 0,
      max: 10,
      status: (breakdown.docs ?? 0) >= 8 ? 'Strong' : (breakdown.docs ?? 0) >= 5 ? 'Good' : 'Needs Work',
      explanation:
        (breakdown.docs ?? 0) >= 8
          ? 'Clear licensing, architecture notes, and contribution guidelines present.'
          : 'Missing open source licenses (MIT/Apache) and contributing guidelines.',
    },
  ];

  const roleRoadmaps = {
    'Frontend Engineer': {
      summary: `Your portfolio scored ${score}/100 with ${roleFit}% domain alignment for Frontend Engineer roles.`,
      matched: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
      missing: ['Next.js App Router', 'Playwright / Vitest E2E', 'Lighthouse 95+ Performance', 'Tailwind / CSS Tokens'],
      roadmap: [
        {
          step: 'Deploy a Production Next.js 15 Web Application',
          projectedGain: '+10 pts',
          targetPillar: 'Repo Quality & Impact',
          actionItem: 'Build a server-side rendered application with dynamic OpenGraph image generation and a live Vercel demo link in the repo header.',
        },
        {
          step: 'Add Comprehensive Component & E2E Testing',
          projectedGain: '+8 pts',
          targetPillar: 'Documentation & Repo Quality',
          actionItem: 'Integrate Vitest and Playwright with automated GitHub Actions CI, displaying test coverage badges (>= 80%) in the README.',
        },
        {
          step: 'Publish an Accessible UI Component Library or Design System',
          projectedGain: '+6 pts',
          targetPillar: 'Community Impact & Documentation',
          actionItem: 'Extract 5+ reusable accessible components (WCAG AA compliant) with Storybook documentation and npm package distribution.',
        },
      ],
      project: {
        title: 'Collaborative Real-Time Canvas / Dashboard',
        techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'Zustand', 'Playwright'],
        architecture: 'Micro-frontend architecture with optimistic UI updates, local storage sync, and sub-100ms interaction latency.',
        recruiterAppeal: 'Demonstrates deep DOM knowledge, accessibility hygiene, and modern state management that FAANG frontend recruiters look for.',
      },
    },
    'Backend Engineer': {
      summary: `Your portfolio scored ${score}/100 with ${roleFit}% domain alignment for Backend Engineer roles.`,
      matched: ['Python', 'Node.js', 'Go', 'SQL', 'REST API'],
      missing: ['Distributed Caching (Redis)', 'gRPC / Protocol Buffers', 'Database Indexing & Migrations', 'Docker Compose & Telemetry'],
      roadmap: [
        {
          step: 'Build a High-Throughput REST & gRPC Microservice',
          projectedGain: '+10 pts',
          targetPillar: 'Repo Quality & Tech Diversity',
          actionItem: 'Architect a service handling >= 1,000 req/sec with connection pooling, Redis caching, and automated benchmark numbers in the README.',
        },
        {
          step: 'Implement Database Migrations & Transactional Integrity',
          projectedGain: '+8 pts',
          targetPillar: 'Documentation & Repo Quality',
          actionItem: 'Include PostgreSQL migration scripts, indexing plans, and ER diagrams detailing schema normalization and ACID guarantees.',
        },
        {
          step: 'Add Structured Logging, OpenTelemetry & Health Checks',
          projectedGain: '+6 pts',
          targetPillar: 'Activity & Documentation',
          actionItem: 'Provide a docker-compose.yml setup with Prometheus and Grafana dashboards for monitoring request latencies (p95, p99).',
        },
      ],
      project: {
        title: 'Event-Driven Distributed Task & Notification Queue',
        techStack: ['Go / Rust / Python', 'PostgreSQL', 'Redis', 'Kafka / RabbitMQ', 'Docker', 'OpenTelemetry'],
        architecture: 'Decoupled worker pool with idempotent consumers, exponential backoff retries, and distributed tracing.',
        recruiterAppeal: 'Directly validates system design capabilities, race condition handling, and production-grade reliability.',
      },
    },
    'Mobile Engineer': {
      summary: `Your portfolio scored ${score}/100 with ${roleFit}% domain alignment for Mobile Engineer roles.`,
      matched: ['Kotlin', 'Swift', 'Dart', 'Flutter', 'React Native'],
      missing: ['Offline-First SQLite / Room', 'CI/CD Fastlane Build Automation', 'App Store / Play Store Release', 'Deep Linking & Biometric Auth'],
      roadmap: [
        {
          step: 'Ship a Published or Demoable Mobile App with Video Previews',
          projectedGain: '+12 pts',
          targetPillar: 'Repo Quality & Impact',
          actionItem: 'Add an animated GIF or video walkthrough of the app running on iOS/Android, linking to TestFlight, APK download, or store listing.',
        },
        {
          step: 'Implement Offline-First Synchronization Architecture',
          projectedGain: '+8 pts',
          targetPillar: 'Repo Quality & Documentation',
          actionItem: 'Use Room / CoreData with conflict resolution, background sync workers, and network connectivity state observers.',
        },
        {
          step: 'Automate Mobile CI/CD with Fastlane & GitHub Actions',
          projectedGain: '+6 pts',
          targetPillar: 'Activity & Documentation',
          actionItem: 'Configure automated linting, unit tests, and build artifacts generated on every pull request.',
        },
      ],
      project: {
        title: 'Offline-First Personal Finance & Expense Tracker',
        techStack: ['Kotlin (Jetpack Compose) / Swift (SwiftUI) / Flutter', 'Room DB / SQLite', 'Coroutines', 'Fastlane'],
        architecture: 'MVVM / Clean Architecture with unidirectional data flow (UDF), biometric auth, and interactive charts.',
        recruiterAppeal: 'Mobile hiring managers look for rock-solid UI responsiveness, offline data resilience, and native platform conventions.',
      },
    },
    'DevOps & Cloud Engineer': {
      summary: `Your portfolio scored ${score}/100 with ${roleFit}% domain alignment for DevOps & Cloud Engineer roles.`,
      matched: ['Docker', 'Shell', 'GitHub Actions', 'Python', 'YAML'],
      missing: ['Kubernetes Helm Charts', 'Terraform Infrastructure as Code', 'Prometheus & Grafana', 'Zero-Trust IAM & Security Scans'],
      roadmap: [
        {
          step: 'Create Modular Terraform Infrastructure as Code (IaC)',
          projectedGain: '+10 pts',
          targetPillar: 'Repo Quality & Docs',
          actionItem: 'Author reusable Terraform modules for VPC, EKS/GKE cluster, and RDS with state locking and tfsec security scanning.',
        },
        {
          step: 'Deploy a Production Kubernetes Cluster with Helm & ArgoCD',
          projectedGain: '+8 pts',
          targetPillar: 'Tech Diversity & Impact',
          actionItem: 'Set up GitOps deployment pipeline with automated canary rollouts and health check probes.',
        },
        {
          step: 'Build a Multi-Stage CI/CD Pipeline with Trivy & Snyk Scans',
          projectedGain: '+6 pts',
          targetPillar: 'Documentation & Activity',
          actionItem: 'Containerize apps with non-root Dockerfiles, minimal distroless base images, and automated vulnerability scanning in PRs.',
        },
      ],
      project: {
        title: 'GitOps Cloud Native Telemetry & Deployment Suite',
        techStack: ['Terraform', 'Kubernetes (K8s)', 'Helm', 'ArgoCD', 'Prometheus', 'GitHub Actions'],
        architecture: 'Declarative infrastructure repository managing multi-environment deployments (Dev/Staging/Prod) with automated rollback.',
        recruiterAppeal: 'Proves immediate ability to manage cloud infrastructure, reduce deployment failure rates, and enforce security policies.',
      },
    },
    'Machine Learning / AI Engineer': {
      summary: `Your portfolio scored ${score}/100 with ${roleFit}% domain alignment for Machine Learning / AI Engineer roles.`,
      matched: ['Python', 'PyTorch', 'Data Analysis', 'Jupyter'],
      missing: ['MLOps Model Registry (MLflow)', 'ONNX Model Quantization', 'FastAPI Inference API with Docker', 'Evaluation Benchmarks & Data Drift'],
      roadmap: [
        {
          step: 'Deploy a Model Serving API with Docker & FastAPI',
          projectedGain: '+10 pts',
          targetPillar: 'Repo Quality & Tech Diversity',
          actionItem: 'Package your model with ONNX or TensorRT, serve with FastAPI, and include curl examples and response latency benchmarks in the README.',
        },
        {
          step: 'Implement Reproducible MLOps Pipeline with DVC & Weights & Biases',
          projectedGain: '+8 pts',
          targetPillar: 'Documentation & Activity',
          actionItem: 'Version control datasets and model checkpoints with DVC, logging hyperparameters and validation curves to W&B.',
        },
        {
          step: 'Provide Clear Evaluation Metrics & Ablation Studies',
          projectedGain: '+6 pts',
          targetPillar: 'Documentation & Impact',
          actionItem: 'Document F1-score, precision-recall curves, baseline comparisons, and trade-offs against industry benchmarks.',
        },
      ],
      project: {
        title: 'End-to-End Multimodal Semantic Search & Inference Engine',
        techStack: ['Python', 'PyTorch', 'Hugging Face', 'FastAPI', 'Qdrant / Milvus (Vector DB)', 'Docker'],
        architecture: 'Real-time embedding generation with vector indexing, cached query responses, and batch inference worker queues.',
        recruiterAppeal: 'Distinguishes applied AI engineers from notebook-only experimenters by demonstrating deployment and latency awareness.',
      },
    },
    'Fullstack Engineer': {
      summary: `Your portfolio scored ${score}/100 with ${roleFit}% domain alignment for Fullstack Engineer roles.`,
      matched: ['TypeScript', 'React', 'Node.js', 'SQL', 'REST'],
      missing: ['End-to-End TypeScript Validation (Zod)', 'PostgreSQL Prisma/Drizzle ORM', 'Redis Session Store', 'Automated E2E Testing'],
      roadmap: [
        {
          step: 'Build and Deploy a Full-Stack Production SaaS with Auth & Payments',
          projectedGain: '+10 pts',
          targetPillar: 'Repo Quality & Impact',
          actionItem: 'Develop a full-stack app with Next.js/React, Node/PostgreSQL, Stripe/Auth integration, and a live working URL.',
        },
        {
          step: 'Implement End-to-End Type Safety & Data Validation',
          projectedGain: '+8 pts',
          targetPillar: 'Documentation & Repo Quality',
          actionItem: 'Use tRPC or Zod across client and server boundaries to eliminate runtime type mismatches and document API contracts.',
        },
        {
          step: 'Add Comprehensive Test Pyramid (Unit + Integration + E2E)',
          projectedGain: '+6 pts',
          targetPillar: 'Activity & Documentation',
          actionItem: 'Automate testing with Jest and Playwright running on GitHub Actions with PR preview environments.',
        },
      ],
      project: {
        title: 'Full-Stack Developer Analytics & Team Collaboration Hub',
        techStack: ['TypeScript', 'Next.js 15', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker'],
        architecture: 'Layered architecture with role-based access control (RBAC), WebSocket live updates, and rate-limited API endpoints.',
        recruiterAppeal: 'Demonstrates end-to-end autonomy: capable of taking a product from conception to deployment without hand-holding.',
      },
    },
  };

  const selectedRoleData = roleRoadmaps[role] || roleRoadmaps['Fullstack Engineer'];

  return {
    overallScore: score,
    targetRole: role,
    scoreSummary: `Your portfolio earned ${score}/100. ${
      score >= 80
        ? 'You have a competitive, senior-ready profile with strong public signals.'
        : score >= 60
        ? 'You have a solid technical foundation, but key documentation and architecture gaps hold back your score.'
        : 'Your portfolio has high technical debt or minimal repository documentation that significantly lowers recruiter visibility.'
    } Evaluating specifically for the "${role}" track, your alignment index is ${roleFit}%.`,
    pillarAnalysis,
    roleAlignmentDiagnosis: {
      fitScore: roleFit,
      status: roleFit >= 75 ? 'Strong Match' : roleFit >= 50 ? 'Moderate Match' : 'Pivot Recommended',
      summary: selectedRoleData.summary,
      matchedSkills: selectedRoleData.matched,
      missingSkills: selectedRoleData.missing,
    },
    improvementRoadmap: selectedRoleData.roadmap,
    flagshipProjectIdea: selectedRoleData.project,
  };
}

/**
 * Explains how the portfolio score was calculated and generates an actionable career improvement blueprint.
 * @param {object} report - The full computed portfolio report.
 * @param {string} [targetRole] - The target career role (e.g. "Mobile Engineer", "Frontend Engineer").
 * @param {object} [options] - Options including signal, persona.
 */
export async function explainScoreAndCareerStrategy(report, targetRole = 'Fullstack Engineer', options = {}) {
  const fallback = buildLocalScoreExplanation(report, targetRole);

  try {
    await waitForAnna();
    if (!window.anna?.llm?.complete) {
      return fallback;
    }

    const condensed = {
      username: report.profile?.login,
      score: report.score,
      targetRole: targetRole || 'Fullstack Engineer',
      scoreBreakdown: report.scoreBreakdown,
      languages: report.mostUsedLanguages?.slice(0, 5),
      topRepos: report.topRepos?.slice(0, 4).map((r) => ({
        name: r.name,
        stars: r.stars,
        language: r.language,
        hasReadme: r.hasReadme,
        description: r.description,
      })),
    };

    const prompt = `You are a Principal Software Architect and VP of Engineering conducting an adversarial technical scoring audit.
Explain why this developer received a score of ${report.score}/100, analyze their fit for the "${targetRole}" career track, and provide an actionable step-by-step roadmap to raise their score to 90+.

Candidate Portfolio Data:
${JSON.stringify(condensed, null, 2)}

Return ONLY valid JSON matching this schema:
{
  "overallScore": ${report.score},
  "targetRole": "${targetRole}",
  "scoreSummary": "2-sentence clear diagnosis of why this score was received",
  "pillarAnalysis": [
    {"pillar": "Profile Polish", "score": number, "max": 15, "status": "Strong|Good|Needs Work", "explanation": "..."},
    {"pillar": "Repo Quality", "score": number, "max": 25, "status": "Strong|Good|Needs Work", "explanation": "..."},
    {"pillar": "Activity Consistency", "score": number, "max": 20, "status": "Strong|Good|Needs Work", "explanation": "..."},
    {"pillar": "Community Impact", "score": number, "max": 20, "status": "Strong|Good|Needs Work", "explanation": "..."},
    {"pillar": "Tech Diversity", "score": number, "max": 10, "status": "Strong|Good|Needs Work", "explanation": "..."},
    {"pillar": "Documentation & Licensing", "score": number, "max": 10, "status": "Strong|Good|Needs Work", "explanation": "..."}
  ],
  "roleAlignmentDiagnosis": {
    "fitScore": number,
    "status": "Strong Match|Moderate Match|Pivot Recommended",
    "summary": "...",
    "matchedSkills": ["..."],
    "missingSkills": ["..."]
  },
  "improvementRoadmap": [
    {"step": "...", "projectedGain": "+X pts", "targetPillar": "...", "actionItem": "..."}
  ],
  "flagshipProjectIdea": {
    "title": "...",
    "techStack": ["..."],
    "architecture": "...",
    "recruiterAppeal": "..."
  }
}`;

    const response = await raceWithSignal(
      window.anna.llm.complete(
        {
          messages: [{ role: 'user', content: prompt }],
          systemPrompt:
            'You are a Principal Software Architect analyzing GitHub portfolios. Provide realistic, highly actionable score diagnosis and role-specific improvement blueprints in strict JSON.',
          maxTokens: 1000,
          temperature: 0.3,
          modelPreferences: {
            speedPriority: 0.8,
            costPriority: 0.5,
            intelligencePriority: 0.85,
          },
        },
        { timeoutMs: 40000, signal: options?.signal }
      ),
      options?.signal
    );

    const raw = response?.content?.text || response?.text || (typeof response === 'string' ? response : '');
    try {
      const parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''));
      if (parsed.scoreSummary && Array.isArray(parsed.improvementRoadmap)) {
        return {
          ...fallback,
          ...parsed,
          overallScore: report.score,
          targetRole,
        };
      }
    } catch {
      // JSON parse failed, use fallback
    }

    return fallback;
  } catch {
    return fallback;
  }
}
