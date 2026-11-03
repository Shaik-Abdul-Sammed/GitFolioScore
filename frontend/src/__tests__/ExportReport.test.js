import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportReport from '../components/ExportReport';

// Mock html2canvas
jest.mock('html2canvas', () => {
  return function mockHtml2Canvas() {
    return Promise.resolve({
      width: 800,
      height: 600,
      toDataURL: () => 'data:image/png;base64,mockPng',
      toBlob: (cb) => {
        if (typeof cb === 'function') cb(new Blob(['mockPng'], { type: 'image/png' }));
      },
    });
  };
});

// Mock jspdf constructor
jest.mock('jspdf', () => {
  return function MockJsPDF() {
    this.internal = {
      pageSize: {
        getWidth: () => 595,
        getHeight: () => 842,
      },
    };
    this.setFillColor = jest.fn();
    this.rect = jest.fn();
    this.setFont = jest.fn();
    this.setFontSize = jest.fn();
    this.setTextColor = jest.fn();
    this.text = jest.fn();
    this.roundedRect = jest.fn();
    this.splitTextToSize = jest.fn(() => ['line 1', 'line 2']);
    this.setDrawColor = jest.fn();
    this.setLineWidth = jest.fn();
    this.line = jest.fn();
    this.addImage = jest.fn();
    this.save = jest.fn();
    this.output = jest.fn((type) => {
      if (type === 'bloburl') return 'blob:https://mock-domain/mock-pdf-uuid';
      return new Blob(['mockPdf'], { type: 'application/pdf' });
    });
  };
});

describe('ExportReport Component', () => {
  const originalRevoke = URL.revokeObjectURL;
  const originalCreate = URL.createObjectURL;

  beforeAll(() => {
    window.URL.revokeObjectURL = jest.fn();
    window.URL.createObjectURL = jest.fn(() => 'blob:https://mock-domain/mock-blob-uuid');
    if (typeof global.URL !== 'undefined') {
      global.URL.revokeObjectURL = window.URL.revokeObjectURL;
      global.URL.createObjectURL = window.URL.createObjectURL;
    }
  });

  afterAll(() => {
    window.URL.revokeObjectURL = originalRevoke;
    window.URL.createObjectURL = originalCreate;
    if (typeof global.URL !== 'undefined') {
      global.URL.revokeObjectURL = originalRevoke;
      global.URL.createObjectURL = originalCreate;
    }
  });

  const mockData = {
    score: 85,
    profile: {
      login: 'torvalds',
      bio: 'Linux creator',
      public_repos: 10,
      followers: 150000,
    },
    topRepos: [
      { name: 'linux', stars: 170000, forks: 50000, language: 'C', description: 'Kernel source' },
    ],
    mostUsedLanguages: [{ lang: 'C', percentage: 90 }],
    scoreBreakdown: { repoQuality: 90, docs: 85, activity: 80, impact: 95, diversity: 70 },
  };

  it('renders export buttons', () => {
    const ref = { current: document.createElement('div') };
    render(<ExportReport targetRef={ref} username="torvalds" data={mockData} />);
    expect(screen.getByText('Export PNG')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('opens preview modal before download on clicking Export PDF', async () => {
    const ref = { current: document.createElement('div') };
    render(<ExportReport targetRef={ref} username="torvalds" data={mockData} onToast={jest.fn()} />);

    const pdfBtn = screen.getByText('Export PDF');
    fireEvent.click(pdfBtn);

    await waitFor(() => {
      expect(screen.getByText(/Preview Before Download/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/PDF DOCUMENT/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download File/i })).toBeInTheDocument();

    // Clicking cancel closes the modal and revokes Blob URL
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Preview Before Download/i)).not.toBeInTheDocument();
    });
  });

  it('opens preview modal before download on clicking Export PNG', async () => {
    const ref = { current: document.createElement('div') };
    render(<ExportReport targetRef={ref} username="torvalds" data={mockData} onToast={jest.fn()} />);

    const pngBtn = screen.getByText('Export PNG');
    fireEvent.click(pngBtn);

    await waitFor(() => {
      expect(screen.getByText(/Preview Before Download/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/PNG SCORECARD/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download File/i })).toBeInTheDocument();
  });
});
