import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  startStudySession,
  endStudySession,
  updateSessionDuration,
  findCourseRowId,
  findChapterRowId,
} from "@/app/_services/analyticsService";

// Helper for debounced interval
function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function useStudySession(courseId: string, chapterId?: number) {
  const { user } = useUser();
  const sessionIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    let isMounted = true;
    async function startSession() {
      try {
        const courseRowId = await findCourseRowId(courseId);
        const chapterRowId = chapterId
          ? await findChapterRowId(courseId, chapterId)
          : undefined;
        if (!user?.id || !courseRowId) return;
        const sessionId = await startStudySession(
          user.id,
          courseRowId,
          chapterRowId
        );
        if (isMounted) sessionIdRef.current = sessionId;
        startTimeRef.current = Math.floor(Date.now() / 1000);
      } catch (err) {
        /* silent */
      }
    }
    startSession();
    return () => {
      isMounted = false;
    };
  }, [user?.id, courseId, chapterId]);

  useInterval(() => {
    if (!sessionIdRef.current) return;
    const now = Math.floor(Date.now() / 1000);
    updateSessionDuration(
      sessionIdRef.current,
      now - startTimeRef.current
    ).catch(() => {});
  }, 30000);

  useEffect(() => {
    return () => {
      if (sessionIdRef.current)
        endStudySession(sessionIdRef.current).catch(() => {});
    };
  }, []);

  return { sessionId: sessionIdRef.current };
}

export function useChapterTracking(courseId: string, chapterId: number) {
  return useStudySession(courseId, chapterId);
}

export function useCourseTracking(courseId: string) {
  return useStudySession(courseId);
}
