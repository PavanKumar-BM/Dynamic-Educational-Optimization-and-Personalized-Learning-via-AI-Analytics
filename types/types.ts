import type { ComponentType } from 'react';

export type UserInputType = {
  category?: string;
  difficulty?: string;
  duration?: string;
  video?: string;
  totalChapters?: number;
  description?: string;
};

export type ChapterType = {
  chapter_name: string;
  description: string;
  duration: string;
};

export type courseOutputType = {
  category: string;
  chapters: ChapterType[];
  duration: string;
  level: string;
  topic: string;
  description: string;
};
export type CourseType = {
  id: number;
  courseId: string;
  courseName: string;
  category: string;
  level: string;
  courseOutput: courseOutputType;
  isVideo: string;
  username: string | null;
  userprofileimage: string | null;
  courseBanner: string | null;
  isPublished: boolean;
};

export type CodeExampleType = {
  code: string[];
};

export type ChapterSectionType = {
  title: string;
  explanation: string;
  code_examples?: CodeExampleType[];
};

export type ChapterContentType = {
  id: number;
  chapterId: number;
  courseId: string;
  content: ChapterSectionType[];
  videoId: string;
};
// Analytics Types
export interface UserStudySessionType {
  sessionId: number;
  userId: string;
  courseRowId: number;
  chapterRowId: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  sessionType?: string;
}

export interface ChapterProgressType {
  progressId: number;
  userId: string;
  courseRowId: number;
  chapterRowId: number;
  isCompleted: boolean;
  timeSpent?: number;
  completionDate?: Date;
  progressPercentage: number;
}

export interface CourseProgressType {
  progressId: number;
  userId: string;
  courseRowId: number;
  totalTimeSpent?: number;
  completionPercentage: number;
  chaptersCompleted: number;
  lastAccessedDate?: Date;
  isCompleted: boolean;
}

// Chart Data Types
export interface StudyTimeChartData {
  date: string;
  duration: number;
}

export interface ProgressChartData {
  chapter: string;
  progress: number;
}

export interface DistributionChartData {
  name: string;
  value: number;
}

export interface PerformanceMetricData {
  label: string;
  value: string | number;
  icon?: ComponentType<any>;
}

// Analytics Filter Types
export interface DateRangeFilter {
  start: Date;
  end: Date;
}

export enum AnalyticsTimeRange {
  Week = 'week',
  Month = 'month',
  All = 'all',
}

export interface StudySessionFilter {
  userId: string;
  courseRowId?: number;
  chapterRowId?: number;
  range?: DateRangeFilter;
}

// Aggregated Data Types
export interface DailyStudyStats {
  date: string;
  totalDuration: number;
}

export interface CourseAnalytics {
  courseRowId: number;
  totalTimeSpent: number;
  completionPercentage: number;
  chaptersCompleted: number;
}

export interface UserAnalyticsSummary {
  totalStudyTime: number;
  averageProgress: number;
  completionRates: CompletionRateData[];
  studyStreak: StudyStreakData;
  insights: LearningInsight[];
}

export interface LearningInsight {
  title: string;
  description: string;
  type: 'strength' | 'opportunity' | 'trend';
}

// Calculation Result Types
export interface StudyStreakData {
  streakLength: number;
  lastActiveDate: string;
}

export interface ProductivityMetrics {
  efficiency: number;
  avgSessionDuration: number;
  sessionsCount: number;
}

export interface CompletionRateData {
  courseRowId: number;
  rate: number;
}
export interface StudyTimeDataType {
  date: string;
  duration: number;
  courseId: number;
}

export interface AnalyticsDataType {
  dailyStudyTime: StudyTimeDataType[];
  weeklyProgress: ChapterProgressType[];
  courseCompletionRates: CourseProgressType[];
  studyStreaks: number;
}
