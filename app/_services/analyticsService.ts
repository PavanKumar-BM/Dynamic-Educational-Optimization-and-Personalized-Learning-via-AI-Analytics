// ...existing code...
import type {
  UserStudySessionType,
  ChapterProgressType,
  CourseProgressType,
  StudyTimeChartData,
  ProgressChartData,
  DistributionChartData,
  PerformanceMetricData,
  DateRangeFilter,
  AnalyticsTimeRange,
  StudySessionFilter,
  DailyStudyStats,
  CourseAnalytics,
  UserAnalyticsSummary,
  LearningInsight,
  StudyStreakData,
  ProductivityMetrics,
  CompletionRateData,
} from '@/types/types';
import {
  UserStudySessions,
  ChapterProgress,
  CourseProgress,
  CourseList,
  CourseChapters,
} from '@/schema/schema';
/**
 * Converts a Date to a Unix timestamp (seconds)
 */
export function convertDateToUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Converts a Unix timestamp (seconds) to a Date
 */
export function convertUnixTimestampToDate(ts: number): Date {
  return new Date(ts * 1000);
}

/**
 * Finds the DB row ID for a course given its external string ID
 */
export async function findCourseRowId(courseExternalId: string): Promise<number | null> {
  try {
    const result = await db.select().from(CourseList).where(eq(CourseList.courseId, courseExternalId));
    return result[0]?.id ?? null;
  } catch (err) {
    console.error('findCourseRowId error', err);
    return null;
  }
}

/**
 * Finds the DB row ID for a chapter given its course external ID and chapter number
 */
export async function findChapterRowId(courseExternalId: string, chapterId: number): Promise<number | null> {
  try {
    const result = await db.select().from(CourseChapters).where(and(eq(CourseChapters.courseId, courseExternalId), eq(CourseChapters.chapterId, chapterId)));
    return result[0]?.id ?? null;
  } catch (err) {
    console.error('findChapterRowId error', err);
    return null;
  }
}

/**
 * Starts a study session for a user, course, and chapter. Throws if chapterRowId is missing.
 */
export async function startStudySession(userId: string, courseRowId: number, chapterRowId: number, sessionType?: string): Promise<number | null> {
  if (typeof chapterRowId !== 'number') throw new Error('chapterRowId is required by schema');
  try {
    const startTime = convertDateToUnixTimestamp(new Date());
    const [session] = await db.insert(UserStudySessions).values({
      userId,
      courseRowId,
      chapterRowId,
      startTime,
      sessionType,
    }).returning();
    return session?.sessionId ?? null;
  } catch (err) {
    console.error('startStudySession error', err);
    return null;
  }
}

/**
 * Ends a study session by updating end time and duration
 */
export async function endStudySession(sessionId: number): Promise<void> {
  try {
    const endTime = convertDateToUnixTimestamp(new Date());
    const session = await db.select().from(UserStudySessions).where(eq(UserStudySessions.sessionId, sessionId));
    if (!session[0]) return;
    const duration = endTime - session[0].startTime;
    await db.update(UserStudySessions).set({ endTime, duration }).where(eq(UserStudySessions.sessionId, sessionId));
  } catch (err) {
    console.error('endStudySession error', err);
  }
}

/**
 * Updates session duration periodically
 */
export async function updateSessionDuration(sessionId: number, duration: number): Promise<void> {
  try {
    await db.update(UserStudySessions).set({ duration }).where(eq(UserStudySessions.sessionId, sessionId));
  } catch (err) {
    console.error('updateSessionDuration error', err);
  }
}

/**
 * Gets the active session for a user, course, and chapter
 */
export async function getActiveSession(userId: string, courseRowId: number, chapterRowId: number): Promise<UserStudySessionType | null> {
  try {
    const whereClause = and(eq(UserStudySessions.userId, userId), eq(UserStudySessions.courseRowId, courseRowId), eq(UserStudySessions.chapterRowId, chapterRowId));
    const sessions = await db.select().from(UserStudySessions)
      .where(whereClause)
      .orderBy(desc(UserStudySessions.startTime));
    if (!sessions[0]) return null;
    return {
      sessionId: sessions[0].sessionId,
      userId: sessions[0].userId,
      courseRowId: sessions[0].courseRowId,
      chapterRowId: sessions[0].chapterRowId,
      startTime: convertUnixTimestampToDate(sessions[0].startTime),
      endTime: sessions[0].endTime ? convertUnixTimestampToDate(sessions[0].endTime) : undefined,
      duration: sessions[0].duration,
      sessionType: sessions[0].sessionType ?? undefined,
    };
  } catch (err) {
    console.error('getActiveSession error', err);
    return null;
  }
}

/**
 * Updates chapter progress for a user
 */
export async function updateChapterProgress(userId: string, courseRowId: number, chapterRowId: number, progress: Partial<ChapterProgressType>): Promise<void> {
  try {
    const updateObj: any = {};
    if (typeof progress.isCompleted === 'boolean') updateObj.isCompleted = progress.isCompleted;
    if (typeof progress.timeSpent === 'number') updateObj.timeSpent = progress.timeSpent;
    if (typeof progress.completionDate === 'object' && progress.completionDate instanceof Date) updateObj.completionDate = convertDateToUnixTimestamp(progress.completionDate);
    if (typeof progress.progressPercentage === 'number') updateObj.progressPercentage = progress.progressPercentage;
    await db.update(ChapterProgress)
      .set(updateObj)
      .where(and(eq(ChapterProgress.userId, userId), eq(ChapterProgress.courseRowId, courseRowId), eq(ChapterProgress.chapterRowId, chapterRowId)));
  } catch (err) {
    console.error('updateChapterProgress error', err);
  }
}

/**
 * Updates course progress for a user
 */
export async function updateCourseProgress(userId: string, courseRowId: number, progress: Partial<CourseProgressType>): Promise<void> {
  try {
    const updateObj: any = {};
    if (typeof progress.totalTimeSpent === 'number') updateObj.totalTimeSpent = progress.totalTimeSpent;
    if (typeof progress.completionPercentage === 'number') updateObj.completionPercentage = progress.completionPercentage;
    if (typeof progress.chaptersCompleted === 'number') updateObj.chaptersCompleted = progress.chaptersCompleted;
    if (typeof progress.lastAccessedDate === 'object' && progress.lastAccessedDate instanceof Date) updateObj.lastAccessedDate = convertDateToUnixTimestamp(progress.lastAccessedDate);
    if (typeof progress.isCompleted === 'boolean') updateObj.isCompleted = progress.isCompleted;
    await db.update(CourseProgress)
      .set(updateObj)
      .where(and(eq(CourseProgress.userId, userId), eq(CourseProgress.courseRowId, courseRowId)));
  } catch (err) {
    console.error('updateCourseProgress error', err);
  }
}

/**
 * Gets chapter progress for a user
 */
export async function getChapterProgress(userId: string, courseRowId: number, chapterRowId: number): Promise<ChapterProgressType | null> {
  try {
    const result = await db.select().from(ChapterProgress)
      .where(and(eq(ChapterProgress.userId, userId), eq(ChapterProgress.courseRowId, courseRowId), eq(ChapterProgress.chapterRowId, chapterRowId)));
    if (!result[0]) return null;
    return {
      progressId: result[0].progressId,
      userId: result[0].userId,
      courseRowId: result[0].courseRowId,
      chapterRowId: result[0].chapterRowId,
      isCompleted: result[0].isCompleted,
      timeSpent: result[0].timeSpent,
      completionDate: result[0].completionDate ? convertUnixTimestampToDate(result[0].completionDate) : undefined,
      progressPercentage: result[0].progressPercentage,
    };
  } catch (err) {
    console.error('getChapterProgress error', err);
    return null;
  }
}

/**
 * Gets course progress for a user
 */
export async function getCourseProgress(userId: string, courseRowId: number): Promise<CourseProgressType | null> {
  try {
    const result = await db.select().from(CourseProgress)
      .where(and(eq(CourseProgress.userId, userId), eq(CourseProgress.courseRowId, courseRowId)));
    if (!result[0]) return null;
    return {
      progressId: result[0].progressId,
      userId: result[0].userId,
      courseRowId: result[0].courseRowId,
      totalTimeSpent: result[0].totalTimeSpent,
      completionPercentage: result[0].completionPercentage,
      chaptersCompleted: result[0].chaptersCompleted,
      lastAccessedDate: result[0].lastAccessedDate ? convertUnixTimestampToDate(result[0].lastAccessedDate) : undefined,
      isCompleted: result[0].isCompleted,
    };
  } catch (err) {
    console.error('getCourseProgress error', err);
    return null;
  }
}

/**
 * Gets all study sessions for a user in a date range
 */
export async function getUserStudySessionsByRange(userId: string, range?: DateRangeFilter): Promise<UserStudySessionType[]> {
  try {
    const whereClauses = [eq(UserStudySessions.userId, userId)];
    if (range) {
      whereClauses.push(
        and(
          desc(UserStudySessions.startTime),
          eq(UserStudySessions.startTime, convertDateToUnixTimestamp(range.start)),
          eq(UserStudySessions.endTime, convertDateToUnixTimestamp(range.end))
        )
      );
    }
    const sessions = await db.select().from(UserStudySessions).where(and(...whereClauses));
    return sessions.map(s => ({
      sessionId: s.sessionId,
      userId: s.userId,
      courseRowId: s.courseRowId,
      chapterRowId: s.chapterRowId,
      startTime: convertUnixTimestampToDate(s.startTime),
      endTime: s.endTime ? convertUnixTimestampToDate(s.endTime) : undefined,
      duration: s.duration,
      sessionType: s.sessionType ?? undefined,
    }));
  } catch (err) {
    console.error('getUserStudySessionsByRange error', err);
    return [];
  }
}

/**
 * Gets daily study time for a user in a date range
 */
export async function getUserStudyTimeByDateRange(userId: string, range: DateRangeFilter): Promise<StudyTimeChartData[]> {
  try {
    const sessions = await getUserStudySessionsByRange(userId, range);
    const grouped: Record<string, number> = {};
    sessions.forEach(s => {
      const date = s.startTime.toISOString().slice(0, 10);
      grouped[date] = (grouped[date] || 0) + (s.duration || 0);
    });
    return Object.entries(grouped).map(([date, duration]) => ({ date, duration }));
  } catch (err) {
    console.error('getUserStudyTimeByDateRange error', err);
    return [];
  }
}

/**
 * Gets chapter progress for a user across all chapters
 */
export async function getUserChapterProgressData(userId: string): Promise<ProgressChartData[]> {
  try {
    const chapters = await db.select().from(ChapterProgress).where(eq(ChapterProgress.userId, userId));
    return chapters.map(c => ({ chapter: `Chapter ${c.chapterRowId}`, progress: c.progressPercentage }));
  } catch (err) {
    console.error('getUserChapterProgressData error', err);
    return [];
  }
}

/**
 * Gets course progress for a user across all courses
 */
export async function getUserCourseProgressData(userId: string): Promise<CourseAnalytics[]> {
  try {
    const courses = await db.select().from(CourseProgress).where(eq(CourseProgress.userId, userId));
    return courses.map(c => ({
      courseRowId: c.courseRowId,
      totalTimeSpent: c.totalTimeSpent,
      completionPercentage: c.completionPercentage,
      chaptersCompleted: c.chaptersCompleted,
    }));
  } catch (err) {
    console.error('getUserCourseProgressData error', err);
    return [];
  }
}

/**
 * Calculates total study time for a user in a date range
 */
export async function calculateTotalStudyTime(userId: string, range: DateRangeFilter): Promise<number> {
  try {
    const sessions = await getUserStudySessionsByRange(userId, range);
    return sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  } catch (err) {
    console.error('calculateTotalStudyTime error', err);
    return 0;
  }
}

/**
 * Calculates average progress for a user across all courses
 */
export async function calculateAverageProgress(userId: string): Promise<number> {
  try {
    const courses = await getUserCourseProgressData(userId);
    if (!courses.length) return 0;
    return courses.reduce((sum, c) => sum + (c.completionPercentage || 0), 0) / courses.length;
  } catch (err) {
    console.error('calculateAverageProgress error', err);
    return 0;
  }
}

/**
 * Calculates completion rates for a user
 */
export async function calculateCompletionRates(userId: string): Promise<CompletionRateData[]> {
  try {
    const courses = await getUserCourseProgressData(userId);
    return courses.map(c => ({ courseRowId: c.courseRowId, rate: c.completionPercentage }));
  } catch (err) {
    console.error('calculateCompletionRates error', err);
    return [];
  }
}

/**
 * Calculates study streak for a user
 */
export async function calculateStudyStreak(userId: string): Promise<StudyStreakData> {
  try {
    const sessions = await getUserStudySessionsByRange(userId);
    const dates = Array.from(new Set(sessions.map(s => s.startTime.toISOString().slice(0, 10)))).sort().reverse();
    let streak = 0;
    let lastDate = dates[0];
    for (let i = 0; i < dates.length - 1; i++) {
      const curr = new Date(dates[i]);
      const prev = new Date(dates[i + 1]);
      if ((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
      } else {
        break;
      }
    }
    return { streakLength: streak + 1, lastActiveDate: lastDate };
  } catch (err) {
    console.error('calculateStudyStreak error', err);
    return { streakLength: 0, lastActiveDate: '' };
  }
}

/**
 * Prepares study time chart data
 */
export function prepareStudyTimeChartData(data: StudyTimeChartData[]): StudyTimeChartData[] {
  return data;
}

/**
 * Prepares progress chart data
 */
export function prepareProgressChartData(data: ProgressChartData[]): ProgressChartData[] {
  return data;
}

/**
 * Prepares course distribution data for pie charts
 */
export function prepareCourseDistributionData(data: CourseAnalytics[]): DistributionChartData[] {
  return data.map(c => ({ name: `Course ${c.courseRowId}`, value: c.chaptersCompleted }));
}

/**
 * Prepares performance metrics for cards
 */
export function preparePerformanceMetrics(data: CourseAnalytics[]): PerformanceMetricData[] {
  return [
    { label: 'Total Study Time', value: data.reduce((sum, c) => sum + (c.totalTimeSpent || 0), 0), icon: null },
    { label: 'Avg. Progress', value: data.length ? (data.reduce((sum, c) => sum + (c.completionPercentage || 0), 0) / data.length) : 0, icon: null },
    { label: 'Courses', value: data.length, icon: null },
    { label: 'Chapters Completed', value: data.reduce((sum, c) => sum + (c.chaptersCompleted || 0), 0), icon: null },
  ];
}

/**
 * Gets date range filter for analytics
 */
export function getDateRangeFilter(range: AnalyticsTimeRange): DateRangeFilter {
  const now = new Date();
  let start: Date;
  if (range === 'week') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    start = new Date(2000, 0, 1);
  }
  return { start, end: now };
}

/**
 * Filters analytics data by date range
 */
export function filterDataByDateRange<T extends { date: string }>(data: T[], range: DateRangeFilter): T[] {
  const start = range.start.getTime();
  const end = range.end.getTime();
  return data.filter(d => {
    const dt = new Date(d.date).getTime();
    return dt >= start && dt <= end;
  });
}

/**
 * Generates learning insights based on user data
 */
export async function generateLearningInsights(userId: string): Promise<LearningInsight[]> {
  // Placeholder: implement real insight generation logic
  return [
    { title: 'Consistent Study', description: 'You have a strong study streak!', type: 'strength' },
    { title: 'Opportunity', description: 'Try to complete more chapters for higher progress.', type: 'opportunity' },
  ];
}

/**
 * Detects study patterns and trends
 */
export async function detectStudyPatterns(userId: string): Promise<string[]> {
  // Placeholder: implement real pattern detection
  return ['You study most on weekends.', 'Your average session duration is increasing.'];
}
import { db } from '@/configs/db';
import { eq, and, desc, gte, lte, or, isNull } from 'drizzle-orm';
  try {
    const nowTs = convertDateToUnixTimestamp(new Date());
    const clauses = [eq(UserStudySessions.userId, userId)];
    if (range) {
      const start = convertDateToUnixTimestamp(range.start);
      const end = convertDateToUnixTimestamp(range.end);
      clauses.push(
        and(
          gte(UserStudySessions.startTime, start),
          lte(or(isNull(UserStudySessions.endTime), UserStudySessions.endTime), end)
        )
      );
    }
    const sessions = await db
      .select()
      .from(UserStudySessions)
      .where(and(...clauses))
      .orderBy(desc(UserStudySessions.startTime));
    return sessions.map(s => ({
      sessionId: s.sessionId,
      userId: s.userId,
      courseRowId: s.courseRowId,
      chapterRowId: s.chapterRowId,
      startTime: convertUnixTimestampToDate(s.startTime),
      endTime: s.endTime ? convertUnixTimestampToDate(s.endTime) : undefined,
      duration: s.duration ?? undefined,
      sessionType: s.sessionType ?? undefined,
    }));
  } catch (err) {
    console.error('getUserStudySessionsByRange error', err);
    return [];
  }
// All code must be inside exported functions. Remove incomplete top-level fragments.
// ...existing code...
