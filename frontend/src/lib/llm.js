/**
 * LLM Advisor service using window.anna.llm.complete.
 */

const SYSTEM_PROMPT =
  'You are a senior software engineer and career coach. Given a scored GitHub portfolio, produce exactly 3 prioritized actions each tied to a specific signal in the report, plus a 2-sentence shareable summary. Return ONLY valid JSON: {summary, actions:[{action, rationale}], shareText}.';

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
 * @returns {Promise<{summary: string, actions: Array<{action: string, rationale: string}>, shareText: string}>}
 */
export async function generateAdvice(report, targetRole = '') {
  if (!window.anna?.llm?.complete) {
    const error = new Error('Anna Host API (window.anna.llm.complete) is not available.');
    error.code = 'API_UNAVAILABLE';
    error.userMessage = 'Anna AI environment not detected. Please run within Anna AI OS.';
    throw error;
  }

  // Build condensed report payload to avoid context bloat
  const condensedReport = {
    username: report.profile?.login,
    targetRole: targetRole || 'Software Engineer',
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

  const userPrompt = `Target Role: ${targetRole || 'Software Engineer'}\n\nPortfolio Report Data:\n${JSON.stringify(
    condensedReport,
    null,
    2
  )}`;

  const startTime = Date.now();
  const maxTotalBudget = 45000;

  try {
    const response = await window.anna.llm.complete(
      {
        messages: [{ role: 'user', content: userPrompt }],
        systemPrompt: SYSTEM_PROMPT,
        maxTokens: 800,
        temperature: 0.4,
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
          systemPrompt: SYSTEM_PROMPT,
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
