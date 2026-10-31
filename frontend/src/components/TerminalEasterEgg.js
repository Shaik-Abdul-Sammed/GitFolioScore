import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Minimize2, Maximize2, Send } from 'lucide-react';

function TerminalEasterEgg({ username, score, data, advice }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [matrixMode, setMatrixMode] = useState(false);
  const [history, setHistory] = useState([
    { text: 'GitFolioScore Interactive Terminal v2.4.0', type: 'system' },
    { text: 'Type "help" to see available developer commands.', type: 'info' },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      if (typeof bottomRef.current?.scrollIntoView === 'function') {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [history, open, minimized]);

  const handleCommand = async (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setInput('');
    const newHistory = [...history, { text: `user@gitfolioscore:~$ ${cmd}`, type: 'user' }];
    setHistory(newHistory);

    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      setHistory((prev) => [
        ...prev,
        {
          text: `Available commands:
  help                    - Display this manual
  score                   - Display ASCII score card & tier
  sudo make me a sandwich - Secret privileged easter egg
  whoami                  - Inspect active user profile
  roast                   - Instant terminal roast
  matrix                  - Toggle Matrix digital rain theme
  advice                  - View primary AI career recommendation
  clear                   - Clear terminal screen
  exit                    - Close terminal`,
          type: 'output',
        },
      ]);
      return;
    }

    if (lower === 'clear') {
      setHistory([]);
      return;
    }

    if (lower === 'exit') {
      setOpen(false);
      return;
    }

    if (lower === 'matrix') {
      setMatrixMode((m) => !m);
      setHistory((prev) => [
        ...prev,
        { text: matrixMode ? 'Matrix mode disabled.' : 'Matrix digital mode ACTIVATED. Follow the white rabbit 🐇', type: 'success' },
      ]);
      return;
    }

    if (lower === 'score') {
      const s = score || data?.score || 'N/A';
      setHistory((prev) => [
        ...prev,
        {
          text: `
+---------------------------------------+
|  GitFolioScore Audit for @${(username || 'anonymous').padEnd(12)}|
+---------------------------------------+
|  Overall Score : ${String(s).padEnd(20)}|
|  Profile Spec  : ${(data?.breakdown?.profile || 15)}/15 pts              |
|  Repo Quality  : ${(data?.breakdown?.repoQuality || 20)}/25 pts              |
|  Activity      : ${(data?.breakdown?.activity || 18)}/20 pts              |
|  Impact (Stars): ${(data?.breakdown?.impact || 14)}/20 pts              |
|  Documentation : ${(data?.breakdown?.docs || 8)}/10 pts              |
+---------------------------------------+`,
          type: 'code',
        },
      ]);
      return;
    }

    if (lower === 'whoami') {
      setHistory((prev) => [
        ...prev,
        {
          text: `User: @${username || 'not specified'}\nPublic Repos: ${data?.repos?.length || 0}\nStars: ${data?.totalStars || 0}\nTarget Role: Full-Stack Engineer`,
          type: 'output',
        },
      ]);
      return;
    }

    if (lower === 'advice') {
      const adv = advice?.actions?.[0]?.action || 'Audit and optimize your top 3 repositories with detailed READMEs.';
      setHistory((prev) => [
        ...prev,
        { text: `[AI Coach Action] ${adv}`, type: 'output' },
      ]);
      return;
    }

    if (lower === 'sudo make me a sandwich') {
      setLoading(true);
      try {
        let reply = "Okay. 🥪 [AI Privilege Granted: A magnificent sourdough sandwich with zero bugs, 100% test coverage, and a side of crisp documentation.]";
        if (window?.anna?.llm?.complete) {
          const res = await window.anna.llm.complete({
            system: 'You are a humorous Linux terminal kernel. The user typed "sudo make me a sandwich". Give a short witty response granting the sandwich.',
            prompt: 'sudo make me a sandwich',
          });
          if (res?.text) reply = res.text.trim();
        }
        setHistory((prev) => [...prev, { text: reply, type: 'success' }]);
      } catch {
        setHistory((prev) => [
          ...prev,
          { text: "Okay. 🥪 [Sandwich generated successfully with root permissions!]", type: 'success' },
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (lower === 'roast') {
      setHistory((prev) => [
        ...prev,
        {
          text: `[Roast] @${username || 'developer'}: You have repos with 0 commits in 18 months that you still listed on your LinkedIn. Brave move.`,
          type: 'warning',
        },
      ]);
      return;
    }

    // Default: Ask LLM as terminal assistant
    setLoading(true);
    try {
      let aiText = `bash: ${cmd}: command not found. Type "help" for a list of commands.`;
      if (window?.anna?.llm?.complete) {
        const resp = await window.anna.llm.complete({
          system: 'You are a helpful UNIX CLI terminal assistant for a GitHub portfolio auditor. Answer very concisely in 1-2 sentences.',
          prompt: cmd,
        });
        if (resp?.text) {
          aiText = resp.text.trim();
        }
      }
      setHistory((prev) => [...prev, { text: aiText, type: 'output' }]);
    } catch {
      setHistory((prev) => [
        ...prev,
        { text: `bash: ${cmd}: command not found. Type "help" for a list of commands.`, type: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Terminal Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400 bg-slate-950/90 border border-emerald-500/30 backdrop-blur-md shadow-2xl hover:border-emerald-400 hover:bg-slate-900 transition active:scale-95 group"
          title="Open Developer Terminal Easter Egg"
        >
          <Terminal className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
          <span>&gt;_ terminal</span>
        </button>
      )}

      {/* Terminal Window */}
      {open && (
        <div
          className={`fixed left-4 sm:left-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[500px] rounded-2xl border overflow-hidden shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
            matrixMode
              ? 'bg-black/95 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
              : 'bg-slate-950/95 border-white/15 text-gray-200 shadow-black/80'
          }`}
          style={{ maxHeight: minimized ? '48px' : '380px' }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 cursor-pointer" onClick={() => setOpen(false)} />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 cursor-pointer" onClick={() => setMinimized(!minimized)} />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 cursor-pointer" onClick={() => setMatrixMode(!matrixMode)} />
              <span className="ml-2 text-xs font-mono font-semibold text-gray-300">
                terminal — gitfolioscore
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMinimized(!minimized)}
                className="p-1 rounded text-gray-400 hover:text-white"
                aria-label="Minimize"
              >
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white"
                aria-label="Close terminal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <div className="flex flex-col h-[320px]">
              {/* Output area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      h.type === 'user'
                        ? 'text-indigo-300 font-bold'
                        : h.type === 'error'
                        ? 'text-rose-400'
                        : h.type === 'success'
                        ? 'text-emerald-400'
                        : h.type === 'warning'
                        ? 'text-amber-300'
                        : h.type === 'code'
                        ? 'text-cyan-300 font-mono'
                        : 'text-gray-300'
                    }`}
                  >
                    {h.text}
                  </div>
                ))}
                {loading && (
                  <div className="text-xs text-indigo-400 animate-pulse font-mono">
                    Executing kernel process...
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleCommand}
                className="flex items-center gap-2 px-3 py-2 bg-black/40 border-t border-white/10"
              >
                <span className="text-emerald-400 font-mono text-xs select-none">&gt;</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="type a command (e.g. help, score, sudo make me a sandwich)..."
                  className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none placeholder:text-gray-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-1 rounded text-gray-400 hover:text-emerald-400 disabled:opacity-30 transition"
                  aria-label="Send command"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default TerminalEasterEgg;
