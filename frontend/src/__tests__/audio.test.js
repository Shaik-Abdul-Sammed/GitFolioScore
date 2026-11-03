import { playLevelUpSound } from '../lib/audio';

describe('playLevelUpSound Web Audio Synthesizer', () => {
  it('does not throw when window.AudioContext is available or unavailable', () => {
    expect(() => playLevelUpSound()).not.toThrow();

    const mockStart = jest.fn();
    const mockStop = jest.fn();
    const mockConnect = jest.fn();
    const mockSetValueAtTime = jest.fn();
    const mockExponentialRampToValueAtTime = jest.fn();

    window.AudioContext = jest.fn().mockImplementation(() => ({
      currentTime: 0,
      state: 'running',
      createOscillator: () => ({
        type: 'sine',
        frequency: { setValueAtTime: mockSetValueAtTime },
        connect: mockConnect,
        start: mockStart,
        stop: mockStop,
      }),
      createGain: () => ({
        gain: {
          setValueAtTime: mockSetValueAtTime,
          exponentialRampToValueAtTime: mockExponentialRampToValueAtTime,
        },
        connect: mockConnect,
      }),
      destination: {},
    }));

    expect(() => playLevelUpSound()).not.toThrow();
    expect(window.AudioContext).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalledTimes(4);
    expect(mockStop).toHaveBeenCalledTimes(4);
  });
});
