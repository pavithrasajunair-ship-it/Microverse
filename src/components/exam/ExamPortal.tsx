import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Flag, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';
import { QUESTION_BANK } from '../../data/questions';
import { LEARNING_MODULES } from '../../data/modules';
import { ModuleId, Question } from '../../types';
import { useProgress } from '../../context/ProgressContext';

type ExamMode =
  | 'Practice Mode'
  | 'Timed Exam Mode'
  | 'Topic-Wise Test'
  | 'Full Syllabus Mock'
  | 'Coding & Assembly Challenge';

type ExamPhase = 'config' | 'active' | 'results';

export const QuestionDiagramSnippet: React.FC<{ hint: NonNullable<Question['diagramHint']> }> = ({ hint }) => {
  if (hint === '8085-flag-register') {
    return (
      <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 overflow-x-auto">
        <div className="grid grid-cols-8 gap-1.5 font-mono text-center text-xs min-w-[400px]">
          {['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'].map((b, i) => (
            <div key={b} className={`rounded-lg py-2 border ${[0, 1, 3, 5, 7].includes(i) ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300' : 'border-slate-800 bg-slate-900 text-slate-600'}`}>
              <div className="text-[10px] opacity-70">{b}</div>
              <div className="font-bold mt-0.5">{[0, 1, 3, 5, 7].includes(i) ? '?' : 'X'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (hint === '8085-bus-demux') {
    return (
      <svg viewBox="0 0 460 110" className="w-full max-w-lg rounded-xl bg-slate-950 border border-slate-800 p-2">
        <rect x="16" y="25" width="110" height="60" rx="8" fill="#172554" stroke="#38bdf8" />
        <text x="71" y="59" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">8085 CPU</text>
        <line x1="126" y1="45" x2="205" y2="45" stroke="#a78bfa" strokeWidth="2.5" />
        <text x="165" y="38" textAnchor="middle" fill="#c4b5fd" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">AD0–AD7</text>
        <line x1="126" y1="72" x2="205" y2="72" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
        <text x="165" y="88" textAnchor="middle" fill="#fcd34d" fontSize="10" fontFamily="IBM Plex Mono, monospace">Pin 30 (?)</text>
        <rect x="205" y="25" width="115" height="60" rx="8" fill="#1e293b" stroke="#94a3b8" />
        <text x="262" y="52" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">74LS373 Latch</text>
        <text x="262" y="70" textAnchor="middle" fill="#94a3b8" fontSize="9.5">Enable (G)</text>
        <line x1="320" y1="55" x2="435" y2="55" stroke="#34d399" strokeWidth="2.5" />
        <text x="380" y="46" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontFamily="IBM Plex Mono, monospace">Latched A0–A7</text>
      </svg>
    );
  }
  if (hint === '8086-phys-addr') {
    return (
      <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 font-mono text-xs text-cyan-300">
        [ 16-bit Segment (CS = 2400H) ] ──(Shift Left 4 bits / ×10H)──▶ [ 20-bit Adder ] ◀── [ Offset (IP = 1234H) ]
      </div>
    );
  }
  if (hint === '8051-ram-bank') {
    return (
      <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 grid grid-cols-3 gap-2 font-mono text-xs text-center">
        <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">00H–1FH<br />4 Reg Banks</div>
        <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">? – ?<br />128 Bit-Addr</div>
        <div className="p-2 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300">30H–7FH<br />Scratchpad</div>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 font-mono text-xs text-amber-300">
      8255 Control Word: [ D7:I/O | D6-D5:PA Mode | D4:PA Dir | D3:PCU Dir | D2:PB Mode | D1:PB Dir | D0:PCL Dir ]
    </div>
  );
};

interface Props {
  onReviseTopic: (topicId: string) => void;
}

export const ExamPortal: React.FC<Props> = ({ onReviseTopic }) => {
  const { recordQuizAttempt } = useProgress();
  const [phase, setPhase] = useState<ExamPhase>('config');
  const [mode, setMode] = useState<ExamMode>('Timed Exam Mode');
  const [moduleFilter, setModuleFilter] = useState<'all' | ModuleId>('all');
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [durationMin, setDurationMin] = useState<number>(15);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(900);

  const startExam = () => {
    let pool = QUESTION_BANK.filter((q) => q.format !== 'match');
    if (moduleFilter !== 'all') {
      pool = pool.filter((q) => q.moduleId === moduleFilter);
    }
    if (mode === 'Coding & Assembly Challenge') {
      const codePool = pool.filter((q) => q.format === 'predict-output' || q.format === 'find-error' || q.format === 'numerical');
      if (codePool.length >= 3) pool = codePool;
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, pool.length));
    setQuestions(shuffled);
    setAnswers({});
    setMarked({});
    setCurrentIdx(0);
    setShowHint(false);
    setSecondsLeft(durationMin * 60);
    setPhase('active');
  };

  useEffect(() => {
    if (phase !== 'active' || mode === 'Practice Mode') return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase, mode, secondsLeft]);

  const isAnswerCorrect = (q: Question, ans: string | string[] | undefined): boolean => {
    if (ans === undefined) return false;
    if (Array.isArray(q.correctAnswer)) {
      if (!Array.isArray(ans)) return false;
      const a = [...ans].sort().join(',');
      const b = [...q.correctAnswer].sort().join(',');
      return a === b;
    }
    return String(ans).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
  };

  const results = useMemo(() => {
    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    const topicStats: Record<string, { name: string; correct: number; total: number }> = {};

    for (const q of questions) {
      maxScore += q.marks;
      if (!topicStats[q.topicId]) {
        topicStats[q.topicId] = { name: q.topicName, correct: 0, total: 0 };
      }
      topicStats[q.topicId].total += 1;

      const userAns = answers[q.id];
      const hasAns = Array.isArray(userAns) ? userAns.length > 0 : Boolean(userAns && String(userAns).trim());
      if (hasAns) {
        if (isAnswerCorrect(q, userAns)) {
          score += q.marks;
          correctCount += 1;
          topicStats[q.topicId].correct += 1;
        } else if (negativeMarking) {
          score = Math.max(0, score - 0.25 * q.marks);
        }
      }
    }

    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const weakTopics = Object.entries(topicStats)
      .filter(([, s]) => s.correct / s.total < 0.7)
      .map(([id]) => id);

    return { score, maxScore, correctCount, accuracy, topicStats, weakTopics };
  }, [questions, answers, negativeMarking]);

  const handleSubmit = () => {
    recordQuizAttempt({
      id: `exam-${Date.now()}`,
      dateIso: new Date().toISOString(),
      mode,
      moduleFilter,
      score: Number(results.score.toFixed(2)),
      maxScore: results.maxScore,
      accuracy: results.accuracy,
      totalQuestions: questions.length,
      correctCount: results.correctCount,
      weakTopics: results.weakTopics,
    });
    setPhase('results');
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // CONFIG SCREEN
  if (phase === 'config') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            University Exam Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Realistic CBT examination environment with question palette, countdown timer, negative marking option, and deep solution diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">1. Choose Examination Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
                {(['Practice Mode', 'Timed Exam Mode', 'Topic-Wise Test', 'Full Syllabus Mock', 'Coding & Assembly Challenge'] as ExamMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      mode === m
                        ? 'border-blue-500 bg-blue-600/15 text-blue-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">2. Syllabus Scope</label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value as 'all' | ModuleId)}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm"
                >
                  <option value="all">Full Syllabus (All 5 Modules)</option>
                  {LEARNING_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>{m.number} · {m.shortTitle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">3. Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono"
                >
                  {[5, 8, 12, 18].map((n) => (
                    <option key={n} value={n}>{n} Questions</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">4. Duration</label>
                <select
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  disabled={mode === 'Practice Mode'}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono disabled:opacity-50"
                >
                  {[10, 15, 30, 45].map((n) => (
                    <option key={n} value={n}>{n} Minutes</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                Enable Negative Marking (−0.25 per wrong answer)
              </label>

              <button
                type="button"
                onClick={startExam}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer"
              >
                Launch Examination
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-3 text-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white">Exam Integrity &amp; Scoring</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Questions are curated engineering assessment items spanning MCQs, Multi-Select, Diagram Identification, Assembly Output Prediction, Code Debugging, and Hexadecimal Numericals.
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div>• Full question palette navigation &amp; Mark for Review</div>
              <div>• Detailed explanation for correct &amp; incorrect options</div>
              <div>• Automatic weak-topic detection &amp; XP rewards</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE CBT EXAM SCREEN
  if (phase === 'active' && questions[currentIdx]) {
    const q = questions[currentIdx];
    const currentAns = answers[q.id];

    const toggleMulti = (idxStr: string) => {
      const prev = Array.isArray(currentAns) ? currentAns : [];
      const next = prev.includes(idxStr) ? prev.filter((x) => x !== idxStr) : [...prev, idxStr];
      setAnswers((a) => ({ ...a, [q.id]: next }));
    };

    return (
      <div className="space-y-5">
        {/* Top CBT Bar */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {mode} · Question {currentIdx + 1} of {questions.length}
          </div>
          <div className="flex items-center gap-4">
            {mode !== 'Practice Mode' && (
              <div className={`inline-flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums ${secondsLeft < 60 ? 'text-rose-500' : 'text-blue-600 dark:text-cyan-400'}`}>
                <Clock className="w-4 h-4" />
                {formatClock(secondsLeft)}
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Question Stage */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{q.topicName} · {q.difficulty} · {q.marks} {q.marks > 1 ? 'Marks' : 'Mark'}</span>
              <span className="font-mono uppercase">{q.format.replace('-', ' ')}</span>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
              {q.prompt}
            </h2>

            {q.codeSnippet && (
              <pre className="rounded-xl bg-slate-950 text-cyan-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                {q.codeSnippet}
              </pre>
            )}

            {q.diagramHint && <QuestionDiagramSnippet hint={q.diagramHint} />}

            {/* Response Controls */}
            {q.options ? (
              <div className="space-y-2.5">
                {q.options.map((opt, idx) => {
                  const key = String(idx);
                  const selected =
                    q.format === 'multi-select'
                      ? Array.isArray(currentAns) && currentAns.includes(key)
                      : currentAns === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        q.format === 'multi-select'
                          ? toggleMulti(key)
                          : setAnswers((a) => ({ ...a, [q.id]: key }))
                      }
                      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all cursor-pointer flex items-center gap-3 ${
                        selected
                          ? 'border-blue-500 bg-blue-600/15 text-slate-900 dark:text-white font-medium'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-mono text-xs w-6 h-6 rounded-md border border-current flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Enter your exact answer:</label>
                <input
                  value={typeof currentAns === 'string' ? currentAns : ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Type value (e.g. 003CH or 4.33)"
                  className="w-full max-w-sm px-4 py-3 rounded-xl font-mono text-base bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>
            )}

            {mode === 'Practice Mode' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHint((h) => !h)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? 'Hide Hint' : 'Need a Hint?'}
                </button>
                {showHint && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                    {q.hint}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                    marked[q.id]
                      ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {marked[q.id] ? 'Marked for Review' : 'Mark for Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers((a) => { const copy = { ...a }; delete copy[q.id]; return copy; })}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Clear Response
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => { setCurrentIdx((i) => i - 1); setShowHint(false); }}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-xs font-medium cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => { setCurrentIdx((i) => i + 1); setShowHint(false); }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                >
                  Save &amp; Next
                </button>
              </div>
            </div>
          </div>

          {/* Right: Question Palette */}
          <aside className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2 font-mono text-xs">
              {questions.map((item, idx) => {
                const ans = answers[item.id];
                const answered = Array.isArray(ans) ? ans.length > 0 : Boolean(ans && String(ans).trim());
                const isMarked = marked[item.id];
                const isCur = idx === currentIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setCurrentIdx(idx); setShowHint(false); }}
                    className={`h-10 rounded-lg border font-semibold cursor-pointer transition-all tabular-nums ${
                      isCur
                        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-600 text-white'
                        : isMarked
                          ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-300'
                          : answered
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}{isMarked ? '*' : ''}
                  </button>
                );
              })}
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <span>Answered: {Object.keys(answers).length}</span>
              <span>Marked (*): {Object.values(marked).filter(Boolean).length}</span>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // RESULTS & DETAILED EXPLANATION SCREEN
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-blue-600 dark:text-cyan-400">EXAMINATION PERFORMANCE REPORT</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{mode} Completed</h2>
          </div>
          <button
            type="button"
            onClick={() => setPhase('config')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Take Another Test
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500">Score</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {results.score.toFixed(2)} / {results.maxScore}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500">Accuracy</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-cyan-400 mt-1 tabular-nums">{results.accuracy}%</div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500">Correct</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {results.correctCount} / {questions.length}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500">Weak Topics</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              {results.weakTopics.length}
            </div>
          </div>
        </div>

        {results.weakTopics.length > 0 && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-2">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">Recommended Revision Areas</div>
            <div className="flex flex-wrap gap-2">
              {results.weakTopics.map((tid) => (
                <button
                  key={tid}
                  type="button"
                  onClick={() => onReviseTopic(tid)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-500/40 text-xs font-medium text-slate-800 dark:text-slate-100 hover:border-blue-500 cursor-pointer"
                >
                  Revise: {results.topicStats[tid]?.name ?? tid} →
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Solution Review */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Detailed Answer Explanations</h3>
        {questions.map((q, idx) => {
          const userAns = answers[q.id];
          const ok = isAnswerCorrect(q, userAns);
          return (
            <div key={q.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {idx + 1}. {q.prompt}
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {ok ? 'Correct' : 'Needs Review'}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>
                  <span className="font-semibold">Correct Answer: </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {Array.isArray(q.correctAnswer)
                      ? q.correctAnswer.map((i) => q.options?.[Number(i)] ?? i).join(' ; ')
                      : q.options
                        ? q.options[Number(q.correctAnswer)]
                        : q.correctAnswer}
                  </span>
                </div>
                <p className="leading-relaxed pt-1">{q.explanation}</p>
              </div>

              {q.optionExplanations && q.options && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 dark:bg-slate-900/70 p-2.5 text-slate-600 dark:text-slate-300">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{String.fromCharCode(65 + i)}. </span>
                      {q.optionExplanations?.[String(i)] ?? opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
