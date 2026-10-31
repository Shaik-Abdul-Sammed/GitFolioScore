import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SecurityScanModal from '../components/SecurityScanModal';

describe('SecurityScanModal', () => {
  it('opens modal and renders security audit report', async () => {
    window.anna = {
      llm: {
        complete: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            securityGrade: 'A+',
            breachSimCount: 0,
            leaksSummary: 'No credentials exposed in public repos.',
            findings: [{ type: 'safe', title: 'Clean Repos', desc: 'No keys leaked.' }],
            recommendations: ['Enable 2FA'],
          }),
        }),
      },
    };

    render(<SecurityScanModal username="octocat" repos={[{ name: 'app' }]} />);

    const launchBtn = screen.getByText(/Launch Security Scan/i);
    fireEvent.click(launchBtn);

    await waitFor(() => {
      expect(screen.getByText(/OSINT Security & Secret Exposure Audit/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('A+')).toBeInTheDocument();
    });

    expect(screen.getByText(/No credentials exposed in public repos/i)).toBeInTheDocument();
  });
});
