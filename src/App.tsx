import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Bot,
  FileText,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Sun,
  Swords,
  X,
} from 'lucide-react';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { NavSection } from './types';
import { ALL_TOPICS } from './data/modules';
import { QUESTION_BANK } from './data/questions';
import { MicroVerseLogo } from './components/brand/MicroVerseLogo';
import { WelcomeScreen } from './components/home/WelcomeScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { LearningModulesView } from './components/modules/LearningModulesView';
import { LabTabId, VirtualLab } from './components/lab/VirtualLab';
import { ExamPortal } from './components/exam/ExamPortal';
import { QuestionBankView } from './components/questions/QuestionBankView';
import { PracticeArena } from './components/arena/PracticeArena';
import { NotesCenterView } from './components/notes/NotesCenterView';
import { CircuitMentor } from './components/tutor/CircuitMentor';

const NAV_ITEMS: Array<{ id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'modules', label: 'Learning Modules', icon: BookOpen },
  { id: 'lab', label: 'Virtual Lab', icon: FlaskConical },
  { id: 'exam', label: 'Exam Portal', icon: GraduationCap },
  { id: 'questions', label: 'Question Bank', icon: HelpCircle },
  { id: 'arena', label: 'Practice Arena', icon: Swords },
  { id: 'notes', label: 'Notes & Revision', icon: FileText },
  { id: 'tutor', label: 'Circuit Mentor', icon: Bot },
];

const MicroVerseShell: React.FC = () => {
  const { progress, toggleTheme } = useProgress();
  const [hasEntered, setHasEntered] = useState(false);
  const [section, setSection] = useState<NavSection>('dashboard');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [labTab, setLabTab] = useState<LabTabId>('emulator');
  const [labInitialCode, setLabInitialCode] = useState<string | undefined>(undefined);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { topics: [], questions: [] };
    return {
      topics: ALL_TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.simpleExplanation.toLowerCase().includes(q)
      ).slice(0, 5),
      questions: QUESTION_BANK.filter(
        (item) => item.prompt.toLowerCase().includes(q) || item.topicName.toLowerCase().includes(q)
      ).slice(0, 3),
    };
  }, [searchQuery]);

  const openTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setSection('modules');
    setSearchOpen(false);
    setSearchQuery('');
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLab = (tab: LabTabId = 'emulator', code?: string) => {
    setLabTab(tab);
    setLabInitialCode(code);
    setSection('lab');
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (next: NavSection) => {
    setSection(next);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!hasEntered) {
    return <WelcomeScreen onEnter={() => setHasEntered(true)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex bg-[#F5F3EE] dark:bg-[#0A1424] text-[#101B2D] dark:text-[#F5F3EE]"
    >
      {/* Persistent Ink Navy Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-[#BFC6CE]/20 bg-[#101B2D] text-[#F5F3EE] sticky top-0 h-screen">
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#BFC6CE]/15">
          <button
            type="button"
            onClick={() => setHasEntered(false)}
            className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
            title="Return to Welcome Screen"
          >
            <MicroVerseLogo size={32} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <span className="text-lg font-semibold tracking-tight text-[#FFFFFF] whitespace-nowrap font-display">
              MicroVerse
            </span>
          </button>
        </div>

        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#F5F3EE] text-[#101B2D] font-semibold'
                    : 'text-[#BFC6CE] hover:bg-[#192842] hover:text-[#FFFFFF]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#BFC6CE]/15 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#BFC6CE]">
            <span>Progress</span>
            <span className="font-mono tabular-nums text-[#F5F3EE]">
              {progress.xp} XP · {progress.streakDays}d streak
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0A1424] overflow-hidden">
            <div
              className="h-full bg-[#D8DDE3] rounded-full transition-all duration-300"
              style={{ width: `${Math.round((progress.completedTopicIds.length / ALL_TOPICS.length) * 100)}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Ink Navy Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#0A1424]/75 backdrop-blur-xs" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-[#101B2D] text-[#F5F3EE] h-full flex flex-col border-r border-[#BFC6CE]/20 z-10">
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#BFC6CE]/15">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setHasEntered(false);
                }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <MicroVerseLogo size={28} />
                <span className="text-base font-semibold text-[#FFFFFF] font-display">MicroVerse</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-2 text-[#BFC6CE] hover:text-[#FFFFFF] cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                      active ? 'bg-[#F5F3EE] text-[#101B2D] font-semibold' : 'text-[#BFC6CE] hover:bg-[#192842]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Single-Row Top Header */}
        <header className="h-14 sm:h-16 sticky top-0 z-30 border-b border-[#D8DDE3] dark:border-[#BFC6CE]/15 bg-[#FFFFFF]/90 dark:bg-[#0A1424]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-[#101B2D] dark:text-[#D8DDE3] hover:bg-[#F5F3EE] dark:hover:bg-[#101B2D] cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5E6E85] dark:text-[#BFC6CE]/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Search 8085 flags, 8086 segmentation, 8051 RAM, 8255..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F5F3EE] dark:bg-[#101B2D] border border-[#D8DDE3] dark:border-[#BFC6CE]/20 focus:border-[#101B2D] dark:focus:border-[#D8DDE3] text-xs sm:text-sm text-[#101B2D] dark:text-[#F5F3EE] placeholder:text-[#6B7A8F] dark:placeholder:text-[#BFC6CE]/60 focus:outline-none"
              />

              {searchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-[#D8DDE3] dark:border-[#BFC6CE]/25 bg-[#FFFFFF] dark:bg-[#101B2D] shadow-xl p-3 space-y-3 z-50">
                  <div className="flex items-center justify-between text-xs text-[#5E6E85] dark:text-[#BFC6CE]">
                    <span>Search Results</span>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="hover:text-[#101B2D] dark:hover:text-[#FFFFFF] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  {searchResults.topics.length === 0 && searchResults.questions.length === 0 ? (
                    <div className="text-xs text-[#5E6E85] dark:text-[#BFC6CE] py-2">
                      No matching concepts or questions found.
                    </div>
                  ) : (
                    <>
                      {searchResults.topics.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono text-[#5E6E85] dark:text-[#BFC6CE]/70">TOPICS</div>
                          {searchResults.topics.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => openTopic(t.id)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F3EE] dark:hover:bg-[#0A1424] text-xs cursor-pointer"
                            >
                              <div className="font-semibold text-[#101B2D] dark:text-[#F5F3EE]">{t.title}</div>
                              <div className="text-[#5E6E85] dark:text-[#BFC6CE]/80 truncate">{t.subtitle}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.questions.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono text-[#5E6E85] dark:text-[#BFC6CE]/70">
                            QUESTION BANK
                          </div>
                          {searchResults.questions.map((q) => (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery('');
                                navigate('questions');
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F3EE] dark:hover:bg-[#0A1424] text-xs text-[#2A3950] dark:text-[#D8DDE3] truncate cursor-pointer"
                            >
                              {q.prompt}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#D8DDE3] dark:border-[#BFC6CE]/25 text-[#101B2D] dark:text-[#D8DDE3] hover:bg-[#F5F3EE] dark:hover:bg-[#101B2D] cursor-pointer"
              aria-label="Toggle Light or Dark Theme"
              title="Toggle Pearl / Midnight Theme"
            >
              {progress.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => openLab('emulator')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101B2D] hover:bg-[#1B2C47] dark:bg-[#F5F3EE] dark:hover:bg-[#FFFFFF] text-[#F5F3EE] dark:text-[#101B2D] text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              Open Lab
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {section === 'dashboard' && (
            <DashboardView onOpenTopic={openTopic} onNavigate={navigate} onOpenLab={openLab} />
          )}
          {section === 'modules' && (
            <LearningModulesView initialTopicId={activeTopicId} onOpenLab={openLab} />
          )}
          {section === 'lab' && (
            <VirtualLab key={`${labTab}-${labInitialCode ?? ''}`} initialTab={labTab} initialCode={labInitialCode} />
          )}
          {section === 'exam' && <ExamPortal onReviseTopic={openTopic} />}
          {section === 'questions' && <QuestionBankView />}
          {section === 'arena' && <PracticeArena onTryInLab={(code) => openLab('emulator', code)} />}
          {section === 'notes' && <NotesCenterView />}
          {section === 'tutor' && <CircuitMentor />}
        </main>
      </div>
    </motion.div>
  );
};

export default function App() {
  return (
    <ProgressProvider>
      <MicroVerseShell />
    </ProgressProvider>
  );
}
