import React, { useState } from 'react';
import { Shield, ShieldCheck, Lock, RefreshCw, X, AlertTriangle, CheckCircle } from 'lucide-react';

function SecurityScanModal({ username, repos = [], profile = {}, onToast, onRewardXP }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState(null);

  const handleStartScan = async () => {
    setScanning(true);
    setReport(null);

    // Reward XP if callback provided
    if (onRewardXP) {
      onRewardXP(10, 'Security Audit Scan');
    }

    try {
      let scanResult = null;
      if (window?.anna?.llm?.complete) {
        const prompt = `Simulate an ethical OSINT Dark Web & Repository Secret Exposure audit for GitHub user @${username}.
Profile email: ${profile?.email || 'hidden / noreply'}
Public repos count: ${repos.length}

Generate a realistic cybersecurity hygiene report in ONLY valid JSON:
{
  "securityGrade": "A-",
  "breachSimCount": 2,
  "leaksSummary": "No active AWS or private keys found in recent public commits. Detected 2 historical database breaches associated with legacy username across paste-sites.",
  "findings": [
    {"type": "safe", "title": "Commit Secret Hygiene", "desc": "No hardcoded plaintext API keys or private keys (.env, id_rsa) in master branch."},
    {"type": "warning", "title": "Email Header Visibility", "desc": "Git commit authors contain personal address instead of privacy-protected noreply email."},
    {"type": "safe", "title": "Dependabot Alerts", "desc": "Zero critical zero-day dependencies exposed in public package files."}
  ],
  "recommendations": [
    "Enable GitHub Private Email setting (Keep my email addresses private)",
    "Enforce GPG Commit Signature Verification for all new pushes",
    "Add pre-commit git hooks using gitleaks or truffleHog"
  ]
}`;

        const resp = await window.anna.llm.complete(
          {
            system: 'You are a cybersecurity penetration testing auditor. Output ONLY valid JSON.',
            prompt,
            temperature: 0.5,
          },
          { timeoutMs: 45000 }
        );

        const raw = resp?.text || '';
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          scanResult = JSON.parse(match[0]);
        }
      }

      if (!scanResult) {
        // Fallback simulation
        scanResult = {
          securityGrade: 'A-',
          breachSimCount: 1,
          leaksSummary: `No active credentials leaked in @${username}'s repositories. 1 historical credential exposure detected in 2021 aggregate breaches.`,
          findings: [
            { type: 'safe', title: 'Repo Secret Scan', desc: 'No plaintext API tokens or AWS credentials committed to top repositories.' },
            { type: 'warning', title: 'Commit Author Privacy', desc: 'Public commit metadata reveals non-anonymized email headers.' },
            { type: 'safe', title: 'License Protection', desc: 'Open source repositories have standard OSI license attribution.' },
          ],
          recommendations: [
            'Configure GitHub Email Privacy (Settings > Emails > Keep my email addresses private)',
            'Implement pre-commit secret scanners like gitleaks',
            'Rotate Personal Access Tokens (PAT) every 90 days',
          ],
        };
      }

      setReport(scanResult);
      if (onToast) {
        onToast('Simulated security audit complete! +10 XP awarded.', 'success');
      }
    } catch {
      // Fallback
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      {/* Trigger Card / Button */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Simulated Dark Web & Secret Exposure Scan
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Security OSINT
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Audit commit history for leaked API secrets, exposed emails, and historical data breach exposure.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              if (!report) handleStartScan();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95"
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Launch Security Scan 🛡️</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl max-h-[85vh] overflow-y-auto pb-20 space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">
                  OSINT Security & Secret Exposure Audit
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {scanning && (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-cyan-400" />
                <p className="text-xs text-gray-300 font-mono animate-pulse">
                  Querying simulated threat intelligence & commit hashes...
                </p>
              </div>
            )}

            {!scanning && report && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-cyan-400">Security Posture Grade</div>
                    <div className="text-2xl font-black text-white mt-0.5">{report.securityGrade}</div>
                    <p className="text-xs text-cyan-200/90 mt-1">{report.leaksSummary}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Simulated Breaches</span>
                    <div className="text-xl font-mono font-bold text-amber-400">{report.breachSimCount}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-300">Detailed Findings:</div>
                  {(report.findings || []).map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs flex items-start gap-2.5">
                      {f.type === 'safe' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-white">{f.title}</div>
                        <div className="text-gray-400 text-[11px] mt-0.5">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1.5">
                  <div className="text-[11px] font-bold text-indigo-400">Security Hardening Recommendations:</div>
                  <ul className="text-[11px] text-gray-300 space-y-1">
                    {(report.recommendations || []).map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleStartScan}
                disabled={scanning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-scan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SecurityScanModal;
