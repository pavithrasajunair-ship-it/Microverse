import React, { createContext, useContext, useEffect, useState } from 'react';
import { BadgeDef, QuizAttempt, StudentProgress } from '../types';

export const ACHIEVEMENT_BADGES: BadgeDef[] = [
  { id: 'first-topic', name: 'Silicon Explorer', description: 'Complete your first MicroVerse learning topic.', xpReward: 50 },
  { id: '8085-master', name: '8085 Architect', description: 'Complete 4 or more topics in the 8085 module.', xpReward: 150 },
  { id: 'lab-coder', name: 'Assembly Hacker', description: 'Execute a program in the 8085 Virtual Lab.', xpReward: 75 },
  { id: 'exam-ace', name: 'Exam Topper', description: 'Score 80% or higher on an Exam Portal test.', xpReward: 150 },
  { id: 'streak-3', name: 'Clock Oscillator', description: 'Maintain a 3+ day learning streak.', xpReward: 100 },
  { id: 'daily-hero', name: 'Daily Challenger', description: 'Complete a Daily Micro Challenge.', xpReward: 60 },
];

const STORAGE_KEY = 'microverse_student_progress_v1';

const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULT_PROGRESS: StudentProgress = {
  completedTopicIds: ['fund-up-vs-uc'],
  bookmarkedTopicIds: ['8085-architecture', '8085-flags'],
  bookmarkedQuestionIds: ['q-8085-2'],
  recentTopicIds: ['8085-architecture', '8085-flags', 'fund-up-vs-uc'],
  xp: 120,
  streakDays: 3,
  lastActiveDate: todayStr(),
  dailyChallengeCompletedDate: null,
  quizHistory: [
    {
      id: 'seed-attempt-1',
      dateIso: new Date(Date.now() - 86400000).toISOString(),
      mode: 'Practice Mode',
      moduleFilter: '8085',
      score: 6,
      maxScore: 8,
      accuracy: 75,
      totalQuestions: 5,
      correctCount: 4,
      weakTopics: ['8085-timing'],
    },
  ],
  weakTopicIds: ['8085-timing', '8085-memory-interfacing'],
  masteredFlashcards: ['fc-1', 'fc-2'],
  unlockedBadges: ['first-topic', 'streak-3'],
  theme: 'light',
};

interface ProgressContextValue {
  progress: StudentProgress;
  toggleTheme: () => void;
  markTopicCompleted: (topicId: string) => void;
  toggleBookmarkTopic: (topicId: string) => void;
  toggleBookmarkQuestion: (questionId: string) => void;
  recordTopicVisit: (topicId: string) => void;
  addXp: (amount: number, badgeId?: string) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  completeDailyChallenge: () => void;
  toggleMasteredFlashcard: (id: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StudentProgress>;
        return { ...DEFAULT_PROGRESS, ...parsed };
      }
    } catch {
      // Fall back safely
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota issues
    }
  }, [progress]);

  useEffect(() => {
    const root = document.documentElement;
    if (progress.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress.theme]);

  const toggleTheme = () => {
    setProgress((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }));
  };

  const markTopicCompleted = (topicId: string) => {
    setProgress((p) => {
      const already = p.completedTopicIds.includes(topicId);
      const completedTopicIds = already
        ? p.completedTopicIds.filter((id) => id !== topicId)
        : [...p.completedTopicIds, topicId];
      const weakTopicIds = already ? p.weakTopicIds : p.weakTopicIds.filter((id) => id !== topicId);
      const badges = new Set(p.unlockedBadges);
      let bonusXp = already ? 0 : 40;
      if (completedTopicIds.length >= 1 && !badges.has('first-topic')) {
        badges.add('first-topic');
        bonusXp += 50;
      }
      const count8085 = completedTopicIds.filter((id) => id.startsWith('8085-')).length;
      if (count8085 >= 4 && !badges.has('8085-master')) {
        badges.add('8085-master');
        bonusXp += 150;
      }
      return {
        ...p,
        completedTopicIds,
        weakTopicIds,
        xp: p.xp + bonusXp,
        unlockedBadges: Array.from(badges),
        lastActiveDate: todayStr(),
      };
    });
  };

  const toggleBookmarkTopic = (topicId: string) => {
    setProgress((p) => ({
      ...p,
      bookmarkedTopicIds: p.bookmarkedTopicIds.includes(topicId)
        ? p.bookmarkedTopicIds.filter((id) => id !== topicId)
        : [...p.bookmarkedTopicIds, topicId],
    }));
  };

  const toggleBookmarkQuestion = (questionId: string) => {
    setProgress((p) => ({
      ...p,
      bookmarkedQuestionIds: p.bookmarkedQuestionIds.includes(questionId)
        ? p.bookmarkedQuestionIds.filter((id) => id !== questionId)
        : [...p.bookmarkedQuestionIds, questionId],
    }));
  };

  const recordTopicVisit = (topicId: string) => {
    setProgress((p) => {
      const filtered = p.recentTopicIds.filter((id) => id !== topicId);
      return {
        ...p,
        recentTopicIds: [topicId, ...filtered].slice(0, 6),
        lastActiveDate: todayStr(),
      };
    });
  };

  const addXp = (amount: number, badgeId?: string) => {
    setProgress((p) => {
      const badges = new Set(p.unlockedBadges);
      let extra = 0;
      if (badgeId && !badges.has(badgeId)) {
        badges.add(badgeId);
        const found = ACHIEVEMENT_BADGES.find((b) => b.id === badgeId);
        extra = found?.xpReward ?? 0;
      }
      return {
        ...p,
        xp: p.xp + amount + extra,
        unlockedBadges: Array.from(badges),
        lastActiveDate: todayStr(),
      };
    });
  };

  const recordQuizAttempt = (attempt: QuizAttempt) => {
    setProgress((p) => {
      const badges = new Set(p.unlockedBadges);
      let bonus = Math.round(attempt.accuracy * 0.8);
      if (attempt.accuracy >= 80 && !badges.has('exam-ace')) {
        badges.add('exam-ace');
        bonus += 150;
      }
      const mergedWeak = Array.from(new Set([...attempt.weakTopics, ...p.weakTopicIds])).slice(0, 6);
      return {
        ...p,
        quizHistory: [attempt, ...p.quizHistory].slice(0, 20),
        weakTopicIds: mergedWeak,
        xp: p.xp + bonus,
        unlockedBadges: Array.from(badges),
        lastActiveDate: todayStr(),
      };
    });
  };

  const completeDailyChallenge = () => {
    setProgress((p) => {
      const today = todayStr();
      if (p.dailyChallengeCompletedDate === today) return p;
      const badges = new Set(p.unlockedBadges);
      let bonus = 50;
      if (!badges.has('daily-hero')) {
        badges.add('daily-hero');
        bonus += 60;
      }
      return {
        ...p,
        dailyChallengeCompletedDate: today,
        streakDays: p.lastActiveDate === today ? p.streakDays : p.streakDays + 1,
        xp: p.xp + bonus,
        unlockedBadges: Array.from(badges),
        lastActiveDate: today,
      };
    });
  };

  const toggleMasteredFlashcard = (id: string) => {
    setProgress((p) => ({
      ...p,
      masteredFlashcards: p.masteredFlashcards.includes(id)
        ? p.masteredFlashcards.filter((x) => x !== id)
        : [...p.masteredFlashcards, id],
    }));
  };

  const resetProgress = () => {
    setProgress({ ...DEFAULT_PROGRESS, theme: progress.theme });
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        toggleTheme,
        markTopicCompleted,
        toggleBookmarkTopic,
        toggleBookmarkQuestion,
        recordTopicVisit,
        addXp,
        recordQuizAttempt,
        completeDailyChallenge,
        toggleMasteredFlashcard,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
