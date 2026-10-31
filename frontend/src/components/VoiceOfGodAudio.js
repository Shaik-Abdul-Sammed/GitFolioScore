import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

function VoiceOfGodAudio({ username, score, advice }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setSupported(false);
    }

    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleToggle = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    synthRef.current.cancel(); // Stop any pending speech

    const summary = advice?.summary || `Developer @${username} holds an overall score of ${score} out of 100. With strategic documentation upgrades and targeted testing rigor, reaching elite engineering tiers is imminent.`;
    const action = advice?.actions?.[0]?.action ? ` Priority directive: ${advice.actions[0].action}` : '';
    const textToSpeak = `Greetings, developer @${username}. Here is the supreme verdict of your portfolio: ${summary}${action}. Code with relentless precision.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // "Voice of God" Deep Pitch & Deliberate Tempo
    utterance.pitch = 0.65;
    utterance.rate = 0.88;

    const voices = synthRef.current.getVoices?.() || [];
    // Prioritize deep male/authoritative English voices
    const deepVoice =
      voices.find((v) => v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('alex')) ||
      voices.find((v) => v.name.toLowerCase().includes('google') && v.lang.startsWith('en')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (deepVoice) {
      utterance.voice = deepVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
          isPlaying
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 ring-2 ring-rose-500/30'
            : 'bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white border border-white/10'
        }`}
        title="Hear the AI Career Coach summary narrated in a deep, authoritative Voice of God"
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 text-rose-400" />
            <span>Mute Voice of God</span>
            {/* Pulsing sound wave equalizer */}
            <div className="flex items-end gap-0.5 h-3 ml-1">
              <span className="w-0.5 h-full bg-rose-400 animate-pulse" />
              <span className="w-0.5 h-2 bg-rose-400 animate-pulse delay-75" />
              <span className="w-0.5 h-3 bg-rose-400 animate-pulse delay-150" />
            </div>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>{'"Voice of God" Summary'}</span>
          </>
        )}
      </button>
    </div>
  );
}

export default VoiceOfGodAudio;
