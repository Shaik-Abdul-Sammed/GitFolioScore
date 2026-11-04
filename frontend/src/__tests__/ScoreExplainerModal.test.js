import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScoreExplainerModal from '../components/ScoreExplainerModal';

describe('ScoreExplainerModal Component', () => {
  const mockReport = {
    score: 78,
    profile: {
      login: 'sarahdev',
      name: 'Sarah Connor',
      bio: 'Cloud architecture & fullstack systems',
    },
    scoreBreakdown: {
      profile: 12,
      repoQuality: 20,
      activity: 14,
      impact: 12,
      diversity: 8,
      docs: 6,
    },
    roleFitScore: 82,
    roleMatchedSkills: ['TypeScript', 'Node.js', 'PostgreSQL'],
    strengths: ['High TypeScript usage', 'Consistent commit velocity'],
    redFlags: ['Missing license on secondary repos'],
    mostUsedLanguages: [['TypeScript', 10], ['Python', 5]],
    topRepos: [
      { name: 'cloud-agent', language: 'TypeScript', stars: 45, forks: 8, hasReadme: true },
    ],
  };

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders modal with score and diagnosis when isOpen is true', async () => {
    render(
      <ScoreExplainerModal
        isOpen={true}
        onClose={jest.fn()}
        report={mockReport}
        targetRole="Fullstack Engineer"
      />
    );

    expect(screen.getByText(/AI Score Explainer & Career Roadmap/i)).toBeInTheDocument();
    expect(screen.getAllByText(/78\/100/i).length).toBeGreaterThanOrEqual(1);

    // Verify Diagnosis tab is active by default
    await waitFor(() => {
      expect(screen.getByText(/Executive Diagnosis/i)).toBeInTheDocument();
      expect(screen.getByText(/Scoring Pillars Breakdown/i)).toBeInTheDocument();
    });
  });

  it('navigates through tabs: Role Alignment, Level-Up Roadmap, and Flagship Project', async () => {
    render(
      <ScoreExplainerModal
        isOpen={true}
        onClose={jest.fn()}
        report={mockReport}
        targetRole="Mobile Engineer"
      />
    );

    // Click Role Alignment Tab
    const alignmentTabBtn = screen.getByRole('button', { name: /Role Alignment/i });
    fireEvent.click(alignmentTabBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Domain Alignment for Mobile Engineer/i).length).toBeGreaterThanOrEqual(1);
    });

    // Click Level-Up Roadmap Tab
    const roadmapTabBtn = screen.getByRole('button', { name: /Level-Up Roadmap/i });
    fireEvent.click(roadmapTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/boost your score to/i)).toBeInTheDocument();
    });

    // Click Flagship Project Tab
    const projectTabBtn = screen.getByRole('button', { name: /Flagship Project/i });
    fireEvent.click(projectTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Why Recruiters Value This/i)).toBeInTheDocument();
    });
  });

  it('allows switching target career role and calls onRoleChange', async () => {
    const onRoleChange = jest.fn();
    render(
      <ScoreExplainerModal
        isOpen={true}
        onClose={jest.fn()}
        report={mockReport}
        targetRole="Fullstack Engineer"
        onRoleChange={onRoleChange}
      />
    );

    const roleSelect = screen.getByLabelText(/Target Career Role/i);
    fireEvent.change(roleSelect, { target: { value: 'DevOps & Cloud Engineer' } });

    expect(onRoleChange).toHaveBeenCalledWith('DevOps & Cloud Engineer');

    // Verify the diagnosis updates for DevOps
    await waitFor(() => {
      expect(screen.getAllByText(/DevOps & Cloud Engineer/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('copies career roadmap to clipboard and triggers onToast', async () => {
    const onToast = jest.fn();
    render(
      <ScoreExplainerModal
        isOpen={true}
        onClose={jest.fn()}
        report={mockReport}
        targetRole="Frontend Engineer"
        onToast={onToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy Career Roadmap/i })).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy Career Roadmap/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(onToast).toHaveBeenCalledWith('Career Strategy Roadmap copied to clipboard!');
  });

  it('calls onClose when close button or Done is clicked', () => {
    const onClose = jest.fn();
    render(
      <ScoreExplainerModal
        isOpen={true}
        onClose={onClose}
        report={mockReport}
        targetRole="Backend Engineer"
      />
    );

    const doneBtn = screen.getByRole('button', { name: /^Done$/i });
    fireEvent.click(doneBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
