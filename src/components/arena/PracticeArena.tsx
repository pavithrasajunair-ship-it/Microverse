import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Flame, RotateCcw, Terminal, Timer, Zap } from 'lucide-react';
import { FLASHCARDS, VIVA_PROMPTS } from '../../data/notes';
import { QUESTION_BANK } from '../../data/questions';
import { ACHIEVEMENT_BADGES, useProgress } from '../../context/ProgressContext';

type ArenaTab = 'battle' | 'predict' | 'flashcards' | 'viva' | 'memmap' | 'badges';

interface PredictChallenge {
  id: string;
  title: string;
  code: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const PREDICT_CHALLENGES: PredictChallenge[] = [
  {
    id: 'p1',
    title: 'Rotate Left with Carry',
    code: `MVI A, 85H   ; 1000 0101B
RLC          ; Rotate A left, D7→D0 & CY
HLT`,
    question: 'What are A and CY after RLC executes?',
    options: ['A = 0BH, CY = 1', 'A = 0AH, CY = 1', 'A = 0BH, CY = 0', 'A = 42H, CY = 1'],
    correctIdx: 0,
    explanation: '1000 0101B rotated left moves D7=1 into both D0 and CY → 0000 1011B = 0BH, CY = 1.',
  },
  {
    id: 'p2',
    title: 'XOR Self-Clear Idiom',
    code: `MVI A, 7FH
STC          ; CY = 1
XRA A        ; A = A XOR A
HLT`,
    question: 'What are A, Z, and CY after XRA A?',
    options: ['A = 00H, Z = 1, CY = 1', 'A = 00H, Z = 1, CY = 0', 'A = FFH, Z = 0, CY = 0', 'A = 7FH, Z = 0, CY = 1'],
    correctIdx: 1,
    explanation: 'XRA A clears A to 00H (1 byte, 4T — faster than MVI A, 00H!), sets Z=1, P=1, and always clears CY=0 and AC=0.',
  },
  {
    id: 'p3',
    title: 'Compare vs Subtract',
    code: `MVI A, 25H
MVI B, 40H
CMP B
HLT`,
    question: 'What are A, Z, and CY after CMP B?',
    options: ['A = E5H, Z = 0, CY = 1', 'A = 25H, Z = 0, CY = 1', 'A = 25H, Z = 0, CY = 0', 'A = 40H, Z = 1, CY = 0'],
    correctIdx: 1,
    explanation: 'CMP B computes A − B internally without altering A (so A remains 25H). Since A (25H) < B (40H), borrow occurs → CY = 1, Z = 0.',
  },
];

const MEM_CHALLENGES = [
  { size: '2 KB RAM', start: '2000H', answer: '27FFH', lines: 'A0–A10 (11 lines)', hint: '2 KB = 2048 bytes = 0800H → 2000H + 07FFH.' },
  { size: '4 KB EPROM', start: '0000H', answer: '0FFFH', lines: 'A0–A11 (12 lines)', hint: '4 KB = 4096 bytes = 1000H → 0000H + 0FFFH.' },
  { size: '8 KB RAM', start: '8000H', answer: '9FFFH', lines: 'A0–A12 (13 lines)', hint: '8 KB = 8192 bytes = 2000H → 8000H + 1FFFH.' },
];

export const PracticeArena: React.FC<{ onTryInLab: (code: string) => void }> = ({ onTryInLab }) => {
  const { progress, addXp, toggleMasteredFlashcard } = useProgress();
  const [tab, setTab] = useState<ArenaTab>('battle');

  // Concept Battle State
  const battleQuestions = QUESTION_BANK.filter((q) => q.options && !Array.isArray(q.correctAnswer));
  const [battleActive, setBattleActive] = useState(false);
  const [battleTime, setBattleTime] = useState(45);
  const [battleIdx, setBattleIdx] = useState(0);
  const [battleScore, setBattleScore] = useState(0);
  const [battleCombo, setBattleCombo] = useState(0);

  useEffect(() => {
    if (!battleActive) return;
    if (battleTime <= 0) {
      setBattleActive(false);
      if (battleScore > 0) addXp(battleScore * 10);
      return;
    }
    const id = window.setInterval(() => setBattleTime((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [battleActive, battleTime]);

  const answerBattle = (optIdx: number) => {
    const cur = battleQuestions[battleIdx % battleQuestions.length];
    if (String(optIdx) === cur.correctAnswer) {
      setBattleScore((s) => s + 1);
      setBattleCombo((c) => c + 1);
    } else {
      setBattleCombo(0);
    }
    setBattleIdx((i) => i + 1);
  };

  // Predict Output State
  const [predictPicked, setPredictPicked] = useState<Record<string, number>>({});

  // Flashcard State
  const [fcIdx, setFcIdx] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const currentCard = FLASHCARDS[fcIdx];

  // Viva State
  const [vivaIdx, setVivaIdx] = useState(0);
  const [vivaDraft, setVivaDraft] = useState('');
  const [vivaRevealed, setVivaRevealed] = useState(false);
  const [vivaHint, setVivaHint] = useState(false);
  const vivaQ = VIVA_PROMPTS[vivaIdx];

  // Memory Mapping State
  const [memIdx, setMemIdx] = useState(0);
  const [memInput, setMemInput] = useState('');
  const [memStatus, setMemStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const memQ = MEM_CHALLENGES[memIdx];

  const checkMem = () => {
    if (memInput.trim().toUpperCase() === memQ.answer) {
      setMemStatus('correct');
      addXp(25);
    } else {
      setMemStatus('wrong');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Practice Arena &amp; Challenges
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Build reflexes and exam intuition through rapid-fire Concept Battles, Assembly Output Predictions, Flashcards, Viva Simulations, and Memory Mapping drills.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-[#0E1729] border border-slate-200 dark:border-slate-800">
        {(
          [
            ['battle', 'Concept Battle'],
            ['predict', 'Predict the Output'],
            ['flashcards', 'Flashcard Arena'],
            ['viva', 'Viva Simulator'],
            ['memmap', 'Memory Mapping'],
            ['badges', 'Badges & XP'],
          ] as Array<[ArenaTab, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              tab === id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 1. CONCEPT BATTLE */}
      {tab === 'battle' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-5">
          {!battleActive ? (
            <div className="text-center max-w-lg mx-auto py-6 space-y-4">
              <Zap className="w-10 h-10 text-blue-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">45-Second Concept Battle</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Answer as many rapid-fire 8085, 8086, 8051, and peripheral questions as possible before the clock hits zero. Earn +10 XP per correct answer.
              </p>
              {battleScore > 0 && (
                <div className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                  Last Run Score: {battleScore} correct (+{battleScore * 10} XP earned)
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setBattleScore(0);
                  setBattleCombo(0);
                  setBattleTime(45);
                  setBattleIdx(Math.floor(Math.random() * battleQuestions.length));
                  setBattleActive(true);
                }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer"
              >
                Start Rapid-Fire Battle
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between font-mono text-sm">
                <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-bold tabular-nums">
                  <Timer className="w-4 h-4" /> {battleTime}s
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-500 font-bold tabular-nums">
                  <Flame className="w-4 h-4" /> Streak: {battleCombo}
                </span>
                <span className="font-bold text-emerald-500 tabular-nums">Score: {battleScore}</span>
              </div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                {battleQuestions[battleIdx % battleQuestions.length].prompt}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {battleQuestions[battleIdx % battleQuestions.length].options?.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => answerBattle(idx)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-600/10 text-left text-sm cursor-pointer transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PREDICT THE OUTPUT */}
      {tab === 'predict' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {PREDICT_CHALLENGES.map((ch) => {
            const chosen = predictPicked[ch.id];
            const answered = chosen !== undefined;
            const correct = chosen === ch.correctIdx;
            return (
              <div key={ch.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{ch.title}</h3>
                  <pre className="rounded-xl bg-slate-950 text-cyan-200 p-3.5 font-mono text-xs border border-slate-800">
                    {ch.code}
                  </pre>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{ch.question}</p>
                  <div className="space-y-2">
                    {ch.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!answered && i === ch.correctIdx) addXp(20);
                          setPredictPicked((p) => ({ ...p, [ch.id]: i }));
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border font-mono text-xs cursor-pointer ${
                          answered && i === ch.correctIdx
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : answered && chosen === i && !correct
                              ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300'
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {answered && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">{ch.explanation}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onTryInLab(ch.code)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-medium cursor-pointer transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Verify in 8085 Emulator
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. FLASHCARD ARENA */}
      {tab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Card {fcIdx + 1} / {FLASHCARDS.length} · Module: {currentCard.moduleId.toUpperCase()}</span>
            <span>Mastered: {progress.masteredFlashcards.length} / {FLASHCARDS.length}</span>
          </div>

          <button
            type="button"
            onClick={() => setFcFlipped((f) => !f)}
            className="w-full min-h-[220px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 transition-colors"
          >
            <span className="text-xs font-mono text-blue-600 dark:text-cyan-400">
              {fcFlipped ? 'ANSWER (Click to Flip Back)' : 'CONCEPT PROMPT (Click to Reveal)'}
            </span>
            <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed max-w-lg">
              {fcFlipped ? currentCard.back : currentCard.front}
            </p>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => { setFcIdx((i) => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length); setFcFlipped(false); }}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium cursor-pointer"
            >
              Previous Card
            </button>
            <button
              type="button"
              onClick={() => toggleMasteredFlashcard(currentCard.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                progress.masteredFlashcards.includes(currentCard.id)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {progress.masteredFlashcards.includes(currentCard.id) ? 'Mastered' : 'Mark as Mastered'}
            </button>
            <button
              type="button"
              onClick={() => { setFcIdx((i) => (i + 1) % FLASHCARDS.length); setFcFlipped(false); }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* 4. VIVA SIMULATOR */}
      {tab === 'viva' && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Viva Question {vivaIdx + 1} / {VIVA_PROMPTS.length}</span>
            <span>Subject: {vivaQ.moduleId.toUpperCase()}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{vivaQ.question}</h3>
          <textarea
            rows={4}
            value={vivaDraft}
            onChange={(e) => setVivaDraft(e.target.value)}
            placeholder="Type your oral exam explanation here before checking the examiner rubric..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVivaHint((h) => !h)}
                className="px-3.5 py-2 rounded-lg border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-medium cursor-pointer"
              >
                {vivaHint ? 'Hide Examiner Hint' : 'Ask for Hint'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!vivaRevealed) addXp(15);
                  setVivaRevealed(true);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
              >
                Evaluate Against Model Answer
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setVivaIdx((i) => (i + 1) % VIVA_PROMPTS.length);
                setVivaDraft('');
                setVivaRevealed(false);
                setVivaHint(false);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              Next Viva Question →
            </button>
          </div>
          {vivaHint && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-slate-700 dark:text-slate-200">
              Hint: {vivaQ.hint}
            </div>
          )}
          {vivaRevealed && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2 text-xs">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">Examiner Model Answer</div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{vivaQ.modelAnswer}</p>
              <div className="pt-1 font-mono text-slate-600 dark:text-slate-300">
                Key Rubric Points: {vivaQ.keyPoints.join(' · ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. MEMORY MAPPING CHALLENGE */}
      {tab === 'memmap' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Memory Mapping Drill {memIdx + 1} / {MEM_CHALLENGES.length}</span>
            <span>{memQ.lines}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            A <span className="text-blue-600 dark:text-cyan-400">{memQ.size}</span> IC is mapped on an 8085 starting at <span className="font-mono">{memQ.start}</span>. What is its ending hex address?
          </h3>
          <div className="flex flex-wrap gap-2">
            <input
              value={memInput}
              onChange={(e) => { setMemInput(e.target.value); setMemStatus('idle'); }}
              placeholder="e.g. 27FFH"
              className="px-4 py-2.5 rounded-xl font-mono text-base bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
            />
            <button type="button" onClick={checkMem} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer">
              Verify Address
            </button>
            <button
              type="button"
              onClick={() => {
                setMemIdx((i) => (i + 1) % MEM_CHALLENGES.length);
                setMemInput('');
                setMemStatus('idle');
              }}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Next Problem
            </button>
          </div>
          {memStatus === 'correct' && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Exact match! {memQ.start} – {memQ.answer} (+25 XP). {memQ.hint}
            </div>
          )}
          {memStatus === 'wrong' && (
            <div className="text-xs text-rose-600 dark:text-rose-400">
              Not quite. Hint: {memQ.hint}
            </div>
          )}
        </div>
      )}

      {/* 6. BADGES & XP */}
      {tab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENT_BADGES.map((badge) => {
            const unlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-5 space-y-2 ${
                  unlocked
                    ? 'border-blue-500/40 bg-blue-600/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] opacity-65'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Award className={`w-6 h-6 ${unlocked ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="font-mono text-xs text-slate-500">+{badge.xpReward} XP</span>
                </div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">{badge.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">{badge.description}</p>
                <div className="text-[11px] font-mono text-blue-600 dark:text-cyan-400">
                  {unlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
