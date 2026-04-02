import { supabase } from "@/services/supabaseClient";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export const LessonContext = createContext();

export const useLesson = () => useContext(LessonContext);

export const LessonProvider = ({ children }) => {
  const [lessons, setLessons] = useState([]);
  const [lessonsWithStatus, setLessonsWithStatus] = useState([]);
  const [domainProgress, setDomainProgress] = useState({});
  const [domain, setDomain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    if (!user?.profile?.id) return;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = user.profile.id;

        const [
          { data: lessonData, error: lessonError },
          { data: progressData, error: progressError },
          { data: completionData, error: completionError },
        ] = await Promise.all([
          supabase
            .from("lessons")
            .select('id, domain, title, description, "order", created_at')
            .order("order", { ascending: true }),

          supabase
            .from("progress")
            .select("domain, completion_percentage")
            .eq("user_id", userId),

          supabase
            .from("lesson_completions")
            .select("lesson_id, completed, completed_at, progress")
            .eq("user_id", userId),
        ]);

        if (lessonError) throw lessonError;
        if (progressError) throw progressError;
        if (completionError) throw completionError;

        if (!mounted) return;

        setLessons(lessonData);

        if (lessonData?.length > 0) {
          setDomain([
            ...new Set(lessonData.map((l) => l.domain).filter(Boolean)),
          ]);
        }

        const progMap = {};
        progressData?.forEach((p) => {
          progMap[p.domain] = p.completion_percentage ?? 0;
        });
        setDomainProgress(progMap);

        const completionMap = {};
        completionData?.forEach((c) => {
          completionMap[c.lesson_id] = c;
        });

        const mergedLessons = lessonData.map((lesson) => {
          const c = completionMap[lesson.id] || {};
          return {
            ...lesson,
            completed: c.completed ?? false,
            completed_at: c.completed_at ?? null,
            status: c.progress ?? "Not Started",
          };
        });

        setLessonsWithStatus(mergedLessons);
      } catch (err) {
        console.error("Fetch error", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, [user]);
  return (
    <LessonContext.Provider
      value={{
        lessons,
        domain,
        domainProgress,
        setDomainProgress,
        lessonsWithStatus,
        setLessonsWithStatus,
        loading,
        error,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
};
