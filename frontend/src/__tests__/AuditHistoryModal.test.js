import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuditHistoryModal from '../components/AuditHistoryModal';
import * as auditHistoryLib from '../lib/auditHistory';

jest.mock('../lib/auditHistory', () => ({
  loadAuditHistory: jest.fn(),
  updateAuditEntry: jest.fn(),
  deleteAuditEntry: jest.fn(),
  clearAuditHistory: jest.fn(),
  getClaimedPortfolio: jest.fn(),
  setClaimedPortfolio: jest.fn(),
}));

describe('AuditHistoryModal Component', () => {
  const mockHistory = [
    {
      id: 'audit-1',
      username: 'torvalds',
      name: 'Linus Torvalds',
      avatar_url: 'https://avatars.githubusercontent.com/u/1024025',
      score: 85,
      targetRole: 'DevOps & Cloud Engineer',
      roleFitScore: 88,
      roleFitLabel: 'Target Role Specialist',
      scoreBreakdown: { profile: 15, repoQuality: 25 },
      scoreDelta: 0,
      timestamp: Date.now() - 1000 * 60 * 10,
      notes: 'Initial evaluation',
      tags: ['Linux', 'Kernel'],
    },
    {
      id: 'audit-2',
      username: 'gaearon',
      name: 'Dan Abramov',
      avatar_url: 'https://avatars.githubusercontent.com/u/810438',
      score: 92,
      targetRole: 'Frontend Engineer',
      roleFitScore: 95,
      roleFitLabel: 'Target Role Specialist',
      scoreBreakdown: { profile: 15, repoQuality: 25 },
      scoreDelta: 4,
      timestamp: Date.now() - 1000 * 60 * 60,
      notes: 'React architect',
      tags: ['React', 'Frontend'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    auditHistoryLib.loadAuditHistory.mockResolvedValue(mockHistory);
    auditHistoryLib.getClaimedPortfolio.mockResolvedValue(null);
  });

  it('renders modal with audit items and allows filtering', async () => {
    render(
      <AuditHistoryModal
        isOpen={true}
        onClose={jest.fn()}
        onSelectAudit={jest.fn()}
        onToast={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('@torvalds')).toBeInTheDocument();
      expect(screen.getByText('@gaearon')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Score:').length).toBeGreaterThan(0);
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();

    // Filter by search query
    const searchInput = screen.getByPlaceholderText(/Filter by username/i);
    fireEvent.change(searchInput, { target: { value: 'gaearon' } });

    expect(screen.queryByText('@torvalds')).not.toBeInTheDocument();
    expect(screen.getByText('@gaearon')).toBeInTheDocument();
  });

  it('triggers onSelectAudit when clicking Load Audit', async () => {
    const handleSelectAudit = jest.fn();
    const handleClose = jest.fn();

    render(
      <AuditHistoryModal
        isOpen={true}
        onClose={handleClose}
        onSelectAudit={handleSelectAudit}
        onToast={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('@torvalds')).toBeInTheDocument();
    });

    const loadButtons = screen.getAllByText('Load Audit');
    fireEvent.click(loadButtons[0]);

    expect(handleSelectAudit).toHaveBeenCalledWith('torvalds', 'DevOps & Cloud Engineer', false);
    expect(handleClose).toHaveBeenCalled();
  });
});
