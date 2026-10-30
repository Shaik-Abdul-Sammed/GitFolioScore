import { calculateReport, computeScore, generateInsights } from './score';

describe('score.js - Pure Scoring Logic', () => {
  describe('Newbie User', () => {
    it('calculates a low score (< 30) and flags missing bio and READMEs', () => {
      const newbieProfile = {
        login: 'newbie-dev',
        bio: '',
        avatar_url: '',
        location: '',
        company: '',
        public_repos: 2,
      };

      const newbieRepos = [
        {
          name: 'project-a',
          description: '',
          stargazers_count: 0,
          forks_count: 0,
          language: null,
          topics: [],
          hasReadme: false,
          readmeSize: 0,
          size: 0,
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          name: 'project-b',
          description: '',
          stargazers_count: 0,
          forks_count: 0,
          language: null,
          topics: [],
          hasReadme: false,
          readmeSize: 0,
          size: 0,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      const report = calculateReport({ profile: newbieProfile, repos: newbieRepos });

      expect(report.score).toBeLessThan(30);
      expect(report.suggestions).toContain('Add a bio to your profile');
      expect(report.redFlags).toContain('Many repositories missing README');
      expect(report.scoreBreakdown.docs).toBe(0);
      expect(report.scoreBreakdown.profile).toBe(0);
    });

    it('returns score of 0 when profile and repositories are completely empty', () => {
      const emptyProfile = { login: 'empty', bio: '', public_repos: 0 };
      const report = calculateReport({ profile: emptyProfile, repos: [] });

      expect(report.score).toBeLessThan(30);
      expect(report.score).toBe(0);
      expect(report.suggestions).toContain('Add a bio to your profile');
    });
  });

  describe('10x Developer', () => {
    it('calculates a high score (> 80) and identifies diverse language usage and high impact', () => {
      const proProfile = {
        login: 'pro-dev',
        name: 'Pro Developer',
        bio: 'Staff Engineer & Core Maintainer',
        avatar_url: 'https://avatars.githubusercontent.com/u/100',
        location: 'San Francisco, CA',
        company: 'Innovate Corp',
        public_repos: 50,
      };

      const languages = ['TypeScript', 'Python', 'Rust', 'Go', 'JavaScript'];
      const now = new Date().toISOString();

      const proRepos = Array.from({ length: 50 }, (_, i) => ({
        name: `super-repo-${i}`,
        description: `Production grade microservice ${i} with enterprise architecture.`,
        stargazers_count: 50,
        forks_count: 20,
        language: languages[i % languages.length],
        topics: ['open-source', 'cloud-native', 'production'],
        hasReadme: true,
        readmeSize: 3000,
        size: 500,
        updated_at: now,
      }));

      const report = calculateReport({ profile: proProfile, repos: proRepos });

      expect(report.score).toBeGreaterThan(80);
      expect(report.strengths).toContain('Diverse language usage');
      expect(report.strengths).toContain('Good number of public repos');
      expect(report.strengths).toContain('Project has received stars');
      expect(report.strengths).toContain('Detailed documentation found');
      expect(report.redFlags).not.toContain('Many repositories missing README');
    });
  });

  describe('Readme Calculations', () => {
    it('penalizes profiles where most repos lack a README', () => {
      const baseProfile = {
        login: 'test-user',
        bio: 'Software engineer building web apps',
        avatar_url: 'https://avatars.githubusercontent.com/u/200',
        location: 'Bengaluru, India',
        company: 'Dev Studio',
        public_repos: 10,
      };

      const now = new Date().toISOString();

      // Repos with full READMEs
      const goodRepos = Array.from({ length: 10 }, (_, i) => ({
        name: `documented-repo-${i}`,
        description: `Well documented project ${i}`,
        stargazers_count: 5,
        forks_count: 2,
        language: 'JavaScript',
        topics: ['web'],
        hasReadme: true,
        readmeSize: 2500,
        size: 100,
        updated_at: now,
      }));

      // Repos with missing READMEs
      const poorRepos = Array.from({ length: 10 }, (_, i) => ({
        name: `undocumented-repo-${i}`,
        description: `Poorly documented project ${i}`,
        stargazers_count: 5,
        forks_count: 2,
        language: 'JavaScript',
        topics: ['web'],
        hasReadme: i === 0, // only 1 has a README (10%)
        readmeSize: i === 0 ? 500 : 0,
        size: 100,
        updated_at: now,
      }));

      const goodReport = calculateReport({ profile: baseProfile, repos: goodRepos });
      const poorReport = calculateReport({ profile: baseProfile, repos: poorRepos });

      // Poor report has a strictly lower overall score and docs subscore
      expect(poorReport.score).toBeLessThan(goodReport.score);
      expect(poorReport.scoreBreakdown.docs).toBeLessThan(goodReport.scoreBreakdown.docs);
      expect(poorReport.redFlags).toContain('Many repositories missing README');
      expect(goodReport.redFlags).not.toContain('Many repositories missing README');
    });
  });
});
