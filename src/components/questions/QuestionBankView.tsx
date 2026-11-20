import React, { useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, Eye, Lightbulb, Search } from 'lucide-react';
import { QUESTION_BANK } from '../../data/questions';
import { LEARNING_MODULES } from '../../data/modules';
import { ModuleId, QuestionFormat } from '../../types';
import { useProgress } from '../../context/ProgressContext';
import { QuestionDiagramSnippet } from '../exam/ExamPortal';

export const QuestionBankView: React.FC = () => {
  const { progress, toggleBookmarkQuestion } = useProgress();
  const [moduleFilter, setModuleFilter] = useState<'all' | ModuleId>('all');
  const [difficulty, setDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [format, setFormat] = useState<'all' | QuestionFormat>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [query, setQuery] = useState('');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return QUESTION_BANK.filter((q) => {
      if (moduleFilter !== 'all' && q.moduleId !== moduleFilter) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      if (format !== 'all' && q.format !== format) return false;
      if (onlyBookmarked && !progress.bookmarkedQuestionIds.includes(q.id)) return false;
      if (query.trim()) {
        const needle = query.toLowerCase();
        return (
          q.prompt.toLowerCase().includes(needle) ||
          q.topicName.toLowerCase().includes(needle) ||
          q.explanation.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [moduleFilter, difficulty, format, onlyBookmarked, query, progress.bookmarkedQuestionIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Visual Question Bank
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Filterable engineering problems across all 5 modules. All items are transparently labeled as MicroVerse Curated Practice or Conceptual Exam Patterns (no fabricated past-year university labels).
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
          Showing {filtered.length} of {QUESTION_BANK.length} questions
        </span>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value as 'all' | ModuleId)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
        >
          <option value="all">All Modules</option>
          {LEARNING_MODULES.map((m) => (
            <option key={m.id} value={m.id}>{m.shortTitle}</option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
        >
          <option value="all">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'all' | QuestionFormat)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
        >
          <option value="all">All Question Types</option>
          <option value="mcq">MCQ</option>
          <option value="multi-select">Multi-Select</option>
          <option value="true-false">True / False</option>
          <option value="diagram-id">Diagram ID</option>
          <option value="predict-output">Predict Output</option>
          <option value="find-error">Find Error</option>
          <option value="numerical">Numerical</option>
          <option value="fill-blank">Fill in Blank</option>
          <option value="application">Application</option>
          <option value="match">Match Following</option>
        </select>

        <button
          type="button"
          onClick={() => setOnlyBookmarked((b) => !b)}
          className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer ${
            onlyBookmarked
              ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300'
              : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {onlyBookmarked ? 'Showing Bookmarked' : 'Bookmarks Only'}
        </button>
      </div>

      {/* Question Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-10 text-center text-sm text-slate-500">
          No questions match the current filters. Try clearing your search or selecting All Modules.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => {
            const isBookmarked = progress.bookmarkedQuestionIds.includes(q.id);
            const isOpen = Boolean(revealed[q.id]);
            return (
              <div key={q.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-blue-600 dark:text-cyan-400">{q.topicName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.sourceLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBookmarkQuestion(q.id)}
                    className={`inline-flex items-center gap-1 cursor-pointer ${isBookmarked ? 'text-amber-500 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </button>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">{q.prompt}</p>

                {q.codeSnippet && (
                  <pre className="rounded-xl bg-slate-950 text-cyan-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                    {q.codeSnippet}
                  </pre>
                )}

                {q.diagramHint && <QuestionDiagramSnippet hint={q.diagramHint} />}

                {q.matchPairs && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {q.matchPairs.map((pair, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span>{pair.left}</span>
                        <span className="text-blue-600 dark:text-cyan-400">→ {isOpen ? pair.right : '???'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, idx) => {
                      const key = String(idx);
                      const isCorrect = Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.includes(key)
                        : q.correctAnswer === key;
                      const isPicked = picked[q.id] === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setPicked((p) => ({ ...p, [q.id]: key }));
                            setRevealed((r) => ({ ...r, [q.id]: true }));
                          }}
                          className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                            isOpen && isCorrect
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : isOpen && isPicked && !isCorrect
                                ? 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-mono font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Hint: {q.hint}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => ({ ...r, [q.id]: !r[q.id] }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-medium cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isOpen ? 'Hide Solution' : 'Reveal Solution'}
                  </button>
                </div>

                {isOpen && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Answer:{' '}
                      {q.matchPairs
                        ? 'See matched arrows above'
                        : Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.map((i) => q.options?.[Number(i)]).join(' | ')
                          : q.options
                            ? q.options[Number(q.correctAnswer)]
                            : q.correctAnswer}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
