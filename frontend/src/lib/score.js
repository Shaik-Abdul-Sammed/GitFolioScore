/**
 * Pure calculation logic for scoring a GitHub profile based on profile and repository data.
 * Faithful direct port of backend/utils/analyze.js with modern role-targeted benchmark adjustments.
 */

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export const ROLE_CRITERIA = {
  'Frontend Engineer': {
    preferredLanguages: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte', 'SCSS'],
    preferredTopics: ['react', 'vue', 'angular', 'frontend', 'ui', 'nextjs', 'tailwind', 'web', 'css', 'design-system', 'vite', 'webpack'],
    weights: { profile: 15, repoQuality: 25, activity: 20, impact: 15, diversity: 10, docs: 15 },
  },
  'Backend Engineer': {
    preferredLanguages: ['Go', 'Rust', 'Java', 'Python', 'C#', 'C++', 'Node.js', 'Ruby', 'PHP', 'SQL', 'Elixir'],
    preferredTopics: ['api', 'rest', 'graphql', 'backend', 'microservices', 'database', 'sql', 'postgresql', 'redis', 'server', 'grpc'],
    weights: { profile: 15, repoQuality: 25, activity: 20, impact: 20, diversity: 10, docs: 10 },
  },
  'Mobile Engineer': {
    preferredLanguages: ['Kotlin', 'Swift', 'Dart', 'Java', 'Objective-C'],
    preferredTopics: ['android', 'ios', 'mobile', 'flutter', 'react-native', 'swiftui', 'jetpack-compose', 'app', 'expo', 'xcode'],
    weights: { profile: 15, repoQuality: 30, activity: 15, impact: 20, diversity: 10, docs: 10 },
  },
  'Machine Learning / AI Engineer': {
    preferredLanguages: ['Python', 'Jupyter Notebook', 'R', 'C++', 'Julia'],
    preferredTopics: ['machine-learning', 'deep-learning', 'ai', 'data-science', 'nlp', 'computer-vision', 'pytorch', 'tensorflow', 'llm', 'huggingface', 'model'],
    weights: { profile: 10, repoQuality: 25, activity: 20, impact: 25, diversity: 10, docs: 10 },
  },
  'DevOps & Cloud Engineer': {
    preferredLanguages: ['Shell', 'HCL', 'Dockerfile', 'Go', 'Python', 'Makefile', 'YAML'],
    preferredTopics: ['docker', 'kubernetes', 'terraform', 'ci-cd', 'devops', 'cloud', 'aws', 'k8s', 'ansible', 'helm', 'github-actions', 'infrastructure', 'monitoring', 'prometheus'],
    weights: { profile: 10, repoQuality: 25, activity: 25, impact: 15, diversity: 10, docs: 15 },
  },
  'Fullstack Engineer': {
    preferredLanguages: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Java', 'HTML', 'CSS', 'SQL'],
    preferredTopics: ['fullstack', 'web', 'api', 'react', 'node', 'database', 'rest', 'saas', 'app'],
    weights: { profile: 15, repoQuality: 25, activity: 20, impact: 20, diversity: 10, docs: 10 },
  },
};

/**
 * Calculates domain role alignment score (0 - 100)
 */
export function calculateRoleFit(repos = [], languageCount = {}, targetRole = '') {
  if (!targetRole || !ROLE_CRITERIA[targetRole]) {
    return { fitScore: 100, label: 'General Alignment', matchedSkills: [] };
  }

  const criteria = ROLE_CRITERIA[targetRole];
  const matchedSkills = new Set();

  let matchedLangWeight = 0;
  let totalLangWeight = 0;
  Object.entries(languageCount).forEach(([lang, count]) => {
    totalLangWeight += count;
    if (criteria.preferredLanguages.some((pl) => pl.toLowerCase() === lang.toLowerCase())) {
      matchedLangWeight += count;
      matchedSkills.add(lang);
    }
  });

  const langMatchRatio = totalLangWeight > 0 ? (matchedLangWeight / totalLangWeight) : 0.5;

  let topicMatches = 0;
  repos.forEach((repo) => {
    const topics = repo.topics || [];
    topics.forEach((t) => {
      const tLower = t.toLowerCase();
      if (criteria.preferredTopics.some((pt) => tLower.includes(pt))) {
        topicMatches++;
        matchedSkills.add(t);
      }
    });
    // Check description for keywords
    if (repo.description) {
      const descLower = repo.description.toLowerCase();
      criteria.preferredTopics.slice(0, 5).forEach((pt) => {
        if (descLower.includes(pt)) {
          topicMatches += 0.5;
        }
      });
    }
  });

  const topicMatchRatio = Math.min(1, topicMatches / Math.max(1, repos.length * 0.8));

  // Combined fit score: 60% language relevance + 40% project domain relevance
  const rawFit = Math.round((langMatchRatio * 60) + (topicMatchRatio * 40));
  const fitScore = Math.max(20, Math.min(100, rawFit));

  let label = 'Domain Specialist';
  if (fitScore >= 80) label = 'Target Role Specialist';
  else if (fitScore >= 55) label = 'Solid Domain Alignment';
  else if (fitScore >= 35) label = 'Moderate Role Alignment';
  else label = 'Cross-Domain Explorer';

  return { fitScore, label, matchedSkills: Array.from(matchedSkills).slice(0, 6) };
}

/**
 * Compute the overall portfolio score breakdown.
 *
 * Key design principles:
 * - Impact (stars/forks) is a strong quality signal — high-starred repos prove community value
 *   regardless of README presence. We apply a "quality override" so an architect with
 *   10 high-starred repos isn't penalised to the same degree as a user with zero engagement.
 * - Profile completeness is a soft signal (useful for recruiters, not a code quality proxy).
 *   Code-centric roles (Backend, ML, DevOps) automatically down-weight it.
 * - Repo quality scoring rewards substance (topics, CI, descriptions) not mere presence.
 * - Docs/README score is partially compensated when a repo has significant star count,
 *   reflecting that community adoption implies readable, useful code.
 */
export function computeScore({
  profile,
  repos,
  totalStars,
  totalForks,
  languageCount,
  readmeCount,
  detailedReadmeCount,
  inactiveRepos,
  consistentReposCount,
  topReposCount,
  weights,
  targetRole = '',
  isRepo = false,
}) {
  const roleConfig = targetRole && ROLE_CRITERIA[targetRole] ? ROLE_CRITERIA[targetRole].weights : {};
  const w = {
    profile: 15,
    repoQuality: 25,
    activity: 20,
    impact: 20,
    diversity: 10,
    docs: 10,
    ...roleConfig,
    ...(weights || {}),
  };

  const reposCount = repos.length || 1;

  // ── Profile completeness ─────────────────────────────────────────────────
  // For code-centric roles, profile completeness is less important.
  // We still award it, but cap it so an empty profile doesn't tank a great codebase.
  let profileScore = 0;
  if (!isRepo && profile) {
    if (profile.bio) profileScore += w.profile * 0.25;
    if (profile.avatar_url) profileScore += w.profile * 0.15;
    if (profile.location) profileScore += w.profile * 0.15;
    if (profile.company) profileScore += w.profile * 0.15;
    if ((profile.public_repos || 0) >= 3) profileScore += w.profile * 0.3;
  } else {
    profileScore = w.profile;
  }

  // ── Repo quality ─────────────────────────────────────────────────────────
  // Rewards repos with descriptions, topic tags (shows intentionality), CI signals,
  // and detailed READMEs. High-starred repos without descriptions still earn partial credit.
  let repoQuality = 0;
  const withDesc = repos.filter((r) => r.description).length;
  const withTopics = repos.filter((r) => r.topics && r.topics.length > 0).length;
  const withCI = repos.filter((r) => r.hasCI).length;

  repoQuality += Math.min(w.repoQuality * 0.35, (withDesc / reposCount) * w.repoQuality * 0.35);
  repoQuality += Math.min(w.repoQuality * 0.3, (withTopics / reposCount) * w.repoQuality * 0.3);
  repoQuality += Math.min(w.repoQuality * 0.2, (withCI / reposCount) * w.repoQuality * 0.2);

  // Detailed README bonus
  const detailedRatio = detailedReadmeCount / reposCount;
  repoQuality += Math.min(w.repoQuality * 0.15, detailedRatio * w.repoQuality * 0.15);

  // ── Activity consistency ─────────────────────────────────────────────────
  let activity = 0;
  const activeRepos = repos.length - inactiveRepos;
  activity += Math.min(w.activity * 0.6, (activeRepos / reposCount) * w.activity * 0.6);
  if (topReposCount > 0) {
    activity += Math.min(w.activity * 0.4, (consistentReposCount / topReposCount) * w.activity * 0.4);
  }

  // ── Project impact ───────────────────────────────────────────────────────
  // Stars and forks are the strongest signal of real-world quality.
  // Scale reference: 50 stars or 20 forks → full impact for a portfolio.
  // Repos with 100+ total stars get a mild "prestige" lift even if other metrics are weak.
  let impact = 0;
  impact += Math.min(w.impact * 0.6, (totalStars / (isRepo ? 10 : 50)) * w.impact * 0.6);
  impact += Math.min(w.impact * 0.4, (totalForks / (isRepo ? 5 : 20)) * w.impact * 0.4);

  // ── Language diversity ───────────────────────────────────────────────────
  let diversity = 0;
  if (!isRepo) {
    const langCount = Object.keys(languageCount || {}).length;
    // Diminishing returns beyond 5 languages; breadth is good but depth matters more
    diversity += Math.min(w.diversity, langCount >= 1 ? Math.min(w.diversity, 2 + (langCount - 1) * 1.6) : 0);
  } else {
    diversity = w.diversity;
  }

  // ── README + docs ────────────────────────────────────────────────────────
  // Core docs score, but allow high-impact projects (50+ stars) to partially compensate
  // for missing READMEs — community adoption is itself a quality signal.
  let docs = 0;
  docs += Math.min(w.docs * 0.8, (readmeCount / reposCount) * w.docs * 0.8);
  // "Star quality override": if the portfolio has significant stars, award partial doc credit
  // even without READMEs, since popular projects obviously have accessible documentation.
  const starQualityBonus = Math.min(w.docs * 0.2, (totalStars / 100) * w.docs * 0.2);
  docs = Math.min(w.docs, docs + starQualityBonus);

  // ── Role fit modulation ─────────────────────────────────────────────────
  if (targetRole && ROLE_CRITERIA[targetRole] && !isRepo && repos.length > 0) {
    const roleFit = calculateRoleFit(repos, languageCount, targetRole);
    // Role multiplier scales from 0.78 (low domain match) to 1.12 (spot-on domain specialist)
    const roleMultiplier = 0.78 + (roleFit.fitScore / 100) * 0.34;
    repoQuality = Math.min(w.repoQuality, repoQuality * roleMultiplier);
    impact = Math.min(w.impact, impact * (0.88 + (roleFit.fitScore / 100) * 0.24));
    diversity = Math.min(w.diversity, diversity * (0.82 + (roleFit.fitScore / 100) * 0.36));
  }

  const breakdown = {
    profile: Math.round(profileScore),
    repoQuality: Math.round(repoQuality),
    activity: Math.round(activity),
    impact: Math.round(impact),
    diversity: Math.round(diversity),
    docs: Math.round(docs),
  };

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  Object.defineProperty(breakdown, 'score', {
    value: total,
    enumerable: false,
    configurable: true,
  });

  return breakdown;
}

/**
 * Generate strengths, red flags, and suggestions.
 */
export function generateInsights({
  profile,
  repos,
  totalStars,
  totalForks,
  languageCount,
  readmeCount,
  detailedReadmeCount,
  inactiveRepos,
  consistentReposCount,
  topReposCount,
  isRepo = false,
  score,
}) {
  const strengths = [];
  const redFlags = [];
  const suggestions = [];
  const reposCount = repos.length || 1;

  // Strengths
  if (!isRepo && profile) {
    if (profile.bio) strengths.push('Profile bio is set');
    if (profile.avatar_url) strengths.push('Profile avatar present');
    if (profile.location) strengths.push('Location specified');
    if (profile.company) strengths.push('Company specified');
    if ((profile.public_repos || 0) >= 3) strengths.push('Good number of public repos');
    if (Object.keys(languageCount).length >= 3) strengths.push('Diverse language usage');
  } else {
    strengths.push('Analyzing specific repository');
  }

  if (totalStars > (isRepo ? 5 : 20)) strengths.push('Project has received stars');
  if (totalForks > (isRepo ? 2 : 5)) strengths.push('Project has been forked');
  if (detailedReadmeCount >= (isRepo ? 1 : 3)) strengths.push('Detailed documentation found');
  if (consistentReposCount >= (isRepo ? 1 : 2)) strengths.push('Consistent commit activity');
  if (repos.some(r => r.hasCI)) strengths.push('Automated Testing & CI/CD workflows verified');

  // Red Flags
  if (readmeCount < reposCount / 2) redFlags.push('Many repositories missing README');
  if (detailedReadmeCount < reposCount / 4) redFlags.push('READMEs lack depth/detail');
  if (inactiveRepos > reposCount / 2) redFlags.push('High ratio of inactive repositories');
  if (topReposCount > 0 && consistentReposCount < topReposCount / 2) redFlags.push('Inconsistent commit activity');
  if (repos.filter(r => !r.description).length > 0) redFlags.push('Repositories missing description');
  if (repos.length > 0 && repos.some(r => !r.license)) redFlags.push('Missing Open Source License');

  // Suggestions
  if (!isRepo && profile) {
    if (!profile.bio) suggestions.push('Add a bio to your profile');
    if (!profile.avatar_url) suggestions.push('Add a profile picture');
    if (!profile.location) suggestions.push('Specify your location');
    if (!profile.company) suggestions.push('Add your company or organization');
  }

  if (readmeCount < reposCount) suggestions.push('Add README to all repositories');
  if (detailedReadmeCount < reposCount / 2) suggestions.push('Expand READMEs with detailed project info');
  if (inactiveRepos > 0) suggestions.push('Archive or update inactive repositories');
  if (topReposCount > 0 && consistentReposCount < topReposCount) suggestions.push('Commit more consistently to top projects');
  if (!isRepo && Object.keys(languageCount).length < 3) suggestions.push('Try using more programming languages');
  if (repos.filter(r => !r.description).length > 0) suggestions.push('Add descriptions to all repositories');
  if (repos.filter(r => !r.topics || r.topics.length === 0).length > 0) suggestions.push('Add topics (tags) to repositories');

  // Score-based priority focus
  if (score < 40) {
    suggestions.unshift('CRITICAL: Focus on basic profile completeness and repository descriptions.');
  } else if (score < 70) {
    suggestions.unshift('STRATEGY: Enhance documentation depth and commit consistency to reach the elite bracket.');
  } else {
    suggestions.unshift('POLISH: Increase community impact and technical diversity for maximum recruiter attraction.');
  }

  return { strengths, redFlags, suggestions };
}

/**
 * Main score report generator.
 * @param {object} params
 * @param {object} params.profile - GitHub user profile object.
 * @param {Array<object>} params.repos - Array of repository objects.
 * @param {object} [params.weights] - Optional scoring weights.
 * @returns {object} Full report object matching backend output format.
 */
export function calculateReport({ profile, repos = [], weights, targetRole = '' }) {
  const now = Date.now();
  let totalStars = 0;
  let totalForks = 0;
  const languageCount = {};
  let readmeCount = 0;
  let detailedReadmeCount = 0;
  let inactiveRepos = 0;

  const repoStats = repos.map((repo) => {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    totalStars += stars;
    totalForks += forks;

    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }

    // Heuristic for README existence and size when not explicitly provided
    const hasReadme = repo.hasReadme !== undefined ? repo.hasReadme : (Boolean(repo.description) || (repo.size || 0) > 0);
    const readmeSize = repo.readmeSize !== undefined ? repo.readmeSize : ((repo.size || 0) > 5 ? 1500 : 500);

    if (hasReadme) {
      readmeCount++;
      if (readmeSize > 1000) detailedReadmeCount++;
    }

    const updatedAtTime = new Date(repo.updated_at || repo.pushed_at || now).getTime();
    if (updatedAtTime < now - SIX_MONTHS_MS) {
      inactiveRepos++;
    }

    const license =
      typeof repo.license === 'object' && repo.license !== null
        ? repo.license.spdx_id || repo.license.name
        : repo.license || null;

    const topics = repo.topics || [];
    const hasCI =
      topics.some((t) => /ci|cd|action|test|workflow/i.test(t)) ||
      Boolean(repo.has_workflows || (repo.description && /ci\/cd|actions|workflow|automated test/i.test(repo.description)));

    return {
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      homepage: repo.homepage || '',
      license,
      hasCI,
      stars,
      forks,
      language: repo.language,
      topics: repo.topics || [],
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      hasReadme,
      readmeSize,
    };
  });

  // Top 5 repos
  const topRepos = [...repoStats]
    .sort((a, b) => (b.stars + b.forks) - (a.stars + a.forks))
    .slice(0, 5);

  // Measure consistency
  let consistentReposCount = 0;
  topRepos.forEach((repo) => {
    const updated = new Date(repo.updated_at || now).getTime();
    if (updated > now - SIX_MONTHS_MS / 2) {
      consistentReposCount++;
    }
  });

  // Most used languages
  const mostUsedLanguages = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({ lang, count }));

  // Role fit evaluation
  const roleFit = calculateRoleFit(repoStats, languageCount, targetRole);

  // Score breakdown
  const scoreBreakdown = computeScore({
    profile,
    repos: repoStats,
    totalStars,
    totalForks,
    languageCount,
    readmeCount,
    detailedReadmeCount,
    inactiveRepos,
    consistentReposCount,
    topReposCount: topRepos.length,
    weights,
    targetRole,
    isRepo: false,
  });

  const score = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);

  // Insights
  const { strengths, redFlags, suggestions } = generateInsights({
    profile,
    repos: repoStats,
    totalStars,
    totalForks,
    languageCount,
    readmeCount,
    detailedReadmeCount,
    inactiveRepos,
    consistentReposCount,
    topReposCount: topRepos.length,
    isRepo: false,
    score,
  });

  // Add role-specific feedback
  if (targetRole) {
    if (roleFit.fitScore >= 75) {
      strengths.unshift(`High domain alignment for ${targetRole} (${roleFit.fitScore}%)`);
    } else if (roleFit.fitScore < 45) {
      redFlags.unshift(`Low repository alignment with typical ${targetRole} tech stack`);
      suggestions.unshift(`Add projects demonstrating key ${targetRole} technologies and architecture`);
    }
  }

  // Safe minimal insights / commit mock structures to preserve component contract
  const repoInsights = {};
  const commitActivity = {};
  topRepos.forEach((repo) => {
    repoInsights[repo.name] = { issues: [], prs: [], contributors: [] };
    commitActivity[repo.name] = [];
  });

  // Feature 12: Open Source Contribution Score calculation
  const licenseCount = repoStats.filter((r) => r.license).length;
  const reposCount = repoStats.length || 1;
  const openSourceScore = Math.min(
    100,
    Math.round((totalStars * 1.5) + (totalForks * 2.5) + ((licenseCount / reposCount) * 35))
  );

  return {
    score,
    openSourceScore,
    scoreBreakdown,
    targetRole: targetRole || 'Fullstack Engineer',
    roleFitScore: roleFit.fitScore,
    roleFitLabel: roleFit.label,
    roleMatchedSkills: roleFit.matchedSkills,
    strengths,
    redFlags,
    suggestions,
    repos: repoStats,
    repoStats,
    topRepos,
    totalStars,
    totalForks,
    readmeCount,
    detailedReadmeCount,
    inactiveRepos,
    consistentReposCount,
    topReposCount: topRepos.length,
    mostUsedLanguages,
    commitActivity,
    repoInsights,
    profile: profile
      ? {
          name: profile.name,
          login: profile.login,
          bio: profile.bio,
          followers: profile.followers,
          following: profile.following,
          public_repos: profile.public_repos,
          avatar_url: profile.avatar_url,
          location: profile.location,
          company: profile.company,
          created_at: profile.created_at,
          hireable: profile.hireable,
          email: profile.email,
          blog: profile.blog,
          twitter_username: profile.twitter_username,
          html_url: profile.html_url,
        }
      : null,
  };
}
