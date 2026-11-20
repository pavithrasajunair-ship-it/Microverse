import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Flame, FlaskConical, GraduationCap, AlertTriangle } from 'lucide-react';
import { ALL_TOPICS, getTopicById, LEARNING_MODULES } from '../../data/modules';
import { useProgress } from '../../context/ProgressContext';
import { HeroChipVisual } from '../visuals/HeroChipVisual';
import { NavSection } from '../../types';
import { LabTabId } from '../lab/VirtualLab';

interface Props {
  onOpenTopic: (topicId: string) => void;
  onNavigate: (section: NavSection) => void;
  onOpenLab: (tab?: LabTabId) => void;
}

const DAILY_CHALLENGE = {
  question:
    'An 8085 executes: MVI A, 0FH followed by INR A. What are the values of Accumulator (A), Auxiliary Carry (AC), and Carry (CY) assuming CY was 1 before INR A?',
  options: [
    'A = 10H, AC = 1, CY = 0',
    'A = 10H, AC = 1, CY = 1 (unchanged)',
    'A = 10H, AC = 0, CY = 1',
    'A = 00H, AC = 1, CY = 1',
  ],
  correctIdx: 1,
  explanation:
    '0FH + 1 = 10H causes a carry from bit D3 to D4 (AC = 1). Crucially, INR never alters CY, so CY remains 1!',
};

export const DashboardView: React.FC<Props> = ({ onOpenTopic, onNavigate, onOpenLab }) => {
  const { progress, completeDailyChallenge } = useProgress();
  const [dailyChoice, setDailyChoice] = useState<number | null>(null);

  const totalTopics = ALL_TOPICS.length;
  const completedCount = progress.completedTopicIds.length;
  const overallPct = Math.round((completedCount / totalTopics) * 100);

  const avgAccuracy =
    progress.quizHistory.length > 0
      ? Math.round(progress.quizHistory.reduce((acc, q) => acc + q.accuracy, 0) / progress.quizHistory.length)
      : 0;

  const nextTopic =
    ALL_TOPICS.find((t) => !progress.completedTopicIds.includes(t.id)) ?? ALL_TOPICS[0];

  const todayDone = progress.dailyChallengeCompletedDate === new Date().toISOString().slice(0, 10);

  const handleDailySelect = (idx: number) => {
    setDailyChoice(idx);
    if (idx === DAILY_CHALLENGE.correctIdx) {
      completeDailyChallenge();
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Split: Welcome Card (Pearl / Pure White) + Interactive Silicon Die (Ink Navy) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-6 sm:p-8 flex flex-col justify-between gap-6 pcb-grid">
          <div className="space-y-4">
            <div className="text-xs font-mono tracking-[0.12em] text-[#4A5A70] dark:text-[#BFC6CE]">
              MicroVerse Engineering Workspace · {overallPct}% Syllabus Mastered
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#101B2D] dark:text-[#F5F3EE] tracking-tight leading-tight">
              See Inside the Silicon. Master 8085, 8086, 8051 &amp; Peripherals.
            </h1>
            <p className="text-sm sm:text-base text-[#3D4D63] dark:text-[#BFC6CE] leading-relaxed max-w-xl">
              Explore live internal buses, step through real assembly instructions, inspect timing diagrams, and practice in a university-grade examination suite.
            </p>
          </div>

          <div className="space-y-4">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#4A5A70] dark:text-[#BFC6CE] mb-2">
                <span className="font-medium">Curriculum Progress</span>
                <span className="font-mono tabular-nums text-[#101B2D] dark:text-[#F5F3EE]">
                  {completedCount} / {totalTopics} Topics
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#D8DDE3] dark:bg-[#0A1424] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#101B2D] dark:bg-[#D8DDE3] transition-all duration-300"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenTopic(nextTopic.id)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#101B2D] hover:bg-[#1B2C47] dark:bg-[#F5F3EE] dark:hover:bg-[#FFFFFF] text-[#F5F3EE] dark:text-[#101B2D] text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap"
              >
                Continue Learning: {nextTopic.title.split(':')[0]}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onOpenLab('emulator')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#BFC6CE] dark:border-[#BFC6CE]/35 bg-[#F5F3EE] dark:bg-[#0A1424] hover:border-[#101B2D] dark:hover:border-[#F5F3EE] text-[#101B2D] dark:text-[#F5F3EE] text-sm font-medium cursor-pointer transition-colors whitespace-nowrap"
              >
                <FlaskConical className="w-4 h-4 text-[#4A5A70] dark:text-[#D8DDE3]" />
                Launch 8085 Simulator
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center">
          <HeroChipVisual />
        </div>
      </section>

      {/* 4-Column KPI Row — Strict Ink Navy, Pearl White & Silver Hairlines */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-5">
          <div className="text-xs text-[#4A5A70] dark:text-[#BFC6CE]">Topics Completed</div>
          <div className="text-2xl font-bold font-mono text-[#101B2D] dark:text-[#FFFFFF] mt-1.5 tabular-nums">
            {completedCount}{' '}
            <span className="text-sm font-normal text-[#6C7A8E] dark:text-[#BFC6CE]/70">/ {totalTopics}</span>
          </div>
          <div className="text-xs text-[#5E6E85] dark:text-[#BFC6CE]/75 mt-1">Across 5 core modules</div>
        </div>

        <div className="rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-5">
          <div className="text-xs text-[#4A5A70] dark:text-[#BFC6CE]">Learning Streak</div>
          <div className="text-2xl font-bold font-mono text-[#101B2D] dark:text-[#FFFFFF] mt-1.5 tabular-nums flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-[#4A5A70] dark:text-[#D8DDE3]" />
            {progress.streakDays} Days
          </div>
          <div className="text-xs text-[#5E6E85] dark:text-[#BFC6CE]/75 mt-1">Daily practice active</div>
        </div>

        <div className="rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-5">
          <div className="text-xs text-[#4A5A70] dark:text-[#BFC6CE]">Quiz Performance</div>
          <div className="text-2xl font-bold font-mono text-[#101B2D] dark:text-[#FFFFFF] mt-1.5 tabular-nums">
            {avgAccuracy}%
          </div>
          <div className="text-xs text-[#5E6E85] dark:text-[#BFC6CE]/75 mt-1 tabular-nums">
            {progress.quizHistory.length} exam attempt{progress.quizHistory.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-5">
          <div className="text-xs text-[#4A5A70] dark:text-[#BFC6CE]">Experience &amp; Badges</div>
          <div className="text-2xl font-bold font-mono text-[#101B2D] dark:text-[#FFFFFF] mt-1.5 tabular-nums">
            {progress.xp} XP
          </div>
          <div className="text-xs text-[#5E6E85] dark:text-[#BFC6CE]/75 mt-1 tabular-nums">
            {progress.unlockedBadges.length} badges unlocked
          </div>
        </div>
      </section>

      {/* Daily Challenge + Weak Topics / Recently Explored */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Daily Micro Challenge */}
        <div className="lg:col-span-7 rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono tracking-[0.1em] text-[#4A5A70] dark:text-[#BFC6CE]">
                DAILY MICRO CHALLENGE · +50 XP
              </div>
              <h2 className="text-lg font-semibold text-[#101B2D] dark:text-[#F5F3EE] mt-0.5">
                8085 Flag Register Quick Check
              </h2>
            </div>
            {todayDone && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#101B2D] dark:text-[#F5F3EE]">
                <CheckCircle2 className="w-4 h-4" /> Completed Today
              </span>
            )}
          </div>

          <p className="text-sm text-[#2A3950] dark:text-[#D8DDE3] leading-relaxed">{DAILY_CHALLENGE.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DAILY_CHALLENGE.options.map((opt, idx) => {
              const picked = dailyChoice === idx;
              const isCorrect = idx === DAILY_CHALLENGE.correctIdx;
              const show = dailyChoice !== null || todayDone;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDailySelect(idx)}
                  className={`text-left px-3.5 py-3 rounded-xl border font-mono text-xs transition-all cursor-pointer ${
                    show && isCorrect
                      ? 'border-[#101B2D] dark:border-[#F5F3EE] bg-[#101B2D] dark:bg-[#F5F3EE] text-[#F5F3EE] dark:text-[#101B2D] font-semibold'
                      : show && picked && !isCorrect
                        ? 'border-rose-700/60 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
                        : 'border-[#D8DDE3] dark:border-[#BFC6CE]/25 bg-[#F5F3EE]/60 dark:bg-[#0A1424] hover:border-[#101B2D] dark:hover:border-[#D8DDE3] text-[#101B2D] dark:text-[#D8DDE3]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {(dailyChoice !== null || todayDone) && (
            <div className="rounded-xl bg-[#F5F3EE] dark:bg-[#0A1424] border border-[#D8DDE3] dark:border-[#BFC6CE]/25 p-3.5 text-xs text-[#2A3950] dark:text-[#D8DDE3] leading-relaxed">
              {DAILY_CHALLENGE.explanation}
            </div>
          )}
        </div>

        {/* Right: Weak Topics + Recently Explored */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#101B2D] dark:text-[#F5F3EE] inline-flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#4A5A70] dark:text-[#BFC6CE]" />
                Topics Needing Revision
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('exam')}
                className="text-xs font-medium text-[#101B2D] dark:text-[#D8DDE3] hover:underline cursor-pointer"
              >
                Take Test
              </button>
            </div>
            {progress.weakTopicIds.length === 0 ? (
              <p className="text-xs text-[#5E6E85] dark:text-[#BFC6CE]">No weak topics flagged right now.</p>
            ) : (
              <div className="space-y-2">
                {progress.weakTopicIds.slice(0, 3).map((tid) => {
                  const t = getTopicById(tid);
                  if (!t) return null;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => onOpenTopic(tid)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#F5F3EE]/50 dark:bg-[#0A1424] hover:border-[#101B2D] dark:hover:border-[#D8DDE3] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#101B2D] dark:text-[#F5F3EE] truncate">{t.title}</div>
                        <div className="text-[11px] text-[#5E6E85] dark:text-[#BFC6CE]/75">
                          {t.difficulty} · {t.durationMin} min
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#101B2D] dark:text-[#D8DDE3] shrink-0">Revise →</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#101B2D] dark:text-[#F5F3EE]">Recently Explored</h3>
            <div className="space-y-2">
              {progress.recentTopicIds.slice(0, 3).map((tid) => {
                const t = getTopicById(tid);
                if (!t) return null;
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => onOpenTopic(tid)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#F5F3EE] dark:bg-[#0A1424] border border-transparent hover:border-[#BFC6CE] dark:hover:border-[#BFC6CE]/40 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-medium text-[#101B2D] dark:text-[#D8DDE3] truncate">{t.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5E6E85] dark:text-[#BFC6CE] shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5-Module Learning Roadmap */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-[#101B2D] dark:text-[#F5F3EE]">Learning Roadmap</h2>
            <p className="text-xs text-[#4A5A70] dark:text-[#BFC6CE] mt-0.5">
              Structured progression from fundamentals through 8085, 8086, 8051, and peripheral interfacing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('exam')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#101B2D] dark:text-[#D8DDE3] hover:underline cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            Open Exam Portal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {LEARNING_MODULES.map((mod) => {
            const done = mod.topics.filter((t) => progress.completedTopicIds.includes(t.id)).length;
            const pct = Math.round((done / mod.topics.length) * 100);
            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/20 bg-[#FFFFFF] dark:bg-[#101B2D] p-5 flex flex-col justify-between gap-4 hover:border-[#101B2D]/45 dark:hover:border-[#BFC6CE]/60 transition-colors"
              >
                <div className="space-y-2">
                  <div className="text-xs font-mono tracking-[0.08em] text-[#5E6E85] dark:text-[#BFC6CE]">
                    {mod.number}
                  </div>
                  <h3 className="text-base font-semibold text-[#101B2D] dark:text-[#F5F3EE] leading-snug">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-[#4A5A70] dark:text-[#BFC6CE]/85 leading-relaxed line-clamp-3">
                    {mod.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#5E6E85] dark:text-[#BFC6CE] mb-1 tabular-nums">
                      <span>{done}/{mod.topics.length} topics</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#D8DDE3] dark:bg-[#0A1424] overflow-hidden">
                      <div
                        className="h-full bg-[#101B2D] dark:bg-[#D8DDE3] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenTopic(mod.topics[0].id)}
                    className="w-full py-2.5 rounded-xl bg-[#F5F3EE] dark:bg-[#0A1424] border border-[#D8DDE3] dark:border-[#BFC6CE]/25 hover:bg-[#101B2D] hover:text-[#F5F3EE] hover:border-[#101B2D] dark:hover:bg-[#F5F3EE] dark:hover:text-[#101B2D] text-xs font-semibold text-[#101B2D] dark:text-[#F5F3EE] transition-colors cursor-pointer"
                  >
                    {done > 0 ? 'Continue Module' : 'Start Module'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
