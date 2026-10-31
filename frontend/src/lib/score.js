/**
 * Pure calculation logic for scoring a GitHub profile based on profile and repository data.
 * Faithful direct port of backend/utils/analyze.js.
 */

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

/**
 * Compute the overall portfolio score breakdown.
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
  isRepo = false,
}) {
  const w = {
    profile: 15,
    repoQuality: 25,
    activity: 20,
    impact: 20,
    diversity: 10,
    docs: 10,
    ...(weights || {}),
  };

  // Profile completeness
  let profileScore = 0;
  if (!isRepo && profile) {
    if (profile.bio) profileScore += w.profile * 0.2;
    if (profile.avatar_url) profileScore += w.profile * 0.2;
    if (profile.location) profileScore += w.profile * 0.2;
    if (profile.company) profileScore += w.profile * 0.2;
    if ((profile.public_repos || 0) >= 3) profileScore += w.profile * 0.2;
  } else {
    profileScore = w.profile;
  }

  // Repo quality
  let repoQuality = 0;
  const reposCount = repos.length || 1;
  const withDesc = repos.filter(r => r.description).length;
  const withTopics = repos.filter(r => r.topics && r.topics.length > 0).length;
  repoQuality += Math.min(w.repoQuality * 0.4, (withDesc / reposCount) * w.repoQuality * 0.4);
  repoQuality += Math.min(w.repoQuality * 0.4, (withTopics / reposCount) * w.repoQuality * 0.4);

  // Detailed README bonus in quality
  const detailedRatio = detailedReadmeCount / reposCount;
  repoQuality += Math.min(w.repoQuality * 0.2, detailedRatio * w.repoQuality * 0.2);

  // Activity consistency
  let activity = 0;
  const activeRepos = repos.length - inactiveRepos;
  activity += Math.min(w.activity * 0.6, (activeRepos / reposCount) * w.activity * 0.6);
  if (topReposCount > 0) {
    activity += Math.min(w.activity * 0.4, (consistentReposCount / topReposCount) * w.activity * 0.4);
  }

  // Project impact
  let impact = 0;
  impact += Math.min(w.impact * 0.5, (totalStars / (isRepo ? 10 : 50)) * w.impact * 0.5);
  impact += Math.min(w.impact * 0.5, (totalForks / (isRepo ? 5 : 20)) * w.impact * 0.5);

  // Language diversity
  let diversity = 0;
  if (!isRepo) {
    diversity += Math.min(w.diversity, Object.keys(languageCount).length * 2);
  } else {
    diversity = w.diversity;
  }

  // README + docs
  let docs = 0;
  docs += Math.min(w.docs, (readmeCount / reposCount) * w.docs);

  return {
    profile: Math.round(profileScore),
    repoQuality: Math.round(repoQuality),
    activity: Math.round(activity),
    impact: Math.round(impact),
    diversity: Math.round(diversity),
    docs: Math.round(docs),
  };
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
export function calculateReport({ profile, repos = [], weights }) {
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

    return {
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      homepage: repo.homepage || '',
      license,
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
    strengths,
    redFlags,
    suggestions,
    repoStats,
    topRepos,
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
