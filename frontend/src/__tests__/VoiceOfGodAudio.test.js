import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceOfGodAudio from '../components/VoiceOfGodAudio';

describe('VoiceOfGodAudio', () => {
  beforeEach(() => {
    window.speechSynthesis = {
      speaking: false,
      speak: jest.fn(),
      cancel: jest.fn(),
      getVoices: jest.fn().mockReturnValue([
        { name: 'Daniel', lang: 'en-US' },
      ]),
    };
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
      text,
      pitch: 1,
      rate: 1,
    }));
  });

  it('renders Voice of God button and speaks with deep pitch on click', () => {
    render(
      <VoiceOfGodAudio
        username="octocat"
        score={88}
        advice={{ summary: 'Great developer velocity and code hygiene.' }}
      />
    );

    const btn = screen.getByText(/"Voice of God" Summary/i);
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(screen.getByText(/Mute Voice of God/i)).toBeInTheDocument();
  });
});
