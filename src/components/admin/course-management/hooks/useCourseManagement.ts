import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
  instructor_name: string;
  is_premium: boolean;
  is_published: boolean;
  thumbnail_url?: string;
  price?: number;
  structure_type: 'course_lesson' | 'course_module_lesson';
  created_at: string;
  modules_count?: number;
  lessons_count?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  course_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  lessons_count?: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  module_id: string;
  order_index: number;
  duration_minutes: number;
  video_url?: string;
  is_free: boolean;
  created_at: string;
}

interface Stats {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalStudents: number;
}

export const useCourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalModules: 0,
    totalLessons: 0,
    totalStudents: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      const { count: modulesCount } = await supabase
        .from('course_modules')
        .select('*', { count: 'exact', head: true });

      const { count: lessonsCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalCourses: coursesCount || 0,
        totalModules: modulesCount || 0,
        totalLessons: lessonsCount || 0,
        totalStudents: studentsCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const coursesWithCounts = await Promise.all(
        (data || []).map(async (courseData: Course) => {
          const course = courseData;
          const { data: modulesData } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', course.id)
            .limit(50);

          const moduleIds = modulesData?.map(m => m.id) || [];
          let lessonsCount = 0;

          if (moduleIds.length > 0) {
            const { count } = await supabase
              .from('lessons')
              .select('*', { count: 'exact', head: true })
              .in('module_id', moduleIds);
            lessonsCount = count || 0;
          }

          return {
            ...course,
            modules_count: modulesData?.length || 0,
            lessons_count: lessonsCount || 0
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cursos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModules = useCallback(async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .limit(50);

      if (error) throw error;

      const modulesWithCounts = await Promise.all(
        (data || []).map(async (module: Module) => {
          const { count: lessonsCount } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', module.id);

          return {
            ...module,
            lessons_count: lessonsCount || 0
          };
        })
      );

      setModules(modulesWithCounts);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
    }
  }, []);

  const fetchLessons = useCallback(async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })
        .limit(50);

      if (error) throw error;

      setLessons(
        (data || []).map((lesson) => ({
          ...lesson,
          description: lesson.description ?? "",
          is_free: lesson.is_free ?? true,
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCourses();
  }, [fetchStats, fetchCourses]);

  return {
    courses,
    modules,
    lessons,
    loading,
    stats,
    fetchStats,
    fetchCourses,
    fetchModules,
    fetchLessons
  };
};
