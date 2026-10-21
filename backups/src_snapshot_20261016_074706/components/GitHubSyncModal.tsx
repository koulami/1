import React, { useState, useEffect } from 'react';
import {
  Github, GitBranch, Key, CheckCircle2, AlertTriangle,
  RefreshCw, Download, Upload, Copy, Check, ExternalLink,
  Layers, FileCode, Shield, Sparkles
} from 'lucide-react';
import { GameState, Language, Question } from '../types/game';
import { translations } from '../locales/translations';
import { syncService } from '../services/storage';
import { sound } from '../services/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onRestoreBackup: (state: GameState) => void;
  onApplyQuestions: (questions: Question[]) => void;
  currentQuestionCount: number;
}

export const GitHubSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onRestoreBackup,
  onApplyQuestions,
  currentQuestionCount
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'github' | 'paste' | 'help'>('github');
  const [repo, setRepo] = useState<string>('koulami/Koulami-vultures');
  const [branch, setBranch] = useState<string>('main');
  const [token, setToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [repoStatus, setRepoStatus] = useState<{
    accessible?: boolean;
    isPrivate?: boolean;
    status?: number;
    message?: string;
    checked?: boolean;
  }>({});

  const [pastedContent, setPastedContent] = useState<string>('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Check repo status whenever modal opens or repo changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const checkRepo = async () => {
      setCheckingStatus(true);
      try {
        const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').trim();
        const res = await fetch(`/api/github/check-repo?repo=${encodeURIComponent(cleanRepo)}${token ? `&token=${encodeURIComponent(token.trim())}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setRepoStatus({
              accessible: data.accessible,
              isPrivate: data.isPrivate,
              status: data.status,
              message: data.message,
              checked: true
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setRepoStatus({ accessible: false, message: err.message, checked: true });
        }
      } finally {
        if (isMounted) setCheckingStatus(false);
      }
    };

    checkRepo();
    return () => {
      isMounted = false;
    };
  }, [isOpen, repo, token]);

  if (!isOpen) return null;

  const handleConnectAndRestore = async () => {
    setIsLoading(true);
    setResultMessage(null);

    try {
      const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').trim();
      const res = await fetch('/api/github/connect-and-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: cleanRepo,
          branch: branch.trim() || undefined,
          token: token.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setResultMessage({
          type: 'error',
          text: data.error || data.message || 'Αποτυχία σύνδεσης με το GitHub.'
        });
        sound.playTimerAlert();
        setIsLoading(false);
        return;
      }

      if (data.has31VulturesLocally) {
        sound.playSuccess();
        setResultMessage({
          type: 'info',
          text: `ℹ️ ${data.message}`
        });
        return;
      }

      // Success! If questions or full state were retrieved
      let recoveredCount = 0;
      if (data.parsedGameState && Array.isArray(data.parsedGameState.questions)) {
        onRestoreBackup(data.parsedGameState);
        recoveredCount = data.parsedGameState.questions.length;
      } else if (Array.isArray(data.parsedQuestions) && data.parsedQuestions.length > 0) {
        onApplyQuestions(data.parsedQuestions);
        recoveredCount = data.parsedQuestions.length;
      } else if (data.filePath?.endsWith('.ts')) {
        // The defaultGame.ts file was saved to disk
        // We will notify the user and offer a page reload to re-read defaultGame.ts
        setResultMessage({
          type: 'success',
          text: `✓ Το αρχείο ${data.filePath} ανακτήθηκε επιτυχώς από το GitHub (${cleanRepo}) και αποθηκεύτηκε στο project!`
        });
        sound.playSuccess();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      sound.playSuccess();
      setResultMessage({
        type: 'success',
        text: `✓ Επιτυχής ανάκτηση! Φορτώθηκαν ${recoveredCount > 0 ? recoveredCount : 'οι'} αποστολές από το αποθετήριο ${cleanRepo} (${data.filePath}).`
      });

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Σφάλμα δικτύου κατά την επικοινωνία με το GitHub.'
      });
      sound.playTimerAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPastedContent = async () => {
    setPasteError(null);
    if (!pastedContent.trim()) {
      setPasteError(lang === 'el' ? 'Παρακαλώ επικολλήστε κώδικα TypeScript ή JSON.' : 'Please paste TypeScript code or JSON.');
      return;
    }

    setIsLoading(true);

    try {
      const trimmed = pastedContent.trim();

      // Case A: Is it JSON?
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            onApplyQuestions(parsed);
            sound.playSuccess();
            setResultMessage({
              type: 'success',
              text: `✓ Εφαρμόστηκαν επιτυχώς ${parsed.length} αποστολές!`
            });
            setTimeout(() => onClose(), 2000);
            return;
          }
          if (parsed.questions && Array.isArray(parsed.questions)) {
            onRestoreBackup(parsed);
            sound.playSuccess();
            setResultMessage({
              type: 'success',
              text: `✓ Επαναφέρθηκε πλήρως το παιχνίδι με ${parsed.questions.length} αποστολές!`
            });
            setTimeout(() => onClose(), 2000);
            return;
          }
        } catch {
          // not pure json, continue to TS case
        }
      }

      // Case B: Is it TypeScript content (e.g. defaultGame.ts)?
      if (trimmed.includes('INITIAL_GAME_STATE') || trimmed.includes('questions:')) {
        const res = await fetch('/api/github/direct-restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: trimmed,
            filename: 'defaultGame.ts'
          })
        });

        if (res.ok) {
          sound.playSuccess();
          setResultMessage({
            type: 'success',
            text: '✓ Το αρχείο defaultGame.ts αποθηκεύτηκε επιτυχώς στον διακομιστή! Γίνεται επαναφόρτωση...'
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
      }

      setPasteError(
        lang === 'el'
          ? 'Δεν αναγνωρίστηκε έγκυρη δομή αποστολών (απαιτείται JSON array αποστολών ή κώδικας defaultGame.ts).'
          : 'Valid quest structure not found (requires JSON array or defaultGame.ts code).'
      );
    } catch (err: any) {
      setPasteError(err.message || 'Σφάλμα επεξεργασίας');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>{lang === 'el' ? 'Σύνδεση με GitHub & Ανάκτηση Αποστολών' : 'GitHub Sync & Quests Recovery'}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  31 Γύπες
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'el'
                  ? 'Σύνδεση με το αποθετήριο koulami/Koulami-vultures για ανάκτηση των 31 αποστολών με τους γύπες.'
                  : 'Connect to repository koulami/Koulami-vultures to restore the 31 vulture quests.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'github'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>{lang === 'el' ? 'Σύνδεση GitHub' : 'GitHub Connect'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'paste'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>{lang === 'el' ? 'Άμεση Επικόλληση / Αρχείο' : 'Direct Paste / File'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('help')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'help'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{lang === 'el' ? 'Οδηγίες Private Repo' : 'Private Repo Guide'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Diagnostic Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {checkingStatus ? (
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                ) : repoStatus.accessible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : repoStatus.isPrivate ? (
                  <Shield className="w-5 h-5 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span>Αποθετήριο:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-amber-300">
                    {repo}
                  </code>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {checkingStatus ? (
                    'Έλεγχος προσβασιμότητας στο GitHub...'
                  ) : repoStatus.accessible ? (
                    <span className="text-emerald-400 font-semibold">
                      ✓ Το αποθετήριο είναι προσβάσιμο! Έτοιμο για ανάκτηση.
                    </span>
                  ) : repoStatus.isPrivate ? (
                    <span className="text-amber-300">
                      🔒 <strong>Ιδιωτικό Αποθετήριο (Private Repo):</strong> Το GitHub αποκρύπτει τα ιδιωτικά αποθετήρια. Για να διαβάσουμε τις 31 αποστολές, απαιτείται είτε να γίνει <strong>Public</strong> είτε να εισαγάγετε <strong>Personal Access Token (PAT)</strong>.
                    </span>
                  ) : (
                    repoStatus.message || 'Δεν βρέθηκε'
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setRepoStatus({});
                const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').trim();
                fetch(`/api/github/check-repo?repo=${encodeURIComponent(cleanRepo)}${token ? `&token=${encodeURIComponent(token.trim())}` : ''}`)
                  .then(r => r.json())
                  .then(d => setRepoStatus({ accessible: d.accessible, isPrivate: d.isPrivate, status: d.status, message: d.message, checked: true }))
                  .catch(() => {});
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs shrink-0 cursor-pointer"
              title="Επανέλεγχος"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {resultMessage && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fadeIn ${
                resultMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                  : resultMessage.type === 'info'
                  ? 'bg-amber-950/80 border border-amber-500/80 text-amber-200'
                  : 'bg-rose-950/80 border border-rose-500 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {resultMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : resultMessage.type === 'info' ? (
                  <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className="font-medium leading-relaxed">{resultMessage.text}</span>
              </div>
              {resultMessage.type === 'info' && (
                <a
                  href="/api/export-defaultgame-ts"
                  download="defaultGame.ts"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Λήψη defaultGame.ts</span>
                </a>
              )}
            </div>
          )}

          {/* TAB 1: GITHUB CONNECTION */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  GitHub Repository
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                      github.com/
                    </span>
                    <input
                      type="text"
                      value={repo.replace(/^https?:\/\/github\.com\//, '')}
                      onChange={(e) => setRepo(e.target.value.trim())}
                      placeholder="koulami/Koulami-vultures"
                      className="w-full pl-24 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value.trim())}
                    placeholder="main"
                    title="Κλάδος (Branch)"
                    className="w-24 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Personal Access Token (PAT)</span>
                    <span className="text-[10px] text-slate-500 font-normal lowercase">(μόνο αν είναι private)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                  >
                    {showToken ? 'Απόκρυψη' : 'Εμφάνιση'}
                  </button>
                </div>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Εάν το αποθετήριο <strong>koulami/Koulami-vultures</strong> είναι Private, επικολλήστε ένα token με δικαίωμα <code>repo</code>. Εάν το κάνετε <strong>Public</strong> στο GitHub, δεν χρειάζεται κανένα token!
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleConnectAndRestore}
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Σύνδεση & Ανάκτηση...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      <span>🐙 Σύνδεση & Ανάκτηση (31 Αποστολές Γύπες)</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://github.com/${repo.replace(/^https?:\/\/github\.com\//, '')}/settings`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Ρυθμίσεις Repo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT PASTE / FILE UPLOAD */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Επικόλληση Κώδικα ή JSON Αποστολών
                  </label>
                  <label className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Άνοιγμα Αρχείου (.ts ή .json)</span>
                    <input
                      type="file"
                      accept=".ts,.js,.json,application/json,text/plain"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          setPastedContent((evt.target?.result as string) || '');
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={8}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Επικολλήστε εδώ τα περιεχόμενα του defaultGame.ts των γυπών, ή ένα JSON array με τις 31 αποστολές..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              {pasteError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{pasteError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleApplyPastedContent}
                disabled={isLoading || !pastedContent.trim()}
                className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Επεξεργασία...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Εφαρμογή & Αποθήκευση στο Project</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: HELP & GUIDE */}
          {activeTab === 'help' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <span>💡 Γιατί εμφανίζεται «Private Repo» για το koulami/Koulami-vultures;</span>
                </h4>
                <p>
                  Το GitHub για λόγους ασφαλείας επιστρέφει σφάλμα 404 (Not Found) σε οποιονδήποτε προσπαθεί να διαβάσει ένα ιδιωτικό αποθετήριο χωρίς έγκριση, ώστε να μην αποκαλύπτεται καν η ύπαρξή του.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
                  Πώς να το συνδέσετε αμέσως (3 Τρόποι):
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 block text-xs">
                    1. Κάντε το repository Public στο GitHub (Πιο γρήγορο):
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Μεταβείτε στο <code>github.com/koulami/Koulami-vultures/settings</code> ➔ General ➔ κύλιση στο κάτω μέρος <strong>Danger Zone</strong> ➔ <strong>Change repository visibility</strong> ➔ <strong>Make public</strong>.
                    Έπειτα επιστρέψτε εδώ και πατήστε «🐙 Σύνδεση & Ανάκτηση»!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-sky-400 block text-xs">
                    2. Δημιουργήστε Personal Access Token στο GitHub (Χωρίς αλλαγή public):
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Μεταβείτε στο <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-sky-300 underline font-semibold">github.com/settings/tokens</a> ➔ Generate new token (classic) ➔ επιλέξτε το checkbox <code>repo</code> ➔ Αντιγράψτε το κλειδί και επικολλήστε το στο πεδίο Token στην καρτέλα «Σύνδεση GitHub».
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-emerald-400 block text-xs">
                    3. Άμεση επικόλληση κώδικα ή αρχείου:
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Εάν έχετε αποθηκευμένο το αρχείο στον υπολογιστή σας ή στο πρόχειρο, πατήστε την καρτέλα <strong>«Άμεση Επικόλληση / Αρχείο»</strong> παραπάνω, επικολλήστε το και πατήστε «Εφαρμογή»!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div>
            Τρέχουσες αποστολές στο BoundPad: <strong className="text-slate-200">{currentQuestionCount}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
};
