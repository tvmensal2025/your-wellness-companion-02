import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course, Lesson, Module } from "../CourseCard";
import { DashboardSettings, DashboardViewMode } from "../CourseHeader";

/**
 * Custom hook for managing course platform data and state
 * 
 * Centralizes all data fetching, state management, and business logic
 * for the course platform.
 */
export const useCourseData = (user: User | null) => {
  const { toast } = useToast();
  
  // View state
  const [currentView, setCurrentView] = useState<'home' | 'course' | 'player'>('home');
  const [dashboardViewMode, setDashboardViewMode] = useState<DashboardViewMode>('courses');
  
  // Selection state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // Data state
  const [loading, setLoading] = useState<boolean>(true);
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [dbModules, setDbModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  
  // Banner settings
  const [bannerSettings, setBannerSettings] = useState<DashboardSettings>({
    banner_title: 'PLATAFORMA DOS SONHOS',
    banner_subtitle: 'Transforme sua vida com nossos cursos exclusivos',
    banner_image_url: '/images/capa02.png'
  });
  
  // Progress state
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>({});
  
  /**
   * Load courses, modules, and lessons from database
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      const courses: Course[] = [];
      const allModules: Module[] = [];
      const allLessonsTemp: Lesson[] = [];

      await Promise.all(
        (coursesData || []).map(async (c: any) => {
          const courseBase: Course = {
            id: c.id,
            title: c.title,
            description: c.description ?? undefined,
            thumbnail_url: c.thumbnail_url ?? undefined,
            category: c.category ?? undefined,
            instructor_name: c.instructor_name ?? undefined,
            lessons: [],
          };

          const { data: modulesData, error: modulesError } = await supabase
            .from('course_modules')
            .select('*')
            .eq('course_id', c.id)
            .order('order_index', { ascending: true });
          if (modulesError) throw modulesError;

          const moduleIds = (modulesData || []).map((m: any) => m.id);
          if ((modulesData || []).length > 0) {
            allModules.push(
              ...modulesData.map((m: any) => ({
                id: m.id,
                course_id: m.course_id,
                title: m.title,
                description: m.description ?? undefined,
                order_index: m.order_index ?? undefined,
              }))
            );
          }

          let lessonsRows: any[] = [];
          if (moduleIds.length > 0) {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .in('module_id', moduleIds)
              .order('order_index', { ascending: true });

            if (!lessonsError && lessonsData && lessonsData.length > 0) {
              lessonsRows = lessonsData;
            } else {
              const { data: clData } = await (supabase as any)
                .from('course_lessons')
                .select('*')
                .in('module_id', moduleIds)
                .order('order_index', { ascending: true });
              lessonsRows = clData || [];
            }
          }

          const courseLessons = (lessonsRows || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            description: l.description ?? undefined,
            duration: (l.duration_minutes || 0) * 60,
            thumbnail_url: l.thumbnail_url ?? '/placeholder.svg',
            video_url: l.video_url ?? undefined,
            is_completed: false,
            resources: l.resources ?? undefined,
            quiz_questions: l.quiz_questions ?? undefined,
            course_id: c.id,
            course_title: c.title,
          }));

          courseBase.lessons = courseLessons;
          courses.push(courseBase);
          
          allLessonsTemp.push(...courseLessons);
        })
      );

      setDbCourses(courses);
      setDbModules(allModules);
      setAllLessons(allLessonsTemp);
    } catch (e) {
      console.error('Falha ao carregar cursos/módulos/aulas:', e);
      setDbCourses([]);
      setDbModules([]);
      setAllLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load banner settings from database
   */
  const loadBannerSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_settings')
        .select('banner_title, banner_subtitle, banner_image_url')
        .eq('key', 'default')
        .single();
      
      if (!error && data) {
        setBannerSettings({
          banner_title: data.banner_title || 'PLATAFORMA DOS SONHOS',
          banner_subtitle: data.banner_subtitle || 'Transforme sua vida com nossos cursos exclusivos',
          banner_image_url: data.banner_image_url || '/images/capa02.png'
        });
      }
      
      try {
        const { data: viewData } = await supabase
          .from('dashboard_settings')
          .select('view_mode')
          .eq('key', 'default')
          .single();
        
        if (viewData?.view_mode) {
          setDashboardViewMode(viewData.view_mode as DashboardViewMode);
        }
      } catch {
        console.log('Coluna view_mode não encontrada, usando padrão: courses');
      }
    } catch (e) {
      console.error('Erro ao carregar configurações do banner:', e);
    }
  }, []);

  /**
   * Save view mode to database
   */
  const saveViewMode = useCallback(async (mode: DashboardViewMode) => {
    try {
      const { error } = await supabase
        .from('dashboard_settings')
        .update({
          view_mode: mode,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'default');
      
      if (error) {
        console.warn('Coluna view_mode pode não existir ainda:', error.message);
        toast({
          title: "⚠️ Configuração local",
          description: `Modo "${mode === 'courses' ? 'Cursos' : mode === 'modules' ? 'Módulos' : 'Aulas'}" aplicado localmente.`,
        });
        return;
      }
      
      toast({
        title: "✅ Configuração salva!",
        description: `Usuários verão "${mode === 'courses' ? 'Cursos' : mode === 'modules' ? 'Módulos' : 'Aulas'}" primeiro.`,
      });
    } catch (e) {
      console.error('Erro ao salvar modo de visualização:', e);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    }
  }, [toast]);

  /**
   * Handle course click - navigate to player with first lesson
   */
  const handleCourseClick = useCallback((course: Course) => {
    setSelectedCourse(course);
    if (course.lessons && course.lessons.length > 0) {
      setSelectedLesson(course.lessons[0]);
      setCurrentView('player');
    } else {
      toast({
        title: "Curso sem aulas",
        description: "Este curso ainda não possui aulas disponíveis.",
        variant: "destructive"
      });
    }
  }, [toast]);

  /**
   * Handle module click - navigate to player with first lesson of module's course
   */
  const handleModuleClick = useCallback((module: Module) => {
    const course = dbCourses.find(c => c.id === module.course_id);
    if (course && course.lessons.length > 0) {
      setSelectedCourse(course);
      setSelectedLesson(course.lessons[0]);
      setCurrentView('player');
    } else {
      toast({
        title: "Módulo sem aulas",
        description: "Este módulo ainda não possui aulas disponíveis.",
        variant: "destructive"
      });
    }
  }, [dbCourses, toast]);

  /**
   * Handle direct lesson click - navigate to player
   */
  const handleDirectLessonClick = useCallback((lesson: Lesson, courseId: string) => {
    const course = dbCourses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setSelectedLesson(lesson);
      setCurrentView('player');
    }
  }, [dbCourses]);

  /**
   * Handle lesson click within a course
   */
  const handleLessonClick = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView('player');
  }, []);

  /**
   * Navigate back to home view
   */
  const handleBackToHome = useCallback(() => {
    setCurrentView('home');
    setSelectedCourse(null);
    setSelectedLesson(null);
  }, []);

  /**
   * Toggle lesson completion status
   */
  const toggleLessonComplete = useCallback(async (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    setCompletedLessons(newCompleted);
    
    if (user?.id && selectedCourse) {
      const key = `course_progress_${user.id}_${selectedCourse.id}`;
      localStorage.setItem(key, JSON.stringify(Array.from(newCompleted)));
    }
    
    toast({
      title: newCompleted.has(lessonId) ? "✅ Aula concluída!" : "Aula desmarcada",
      description: newCompleted.has(lessonId) 
        ? "Continue assim! Você está progredindo." 
        : "Você pode remarcar quando quiser.",
    });
  }, [completedLessons, user?.id, selectedCourse, toast]);

  /**
   * Save lesson note
   */
  const saveNote = useCallback((lessonId: string, note: string) => {
    const newNotes = { ...lessonNotes, [lessonId]: note };
    setLessonNotes(newNotes);
    
    if (user?.id && selectedCourse) {
      const key = `course_notes_${user.id}_${selectedCourse.id}`;
      localStorage.setItem(key, JSON.stringify(newNotes));
    }
    
    toast({
      title: "📝 Anotação salva!",
      description: "Suas anotações foram salvas com sucesso.",
    });
  }, [lessonNotes, user?.id, selectedCourse, toast]);

  /**
   * Calculate course progress percentage
   */
  const getCourseProgress = useCallback(() => {
    if (!selectedCourse || selectedCourse.lessons.length === 0) return 0;
    const completed = selectedCourse.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / selectedCourse.lessons.length) * 100);
  }, [selectedCourse, completedLessons]);

  /**
   * Calculate remaining time in seconds
   */
  const getRemainingTime = useCallback(() => {
    if (!selectedCourse) return 0;
    const remainingLessons = selectedCourse.lessons.filter(l => !completedLessons.has(l.id));
    return remainingLessons.reduce((acc, l) => acc + l.duration, 0);
  }, [selectedCourse, completedLessons]);

  /**
   * Handle admin save actions
   */
  const handleSaveEdit = useCallback(async (data: any) => {
    console.log('Salvando alterações:', data);
    if (data.title || data.subtitle || data.banner_url) {
      try {
        const { error } = await supabase
          .from('dashboard_settings')
          .upsert({
            key: 'default',
            banner_title: data.title || bannerSettings.banner_title,
            banner_subtitle: data.subtitle || bannerSettings.banner_subtitle,
            banner_image_url: data.banner_url || bannerSettings.banner_image_url,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        
        if (error) throw error;
        
        setBannerSettings(prev => ({
          ...prev,
          banner_title: data.title || prev.banner_title,
          banner_subtitle: data.subtitle || prev.banner_subtitle,
          banner_image_url: data.banner_url || prev.banner_image_url
        }));
        
        toast({
          title: "Sucesso!",
          description: "Configurações do banner atualizadas.",
        });
      } catch (e) {
        console.error('Erro ao salvar banner:', e);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive"
        });
      }
    }
  }, [bannerSettings, toast]);

  // Load data on mount
  useEffect(() => {
    loadData();
    loadBannerSettings();
  }, [loadData, loadBannerSettings]);

  // Load progress when course changes
  useEffect(() => {
    if (user?.id && selectedCourse) {
      const progressKey = `course_progress_${user.id}_${selectedCourse.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        setCompletedLessons(new Set(JSON.parse(savedProgress)));
      }
      
      const notesKey = `course_notes_${user.id}_${selectedCourse.id}`;
      const savedNotes = localStorage.getItem(notesKey);
      if (savedNotes) {
        setLessonNotes(JSON.parse(savedNotes));
      }
    }
  }, [user?.id, selectedCourse?.id]);

  return {
    // View state
    currentView,
    setCurrentView,
    dashboardViewMode,
    setDashboardViewMode,
    
    // Selection state
    selectedCourse,
    selectedLesson,
    
    // Data state
    loading,
    dbCourses,
    dbModules,
    allLessons,
    bannerSettings,
    
    // Progress state
    completedLessons,
    lessonNotes,
    
    // Handlers
    handleCourseClick,
    handleModuleClick,
    handleDirectLessonClick,
    handleLessonClick,
    handleBackToHome,
    toggleLessonComplete,
    saveNote,
    handleSaveEdit,
    saveViewMode,
    
    // Computed values
    getCourseProgress,
    getRemainingTime,
  };
};
