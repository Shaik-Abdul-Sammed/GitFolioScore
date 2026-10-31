import { generateAdvice } from './llm';

describe('llm.js - AI Career Coach & Error Handling', () => {
  const dummyReport = {
    profile: { login: 'octocat' },
    score: 85,
    scoreBreakdown: { docs: 9, repoQuality: 22, activity: 18, impact: 16, diversity: 10, profile: 10 },
    strengths: ['Diverse language usage', 'Detailed documentation found'],
    redFlags: [],
    suggestions: ['Increase community impact'],
    mostUsedLanguages: [['TypeScript', 8], ['Rust', 4]],
    topRepos: [
      { name: 'repo-one', stars: 120, forks: 30, language: 'TypeScript', hasReadme: true },
    ],
  };

  const validAdvicePayload = {
    summary: 'Strong technical baseline with great documentation hygiene.',
    actions: [
      { action: 'Add architecture diagrams', rationale: 'Boosts repo clarity for reviewers' },
      { action: 'Pin your TypeScript monorepo', rationale: 'Highlights your strongest codebase' },
      { action: 'Add test coverage badges', rationale: 'Signals enterprise quality discipline' },
    ],
    shareText: 'Scored 85/100 on GitFolioScore with high documentation and language diversity!',
    timeToHireWeeks: 6,
    atsMissingKeywords: ['Docker', 'CI/CD Pipelines', 'Automated Testing', 'Cloud Deployment'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.anna;
  });

  describe('Happy Path', () => {
    it('calls window.anna.llm.complete and returns parsed advice JSON object', async () => {
      window.anna = {
        llm: {
          complete: jest.fn().mockResolvedValue({
            content: {
              type: 'text',
              text: JSON.stringify(validAdvicePayload),
            },
          }),
        },
      };

      const result = await generateAdvice(dummyReport, 'Senior Full-Stack Engineer');

      expect(window.anna.llm.complete).toHaveBeenCalledTimes(1);
      expect(window.anna.llm.complete).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Senior Full-Stack Engineer'),
            }),
          ]),
          maxTokens: 800,
        }),
        expect.objectContaining({ timeoutMs: 45000 })
      );
      expect(result).toEqual(validAdvicePayload);
    });
  });

  describe('Markdown Wrapper', () => {
    it('strips ```json code fences and parses raw JSON correctly', async () => {
      const fencedResponse = `\`\`\`json\n${JSON.stringify(validAdvicePayload, null, 2)}\n\`\`\``;

      window.anna = {
        llm: {
          complete: jest.fn().mockResolvedValue({
            content: {
              type: 'text',
              text: fencedResponse,
            },
          }),
        },
      };

      const result = await generateAdvice(dummyReport, 'Backend Engineer');

      expect(result).toEqual(validAdvicePayload);
      expect(result.actions).toHaveLength(3);
    });
  });

  describe('Quota Exceeded', () => {
    it('maps APP_QUOTA_EXCEEDED error to a user-friendly credit top-up message', async () => {
      window.anna = {
        llm: {
          complete: jest.fn().mockRejectedValue({
            code: 'APP_QUOTA_EXCEEDED',
            message: 'Quota limit exceeded for current account',
          }),
        },
      };

      await expect(generateAdvice(dummyReport)).rejects.toMatchObject({
        code: 'APP_QUOTA_EXCEEDED',
        userMessage: "You're out of Anna credits. Top up in Anna settings, then retry.",
        message: "You're out of Anna credits. Top up in Anna settings, then retry.",
      });
    });
  });

  describe('Timeout / Provider Error', () => {
    it('maps APP_PROVIDER_ERROR to an actionable model configuration error message', async () => {
      window.anna = {
        llm: {
          complete: jest.fn().mockRejectedValue({
            code: 'APP_PROVIDER_ERROR',
            message: 'No eligible model available for user provider preferences',
          }),
        },
      };

      await expect(generateAdvice(dummyReport)).rejects.toMatchObject({
        code: 'APP_PROVIDER_ERROR',
        userMessage: 'No AI model set up on your Anna account. Configure one in settings, then retry.',
      });
    });

    it('maps timeout rejection to an informative timeout message', async () => {
      window.anna = {
        llm: {
          complete: jest.fn().mockRejectedValue({
            code: 'TIMEOUT',
            message: 'Host API timeout exceeded after 45000ms',
          }),
        },
      };

      await expect(generateAdvice(dummyReport)).rejects.toMatchObject({
        code: 'TIMEOUT',
        userMessage: 'The AI advisor timed out. Retry — your score is already computed.',
      });
    });

    it('throws API_UNAVAILABLE error when window.anna.llm.complete is missing', async () => {
      // window.anna is undefined
      await expect(generateAdvice(dummyReport)).rejects.toMatchObject({
        code: 'API_UNAVAILABLE',
        userMessage: 'Anna AI environment not detected. Please run within Anna AI OS.',
      });
    });
  });
});
