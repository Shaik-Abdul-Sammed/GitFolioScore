import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';
import { FEATURE_TABS, FEATURES } from './featureHubData';

// Modals
import {
  MockInterviewModal,
  CoverLetterModal,
  ColdEmailModal,
  SalaryEstimatorModal,
  StarMethodModal,
} from './CareerInterviewTools';
import {
  DependencyCheckerModal,
  LicenseCheckerModal,
  BranchHygieneModal,
  PrReviewSimulatorModal,
  ReadmeLinterModal,
} from './CodeHealthTools';
import {
  PortfolioSiteGeneratorModal,
  CaseStudyGeneratorModal,
  ProfileReadmeModal,
  DevPersonaModal,
  ResumeScannerModal,
} from './PortfolioBrandingTools';
import {
  GoodFirstIssuesModal,
  ContributionMatchmakerModal,
  HackathonScoutModal,
  DeveloperMatchmakerModal,
  MentorMatcherModal,
} from './CommunityTools';
import {
  CodeChurnModal,
  BusFactorModal,
  ActionsAuditorModal,
  GrowthVelocityModal,
  WhatToBuildNextModal,
} from './AnalyticsTools';

function FeatureHub({ data, username, topRepos = [], languages = [], onToast, onRewardXP }) {
  const [activeTab, setActiveTab] = useState('career');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalId, setActiveModalId] = useState(null);

  const effectiveRepos = topRepos?.length > 0 ? topRepos : (data?.topRepos || []);
  const effectiveLanguages = languages?.length > 0 ? languages : (data?.mostUsedLanguages || []);
  const effectiveScore = data?.score || 85;
  const effectiveProfile = data?.profile || { login: username || 'octocat', name: username || 'Octocat' };

  const filteredFeatures = FEATURES.filter((f) => {
    const matchesTab = searchQuery.trim() ? true : f.tab === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderActiveModal = () => {
    if (!activeModalId) return null;

    const commonProps = {
      username: username || 'developer',
      score: effectiveScore,
      profile: effectiveProfile,
      topRepos: effectiveRepos,
      repos: effectiveRepos,
      languages: effectiveLanguages,
      onClose: () => setActiveModalId(null),
      onToast,
      onRewardXP,
    };

    switch (activeModalId) {
      // TAB 1
      case 'mock-interview':
        return <MockInterviewModal {...commonProps} />;
      case 'cover-letter':
        return <CoverLetterModal {...commonProps} />;
      case 'cold-email':
        return <ColdEmailModal {...commonProps} />;
      case 'salary-estimator':
        return <SalaryEstimatorModal {...commonProps} />;
      case 'star-method':
        return <StarMethodModal {...commonProps} />;

      // TAB 2
      case 'dep-checker':
        return <DependencyCheckerModal {...commonProps} />;
      case 'license-checker':
        return <LicenseCheckerModal {...commonProps} />;
      case 'branch-hygiene':
        return <BranchHygieneModal {...commonProps} />;
      case 'pr-reviewer':
        return <PrReviewSimulatorModal {...commonProps} />;
      case 'readme-linter':
        return <ReadmeLinterModal {...commonProps} />;

      // TAB 3
      case 'portfolio-site':
        return <PortfolioSiteGeneratorModal {...commonProps} />;
      case 'case-study':
        return <CaseStudyGeneratorModal {...commonProps} />;
      case 'profile-readme':
        return <ProfileReadmeModal {...commonProps} />;
      case 'dev-persona':
        return <DevPersonaModal {...commonProps} />;
      case 'resume-scanner':
        return <ResumeScannerModal {...commonProps} />;

      // TAB 4
      case 'good-first-issues':
        return <GoodFirstIssuesModal {...commonProps} />;
      case 'contrib-matcher':
        return <ContributionMatchmakerModal {...commonProps} />;
      case 'hackathon-scout':
        return <HackathonScoutModal {...commonProps} />;
      case 'dev-matchmaker':
        return <DeveloperMatchmakerModal {...commonProps} />;
      case 'mentor-matcher':
        return <MentorMatcherModal {...commonProps} />;

      // TAB 5
      case 'code-churn':
        return <CodeChurnModal {...commonProps} />;
      case 'bus-factor':
        return <BusFactorModal {...commonProps} />;
      case 'actions-auditor':
        return <ActionsAuditorModal {...commonProps} />;
      case 'growth-velocity':
        return <GrowthVelocityModal {...commonProps} />;
      case 'what-to-build':
        return <WhatToBuildNextModal {...commonProps} />;

      default:
        return null;
    }
  };

  return (
    <section className="space-y-6 pt-4 animate-fade-in-up" data-testid="feature-hub">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl relative overflow-hidden manga-halftone-card">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-gaming">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>DEVELOPER COMMAND CENTER · 25 PRO TOOLS</span>
          </div>
          <h3 className="text-2xl font-black text-white font-gaming tracking-tight">
            Feature Hub &amp; Career Suite
          </h3>
          <p className="text-xs text-gray-400 max-w-xl">
            Empower your GitHub engineering career with AI mock interviews, code hygiene audits, custom portfolio generators, and salary benchmarks.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative z-10 w-full md:w-72">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 25 tools..."
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      {!searchQuery && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide select-none">
          {FEATURE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-900/80 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setActiveModalId(tool.id)}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-indigo-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer group flex flex-col justify-between manga-halftone-card"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md border border-white/15 transition-transform group-hover:scale-110"
                  style={{ background: tool.gradient }}
                >
                  {tool.icon}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-mono">
                  {tool.badge}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                  <span>{tool.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-400" />
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed mt-1 line-clamp-2">
                  {tool.desc}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-indigo-400 group-hover:underline">
                Launch Tool →
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Instant Access</span>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Modal Dialog */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md modal-backdrop-fade">
          <div
            className="fixed inset-0"
            onClick={() => setActiveModalId(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xl rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl max-h-[85vh] overflow-y-auto pb-16 manga-panel-modal">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalId(null)}
              className="sticky top-0 float-right -mt-2 -mr-2 p-2 rounded-xl text-gray-400 hover:text-white bg-slate-900/95 hover:bg-slate-800 border border-white/10 transition z-30 shadow-md backdrop-blur-md"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {renderActiveModal()}
          </div>
        </div>
      )}
    </section>
  );
}

export default FeatureHub;
