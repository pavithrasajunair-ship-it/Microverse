import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Wrench,
} from 'lucide-react';
import { ALL_TOPICS, LEARNING_MODULES } from '../../data/modules';
import { SYLLABUS_THEORY } from '../../data/syllabusTheory';
import { QUESTION_BANK } from '../../data/questions';
import { ModuleId, Topic } from '../../types';
import { useProgress } from '../../context/ProgressContext';
import { ConceptVisualEngine, Ppi8255Visual, TimingDiagramInteractive } from '../visuals/ConceptVisualEngine';
import { InstructionVisualizer } from '../visuals/InstructionVisualizer';
import { Assembly8085Playground } from '../lab/Assembly8085Playground';
import { MemoryStackLab } from '../lab/MemoryStackLab';
import { FlagAluSimulator, HardwareInterfacingLab, NumberSystemLab } from '../lab/ElectronicsSimulators';
import { Dma8237Experiment, KeypadMatrixExperiment, Pic8259Experiment, Timer8253Experiment } from '../lab/VirtualExperiments';
import { LabTabId } from '../lab/VirtualLab';

type ChapterTab = 'learn' | 'visualize' | 'experiment' | 'exam';

interface Props {
  initialTopicId?: string | null;
  onOpenLab: (tab?: LabTabId) => void;
}

const CHAPTER_TABS: Array<{ id: ChapterTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'learn', label: 'LEARN', icon: BookOpen },
  { id: 'visualize', label: 'VISUALIZE', icon: Eye },
  { id: 'experiment', label: 'EXPERIMENT', icon: Wrench },
  { id: 'exam', label: 'EXAM PREP', icon: GraduationCap },
];

export const LearningModulesView: React.FC<Props> = ({ initialTopicId, onOpenLab }) => {
  const { progress, markTopicCompleted, toggleBookmarkTopic, recordTopicVisit } = useProgress();
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>(() => {
    if (initialTopicId) {
      const found = ALL_TOPICS.find((t) => t.id === initialTopicId);
      if (found) return found.moduleId;
    }
    return '8085';
  });
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId ?? '8085-architecture');
  const [chapterTab, setChapterTab] = useState<ChapterTab>('learn');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [activeHotspotIdx, setActiveHotspotIdx] = useState<number>(0);
  const [marksFilter, setMarksFilter] = useState<0 | 2 | 5 | 10 | 15>(0);
  const [openAnswers, setOpenAnswers] = useState<Record<number, boolean>>({ 0: true });
  const [quizSelection, setQuizSelection] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTopicId) {
      const found = ALL_TOPICS.find((t) => t.id === initialTopicId);
      if (found) {
        setActiveModuleId(found.moduleId);
        setSelectedTopicId(found.id);
      }
    }
  }, [initialTopicId]);

  const activeModule = LEARNING_MODULES.find((m) => m.id === activeModuleId) ?? LEARNING_MODULES[0];
  const topic: Topic =
    activeModule.topics.find((t) => t.id === selectedTopicId) ?? activeModule.topics[0];
  const theory = SYLLABUS_THEORY[topic.id];

  useEffect(() => {
    recordTopicVisit(topic.id);
    setActiveStepIdx(0);
    setActiveHotspotIdx(0);
    setMarksFilter(0);
    setOpenAnswers({ 0: true });
    setQuizSelection({});
  }, [topic.id]);

  const relatedQuestions = useMemo(() => {
    const exact = QUESTION_BANK.filter((q) => q.topicId === topic.id && q.options && q.options.length > 0);
    if (exact.length >= 2) return exact.slice(0, 4);
    const modMatches = QUESTION_BANK.filter(
      (q) => q.moduleId === topic.moduleId && q.options && q.options.length > 0 && !exact.includes(q)
    );
    return [...exact, ...modMatches].slice(0, 4);
  }, [topic.id, topic.moduleId]);

  const isCompleted = progress.completedTopicIds.includes(topic.id);
  const isBookmarked = progress.bookmarkedTopicIds.includes(topic.id);

  const flatIdx = ALL_TOPICS.findIndex((t) => t.id === topic.id);
  const prevTopic = flatIdx > 0 ? ALL_TOPICS[flatIdx - 1] : null;
  const nextTopic = flatIdx < ALL_TOPICS.length - 1 ? ALL_TOPICS[flatIdx + 1] : null;

  const selectTopic = (t: Topic) => {
    setActiveModuleId(t.moduleId);
    setSelectedTopicId(t.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderTopicExperiment = () => {
    switch (topic.id) {
      case '8085-architecture':
        return <Assembly8085Playground />;
      case '8085-flags':
        return <FlagAluSimulator />;
      case '8085-pinout':
        return <ConceptVisualEngine visualType="8085-pinout" />;
      case '8085-addressing':
        return <InstructionVisualizer defaultInstruction="MOV" />;
      case '8085-timing':
        return <TimingDiagramInteractive />;
      case '8085-interrupts':
        return <HardwareInterfacingLab />;
      case '8085-memory-interfacing':
        return <MemoryStackLab />;
      case 'periph-8255':
        return <Ppi8255Visual />;
      case 'periph-timer-pic-dma':
        return (
          <div className="space-y-5">
            <Timer8253Experiment />
            <Pic8259Experiment />
            <Dma8237Experiment />
          </div>
        );
      case 'periph-adc-dac-led':
        return (
          <div className="space-y-5">
            <HardwareInterfacingLab />
            <KeypadMatrixExperiment />
          </div>
        );
      case '8051-architecture':
      case '8051-ports-timers-serial':
        return <HardwareInterfacingLab />;
      case '8086-segmentation':
      case '8086-biu-eu':
      case '8086-modes-flags':
        return <ConceptVisualEngine visualType={topic.visualType} />;
      default:
        return (
          <div className="space-y-5">
            <InstructionVisualizer defaultInstruction="ADD" />
            <NumberSystemLab />
          </div>
        );
    }
  };

  const filteredUniQuestions = useMemo(() => {
    if (!theory) return [];
    if (marksFilter === 0) return theory.universityQuestions;
    return theory.universityQuestions.filter((q) => q.marks === marksFilter);
  }, [theory, marksFilter]);

  return (
    <div className="space-y-6">
      {/* Module Selector Bar */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            University Syllabus &amp; Visual Learning Universe
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Structured engineering theory, animated datapath visuals, embedded virtual labs, and 2M–15M exam preparation for every topic.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {LEARNING_MODULES.map((mod) => {
            const doneCount = mod.topics.filter((t) => progress.completedTopicIds.includes(t.id)).length;
            const pct = Math.round((doneCount / mod.topics.length) * 100);
            const active = mod.id === activeModuleId;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setActiveModuleId(mod.id);
                  setSelectedTopicId(mod.topics[0].id);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-blue-500 bg-blue-600/10 dark:bg-blue-600/15'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{mod.number}</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 truncate">{mod.shortTitle}</div>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                  {doneCount}/{mod.topics.length} completed
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Index + 4-Tab Chapter Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Topic Index */}
        <aside className="xl:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 space-y-3">
          <div>
            <div className="text-xs font-mono text-blue-600 dark:text-cyan-400">{activeModule.number}</div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">{activeModule.title}</h2>
          </div>
          <div className="space-y-1.5">
            {activeModule.topics.map((t) => {
              const done = progress.completedTopicIds.includes(t.id);
              const isCur = t.id === topic.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTopic(t)}
                  className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                    isCur
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium leading-snug">
                      {t.order}. {t.title}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isCur ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t.difficulty} · {t.durationMin} min
                    </div>
                  </div>
                  {done && <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isCur ? 'text-white' : 'text-emerald-500'}`} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Consistent 4-Tab Topic Experience */}
        <article className="xl:col-span-9 space-y-5">
          {/* Topic Header + 4-Tab Bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>{activeModule.shortTitle}</span>
                <span aria-hidden="true">·</span>
                <span>{topic.difficulty}</span>
                <span aria-hidden="true">·</span>
                <span>{topic.durationMin} min study</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLab((topic.relatedLabTab as LabTabId) ?? 'emulator')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/40 text-blue-600 dark:text-cyan-300 hover:bg-blue-500/10 text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Full Virtual Lab
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmarkTopic(topic.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer whitespace-nowrap ${
                    isBookmarked
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button
                  type="button"
                  onClick={() => markTopicCompleted(topic.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCompleted ? 'Completed' : 'Mark Complete (+40 XP)'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{topic.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{topic.subtitle}</p>
            </div>

            {/* Strict 4-Tab Switcher: LEARN | VISUALIZE | EXPERIMENT | EXAM PREP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              {CHAPTER_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = chapterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setChapterTab(tab.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= TAB 1: LEARN (Complete 12-Section University Syllabus Theory) ================= */}
          {chapterTab === 'learn' && (
            <div className="space-y-5">
              {/* 1. Introduction & Beginner Intuition */}
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  1. Introduction &amp; Formal Engineering Definition
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
                  {theory?.introduction ?? topic.simpleExplanation}
                </p>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 flex gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">Beginner Intuition &amp; Analogy</div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{topic.simpleExplanation}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">{topic.analogy}</p>
                  </div>
                </div>
              </section>

              {/* 2. Why Needed & 3. Detailed Working Principle */}
              {theory && (
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      2. Why This Concept Is Needed
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {theory.whyNeeded}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      3. Detailed Working Principle
                    </h3>
                    {theory.workingPrinciple.map((para, idx) => (
                      <p key={idx} className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      4. Internal Architecture &amp; Hardware Specifications
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {theory.architectureDetails}
                    </p>
                    <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 pt-2">
                      {topic.keyFacts.map((fact, idx) => (
                        <li key={idx} className="leading-relaxed">{fact}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* 5. Step-by-Step Internal Operation */}
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    5. Step-by-Step Internal Operation
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveStepIdx((i) => Math.max(0, i - 1))}
                      disabled={activeStepIdx === 0}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-xs cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-mono text-slate-500 px-2 tabular-nums">
                      Step {activeStepIdx + 1} / {topic.stepByStep.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveStepIdx((i) => Math.min(topic.stepByStep.length - 1, i + 1))}
                      disabled={activeStepIdx === topic.stepByStep.length - 1}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-40 text-xs cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {topic.stepByStep.map((st, idx) => (
                    <button
                      key={st.step}
                      type="button"
                      onClick={() => setActiveStepIdx(idx)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        idx === activeStepIdx
                          ? 'border-blue-500 bg-blue-600/10 dark:bg-blue-600/15'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="text-xs font-mono text-blue-600 dark:text-cyan-400">Step {st.step}</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{st.title}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{st.internalAction}</p>
                      {st.busState && (
                        <div className="mt-2 font-mono text-[11px] text-cyan-600 dark:text-cyan-300">{st.busState}</div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* 6. Technical Terminology Glossary */}
              {theory && (
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    6. Essential Technical Terminology
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {theory.terminology.map((item) => (
                      <div key={item.term} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3.5">
                        <div className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">{item.term}</div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 7. Advantages & Limitations + 8. Real-World Applications */}
              {theory && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">7. Advantages &amp; Limitations</h3>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Advantages</div>
                      <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                        {theory.advantages.map((a, i) => (
                          <li key={i} className="leading-relaxed">{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">Limitations &amp; Trade-Offs</div>
                      <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                        {theory.limitations.map((l, i) => (
                          <li key={i} className="leading-relaxed">{l}</li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-3.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">8. Practical Engineering Applications</h3>
                    <div className="space-y-3">
                      {topic.realWorldApplications.map((app, i) => (
                        <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3.5">
                          <div className="text-xs font-semibold text-blue-600 dark:text-cyan-400">{app.domain}</div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{app.example}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-500">Must-Draw University Diagrams</div>
                      <ul className="mt-1.5 space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc pl-5">
                        {topic.examPerspective.importantDiagrams.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </div>
              )}

              {/* 9. Important Comparisons Table */}
              {theory && (
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    9. Important Comparison: {theory.comparisonTable.title}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                          {theory.comparisonTable.headers.map((h) => (
                            <th key={h} className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {theory.comparisonTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-2.5 px-3 ${
                                  cIdx === 0
                                    ? 'font-semibold text-slate-900 dark:text-slate-100'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 10. Worked Examples */}
              {theory && theory.workedExamples.length > 0 && (
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    10. Worked Engineering Examples
                  </h3>
                  <div className="space-y-4">
                    {theory.workedExamples.map((ex, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-4 space-y-3">
                        <div className="text-sm font-semibold text-blue-600 dark:text-cyan-400">{ex.title}</div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{ex.problem}</p>
                        <ol className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-decimal pl-5">
                          {ex.steps.map((s, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">{s}</li>
                          ))}
                        </ol>
                        <div className="rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs px-3.5 py-2.5">
                          Final Answer: {ex.finalAnswer}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ================= TAB 2: VISUALIZE (Animated Diagrams + Instruction Animator + Hotspots) ================= */}
          {chapterTab === 'visualize' && (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Interactive Concept Diagram
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Click components, toggle signals, or step through waveforms below
                  </span>
                </div>
                <ConceptVisualEngine visualType={topic.visualType} />
              </section>

              {/* Animated Step-by-Step 8085 Instruction Visualizer for 8085 topics (except addressing where it's already the primary visual) */}
              {topic.moduleId === '8085' && topic.visualType !== '8085-addressing' && (
                <section className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Animated 8085 Instruction Datapath Visualizer
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Step visually through MOV, ADD, PUSH, POP, LDA, STA, INR, DCR, CMP, JMP, CALL, and RET with live bus arrows and flag updates.
                    </p>
                  </div>
                  <InstructionVisualizer
                    defaultInstruction={
                      topic.id === '8085-flags'
                        ? 'ADD'
                        : topic.id === '8085-memory-interfacing'
                          ? 'LDA'
                          : topic.id === '8085-interrupts'
                            ? 'CALL'
                            : 'MOV'
                    }
                  />
                </section>
              )}

              {/* Interactive Component Discovery Hotspots */}
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Interactive Sub-Component Inspector
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topic.interactiveHotspots.map((hs, idx) => (
                    <button
                      key={hs.id}
                      type="button"
                      onClick={() => setActiveHotspotIdx(idx)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        activeHotspotIdx === idx
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {hs.label}
                    </button>
                  ))}
                </div>
                {topic.interactiveHotspots[activeHotspotIdx] && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {topic.interactiveHotspots[activeHotspotIdx].label}
                      </span>
                      <span className="font-mono text-blue-600 dark:text-cyan-400">
                        {topic.interactiveHotspots[activeHotspotIdx].role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {topic.interactiveHotspots[activeHotspotIdx].details}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ================= TAB 3: EXPERIMENT (Embedded Live Virtual Simulator) ================= */}
          {chapterTab === 'experiment' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Hands-On Interactive Experiment · {topic.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modify inputs, step clock cycles, and verify outputs directly inside this chapter.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenLab((topic.relatedLabTab as LabTabId) ?? 'emulator')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Launch Full Virtual Lab Suite
                </button>
              </div>
              {renderTopicExperiment()}
            </div>
          )}

          {/* ================= TAB 4: EXAM PREP (2M / 5M / 10M / 15M Q&A + Recap + Mini-Quiz) ================= */}
          {chapterTab === 'exam' && (
            <div className="space-y-6">
              {/* University Exam Questions (2M, 5M, 10M, 15M) */}
              {theory && (
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        University Syllabus Exam Questions (2M · 5M · 10M · 15M)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Curated university exam-pattern questions with structured model answers and scoring outlines.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {([0, 2, 5, 10, 15] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMarksFilter(m)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                            marksFilter === m
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {m === 0 ? 'All' : `${m}M`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredUniQuestions.map((uq, idx) => {
                      const isOpen = !!openAnswers[idx];
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                          >
                            <div className="flex gap-2.5 items-start">
                              <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 shrink-0 mt-0.5">
                                [{uq.marks} Marks]
                              </span>
                              <span className="text-sm font-medium text-slate-900 dark:text-white leading-snug">
                                {uq.question}
                              </span>
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1222]">
                              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mb-1">
                                MODEL ANSWER &amp; SCORING OUTLINE
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                {uq.modelAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Quick Revision Cards */}
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  High-Yield Revision Cards &amp; Key Definitions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {topic.quickRecap.map((card, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-xs font-mono font-semibold text-blue-600 dark:text-cyan-400">{card.term}</div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed">{card.summary}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  {topic.examPerspective.keyDefinitions.map((def, i) => (
                    <p key={i} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      • {def}
                    </p>
                  ))}
                </div>
              </section>

              {/* Interactive Topic Self-Check Quiz */}
              {relatedQuestions.length > 0 && (
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Instant Self-Check Practice Questions
                  </h3>
                  <div className="space-y-4">
                    {relatedQuestions.map((q, qIdx) => {
                      const picked = quizSelection[q.id];
                      const correctIdx = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
                      return (
                        <div key={q.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 space-y-3">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            Q{qIdx + 1}. {q.prompt}
                          </div>
                          {q.codeSnippet && (
                            <pre className="rounded-lg bg-slate-950 text-cyan-300 font-mono text-xs p-3 overflow-x-auto">
                              {q.codeSnippet}
                            </pre>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options?.map((opt, oIdx) => {
                              const oKey = String(oIdx);
                              const isPicked = picked === oKey;
                              const isRight = oKey === correctIdx;
                              let cls = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-500';
                              if (picked !== undefined) {
                                if (isRight) cls = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold';
                                else if (isPicked) cls = 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300';
                              }
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => setQuizSelection((prev) => ({ ...prev, [q.id]: oKey }))}
                                  className={`p-2.5 rounded-lg border text-left text-xs cursor-pointer transition-colors ${cls}`}
                                >
                                  <span className="font-mono mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {picked !== undefined && (
                            <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B1222] border border-slate-200 dark:border-slate-800 rounded-lg p-3 leading-relaxed">
                              <span className={`font-semibold mr-1.5 ${picked === correctIdx ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {picked === correctIdx ? 'Correct!' : 'Review:'}
                              </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Next / Previous Topic Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {prevTopic ? (
              <button
                type="button"
                onClick={() => selectTopic(prevTopic)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] hover:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                {prevTopic.title}
              </button>
            ) : <div />}

            {nextTopic && (
              <button
                type="button"
                onClick={() => selectTopic(nextTopic)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white cursor-pointer"
              >
                Next: {nextTopic.title}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};
