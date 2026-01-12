
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Clock, 
  Users,
  BookOpen,
  ArrowLeft,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Download,
  Award,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  StickyNote,
  Timer
} from "lucide-react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { AdminEditControls, AdminStatsPanel, AdminViewToggle } from "@/components/admin/AdminEditControls";
import { supabase } from "@/integrations/supabase/client";
import { getVideoEmbedUrl, detectVideoProvider } from "@/utils/videoUrlParser";

interface Resource {
  title: string;
  url: string;
  type?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizData {
  questions: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number; // seconds for UI
  thumbnail_url?: string;
  video_url?: string;
  is_completed: boolean;
  resources?: Resource[];
  quiz_questions?: QuizData;
  course_id?: string; // Referência ao curso
  course_title?: string; // Nome do curso para exibição
}

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  category?: string;
  instructor_name?: string;
  lessons: Lesson[];
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index?: number;
}

interface DashboardSettings {
  banner_title: string;
  banner_subtitle: string;
  banner_image_url: string;
}

interface CoursePlatformNetflixProps {
  user: User | null;
}

const CoursePlatformNetflix = ({ user }: CoursePlatformNetflixProps) => {
  const [currentView, setCurrentView] = useState<'home' | 'course' | 'player'>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [dashboardViewMode, setDashboardViewMode] = useState<'courses' | 'modules' | 'lessons'>('courses');
  const [loading, setLoading] = useState<boolean>(true);
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [dbModules, setDbModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  
  // Estado para configurações do banner (do banco de dados)
  const [bannerSettings, setBannerSettings] = useState<DashboardSettings>({
    banner_title: 'PLATAFORMA DOS SONHOS',
    banner_subtitle: 'Transforme sua vida com nossos cursos exclusivos',
    banner_image_url: '/images/capa02.png'
  });
  
  // Estados para Quiz e Material
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Estados para progresso e anotações
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>({});
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  
  const { toast } = useToast();
  
  
  // Hook para modo admin
  const { isAdmin, adminModeEnabled, toggleAdminMode } = useAdminMode(user);

  // Todos os cursos conforme especificado
  const allCourses: Course[] = [
    {
      id: "1",
      title: "7 CHAVES",
      description: "7 chaves que me ajudam no dia a dia para uma vida mais equilibrada",
      thumbnail_url: "/placeholder.svg",
      category: "Mindset",
      instructor_name: "MaxNutrition",
      lessons: [
        {
          id: "1-1",
          title: "CHAVE 01 - PACIÊNCIA",
          description: "Desenvolvendo a paciência como chave fundamental",
          duration: 930, // 15:30
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "1-2",
          title: "CHAVE 02 - IMAGINAÇÃO",
          description: "O poder da imaginação na transformação pessoal",
          duration: 1125, // 18:45
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "1-3",
          title: "CHAVE 03 - ADAPTAÇÃO",
          description: "Como se adaptar às mudanças da vida",
          duration: 1335, // 22:15
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "1-4",
          title: "CHAVE 04 - HÁBITO",
          description: "Criando hábitos saudáveis e sustentáveis",
          duration: 1200, // 20:00
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "1-5",
          title: "CHAVE 05 - I.E",
          description: "Desenvolvendo a Inteligência Emocional",
          duration: 1530, // 25:30
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "1-6",
          title: "CHAVE 06 - VITIMISMO",
          description: "Superando o vitimismo e assumindo responsabilidades",
          duration: 1155, // 19:15
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "1-7",
          title: "CHAVE 07 - LIBERDADE",
          description: "Encontrando a verdadeira liberdade interior",
          duration: 1725, // 28:45
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        }
      ]
    },
    {
      id: "2",
      title: "E-BOOK 12 CHÁS",
      description: "Guia completo dos 12 chás medicinais para saúde e bem-estar",
      thumbnail_url: "/placeholder.svg",
      category: "Nutrição",
      instructor_name: "MaxNutrition",
      lessons: [
        {
          id: "2-1",
          title: "CHÁ DE ALECRIM",
          description: "Benefícios e preparo do chá de alecrim",
          duration: 750, // 12:30
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "2-2",
          title: "CHÁ DE CANELA",
          description: "Propriedades e uso do chá de canela",
          duration: 945, // 15:45
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "2-3",
          title: "CHÁ DE GENGIBRE",
          description: "Chá de gengibre para saúde e vitalidade",
          duration: 1100, // 18:20
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        }
      ]
    },
    {
      id: "3",
      title: "PÍLULAS DO BEM",
      description: "Suplementos naturais e eficazes para sua saúde",
      thumbnail_url: "/placeholder.svg",
      category: "Saúde",
      instructor_name: "MaxNutrition",
      lessons: [
        {
          id: "3-1",
          title: "PÍLULA 01 - FOCUS",
          description: "Melhorando o foco e concentração",
          duration: 1230, // 20:30
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        },
        {
          id: "3-2",
          title: "PÍLULA 02 - ENERGIA",
          description: "Aumentando os níveis de energia naturalmente",
          duration: 1125, // 18:45
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        }
      ]
    },
    {
      id: "4",
      title: "JEJUM INTERMITENTE",
      description: "Aprenda a técnica do jejum intermitente de forma segura",
      thumbnail_url: "/placeholder.svg",
      category: "Nutrição",
      instructor_name: "MaxNutrition",
      lessons: [
        {
          id: "4-1",
          title: "INTRODUÇÃO AO JEJUM",
          description: "Conceitos básicos do jejum intermitente",
          duration: 1800, // 30:00
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        }
      ]
    },
    {
      id: "5",
      title: "DIA A DIA",
      description: "Dicas práticas para aplicar no seu dia a dia",
      thumbnail_url: "/placeholder.svg",
      category: "Bem-estar",
      instructor_name: "MaxNutrition",
      lessons: [
        {
          id: "5-1",
          title: "ROTINA MATINAL",
          description: "Criando uma rotina matinal eficaz",
          duration: 1530, // 25:30
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        }
      ]
    },
    {
      id: "6",
      title: "EXERCÍCIOS DOS SONHOS",
      description: "Exercícios eficazes que você pode fazer em casa",
      thumbnail_url: "/placeholder.svg",
      category: "Exercício",
      instructor_name: "MaxNutrition",
      lessons: [
        {
          id: "6-1",
          title: "MEMBROS SUPERIORES",
          description: "Exercícios para membros superiores",
          duration: 930, // 15:30
          thumbnail_url: "/placeholder.svg",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          is_completed: false
        }
      ]
    }
  ];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    // Ir direto para o player com a primeira aula
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
  };

  // Handler para clique em módulo
  const handleModuleClick = (module: Module) => {
    // Encontrar o curso do módulo
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
  };

  // Handler para clique direto em aula
  const handleDirectLessonClick = (lesson: Lesson, courseId: string) => {
    const course = dbCourses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setSelectedLesson(lesson);
      setCurrentView('player');
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView('player');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCourse(null);
    setSelectedLesson(null);
  };

  const handleBackToCourse = () => {
    setCurrentView('course');
    setSelectedLesson(null);
  };

  // Funções para navegação entre aulas
  const getCurrentLessonIndex = () => {
    if (!selectedCourse || !selectedLesson) return -1;
    return selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id);
  };

  const goToPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0 && selectedCourse) {
      setSelectedLesson(selectedCourse.lessons[currentIndex - 1]);
    }
  };

  const goToNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (selectedCourse && currentIndex < selectedCourse.lessons.length - 1) {
      setSelectedLesson(selectedCourse.lessons[currentIndex + 1]);
    }
  };

  const hasPreviousLesson = () => getCurrentLessonIndex() > 0;
  const hasNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    return selectedCourse ? currentIndex < selectedCourse.lessons.length - 1 : false;
  };

  // Marcar aula como concluída
  const toggleLessonComplete = async (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    setCompletedLessons(newCompleted);
    
    // Salvar no localStorage para persistência
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
  };

  // Salvar anotações
  const saveNote = () => {
    if (!selectedLesson) return;
    const newNotes = { ...lessonNotes, [selectedLesson.id]: currentNote };
    setLessonNotes(newNotes);
    
    // Salvar no localStorage
    if (user?.id && selectedCourse) {
      const key = `course_notes_${user.id}_${selectedCourse.id}`;
      localStorage.setItem(key, JSON.stringify(newNotes));
    }
    
    setShowNotesModal(false);
    toast({
      title: "📝 Anotação salva!",
      description: "Suas anotações foram salvas com sucesso.",
    });
  };

  // Calcular progresso do curso
  const getCourseProgress = () => {
    if (!selectedCourse || selectedCourse.lessons.length === 0) return 0;
    const completed = selectedCourse.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / selectedCourse.lessons.length) * 100);
  };

  // Calcular tempo restante do curso
  const getRemainingTime = () => {
    if (!selectedCourse) return 0;
    const remainingLessons = selectedCourse.lessons.filter(l => !completedLessons.has(l.id));
    return remainingLessons.reduce((acc, l) => acc + l.duration, 0);
  };

  const formatRemainingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  // Carregar progresso salvo
  useEffect(() => {
    if (user?.id && selectedCourse) {
      // Carregar progresso
      const progressKey = `course_progress_${user.id}_${selectedCourse.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        setCompletedLessons(new Set(JSON.parse(savedProgress)));
      }
      
      // Carregar anotações
      const notesKey = `course_notes_${user.id}_${selectedCourse.id}`;
      const savedNotes = localStorage.getItem(notesKey);
      if (savedNotes) {
        setLessonNotes(JSON.parse(savedNotes));
      }
    }
  }, [user?.id, selectedCourse?.id]);

  const handleSaveEdit = async (data: any) => {
    console.log('Salvando alterações:', data);
    // Salvar configurações do banner no banco de dados
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
        
        // Atualizar estado local
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
  };

  // Carregar configurações do banner do banco de dados
  useEffect(() => {
    const loadBannerSettings = async () => {
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
        
        // Tentar carregar view_mode separadamente (pode não existir)
        try {
          const { data: viewData } = await supabase
            .from('dashboard_settings')
            .select('view_mode')
            .eq('key', 'default')
            .single();
          
          if (viewData?.view_mode) {
            setDashboardViewMode(viewData.view_mode as 'courses' | 'modules' | 'lessons');
          }
        } catch {
          // Coluna view_mode pode não existir ainda
          console.log('Coluna view_mode não encontrada, usando padrão: courses');
        }
      } catch (e) {
        console.error('Erro ao carregar configurações do banner:', e);
      }
    };
    
    loadBannerSettings();
  }, []);

  // Função para salvar o modo de visualização
  const saveViewMode = async (mode: 'courses' | 'modules' | 'lessons') => {
    try {
      // Primeiro, tentar atualizar apenas o view_mode
      const { error } = await supabase
        .from('dashboard_settings')
        .update({
          view_mode: mode,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'default');
      
      if (error) {
        // Se a coluna não existir, apenas mostrar aviso
        console.warn('Coluna view_mode pode não existir ainda:', error.message);
        toast({
          title: "⚠️ Configuração local",
          description: `Modo "${mode === 'courses' ? 'Cursos' : mode === 'modules' ? 'Módulos' : 'Aulas'}" aplicado localmente. Execute a migration para persistir.`,
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
  };

  // Carregar cursos/módulos/aulas do banco e exibir automaticamente
  useEffect(() => {
    const loadData = async () => {
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
            
            // Adicionar ao array de todas as aulas
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
    };

    loadData();
  }, []);

  // HOME VIEW - Estilo Netflix Premium
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Controles Admin */}
        {isAdmin && (
          <>
            <div className="fixed top-4 right-4 z-50">
              <Button
                onClick={toggleAdminMode}
                className={`${adminModeEnabled ? 'bg-destructive hover:bg-destructive/90' : 'bg-card/80 backdrop-blur-md hover:bg-card border border-border'} transition-all duration-300`}
              >
                <Shield className="h-4 w-4 mr-2" />
                {adminModeEnabled ? 'Sair Admin' : 'Modo Admin'}
              </Button>
            </div>
          </>
        )}

        {/* Toggle de visualização - Só para Admin */}
        {isAdmin && adminModeEnabled && (
          <div className="px-4 sm:px-8 md:px-12 lg:px-16 pt-4">
            <AdminViewToggle 
              viewMode={dashboardViewMode} 
              onToggle={setDashboardViewMode}
              onSave={saveViewMode}
            />
          </div>
        )}

        {/* HERO BANNER - Estilo Netflix Cinematográfico */}
        <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[55vh]">
          {adminModeEnabled && (
            <AdminEditControls type="banner" onSave={handleSaveEdit} />
          )}
          
          {/* Background com gradiente cinematográfico */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${bannerSettings.banner_image_url})`
            }}
          >
            {/* Gradientes sobrepostos estilo Netflix - mais fortes para cobrir texto da imagem */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />
          </div>

          {/* Conteúdo do Hero - Simples */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-2xl">
              {adminModeEnabled && (
                <Badge className="mb-3 bg-destructive text-destructive-foreground px-3 py-1">
                  MODO ADMINISTRADOR
                </Badge>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 drop-shadow-2xl text-foreground">
                {bannerSettings.banner_title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl">
                {bannerSettings.banner_subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* CATÁLOGO - Baseado no modo de visualização */}
        <div className="relative z-20 -mt-8 sm:-mt-12 px-4 sm:px-8 md:px-12 lg:px-16 pb-24">
          {/* Título da seção */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              {dashboardViewMode === 'courses' && 'Nossos Cursos'}
              {dashboardViewMode === 'modules' && 'Módulos Disponíveis'}
              {dashboardViewMode === 'lessons' && 'Todas as Aulas'}
            </h2>
            {adminModeEnabled && (
              <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30">
                {dashboardViewMode === 'courses' && `${dbCourses.length} cursos`}
                {dashboardViewMode === 'modules' && `${dbModules.length} módulos`}
                {dashboardViewMode === 'lessons' && `${allLessons.length} aulas`}
              </Badge>
            )}
          </div>

          {/* GRID DE CURSOS */}
          {dashboardViewMode === 'courses' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {dbCourses.map((course) => (
                <div 
                  key={course.id}
                  className="group relative cursor-pointer"
                  onClick={() => handleCourseClick(course)}
                >
                  {adminModeEnabled && (
                    <AdminEditControls 
                      type="course" 
                      course={course as any}
                      onSave={handleSaveEdit}
                    />
                  )}
                  
                  {/* Card Poster Style */}
                  <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/10">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url.replace('http://', 'https://')} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.classList.add('bg-gradient-to-br', 'from-primary/30', 'to-primary/10');
                        }}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <span className="text-4xl opacity-50">🎓</span>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Play Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xs font-semibold text-foreground line-clamp-2 drop-shadow-lg">
                        {course.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Play className="h-2.5 w-2.5" />
                        {course.lessons.length} aulas
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GRID DE MÓDULOS */}
          {dashboardViewMode === 'modules' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {dbModules.map((module) => {
                const course = dbCourses.find(c => c.id === module.course_id);
                const lessonCount = course?.lessons.length || 0;
                
                return (
                  <div 
                    key={module.id}
                    className="group relative cursor-pointer"
                    onClick={() => handleModuleClick(module)}
                  >
                    {/* Card Poster Style */}
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/10">
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <span className="text-4xl opacity-50">📋</span>
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Play Icon on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-xs font-semibold text-foreground line-clamp-2 drop-shadow-lg">
                          {module.title}
                        </h3>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-2.5 w-2.5" />
                          {course?.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {dbModules.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum módulo disponível</p>
                </div>
              )}
            </div>
          )}

          {/* GRID DE AULAS */}
          {dashboardViewMode === 'lessons' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {allLessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  className="group relative cursor-pointer"
                  onClick={() => handleDirectLessonClick(lesson, lesson.course_id || '')}
                >
                  {/* Card Poster Style */}
                  <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/10">
                    {lesson.thumbnail_url && lesson.thumbnail_url !== '/placeholder.svg' ? (
                      <img 
                        src={lesson.thumbnail_url.replace('http://', 'https://')} 
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.classList.add('bg-gradient-to-br', 'from-primary/30', 'to-primary/10');
                        }}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <span className="text-4xl opacity-50">🎬</span>
                      </div>
                    )}
                    
                    {/* Duração */}
                    <div className="absolute top-2 right-2 bg-background/80 px-1.5 py-0.5 rounded text-[10px] text-foreground font-medium">
                      {formatDuration(lesson.duration)}
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Play Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xs font-semibold text-foreground line-clamp-2 drop-shadow-lg">
                        {lesson.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-2.5 w-2.5" />
                        {lesson.course_title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {allLessons.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma aula disponível</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Panel para Admin */}
        {isAdmin && adminModeEnabled && <AdminStatsPanel />}
      </div>
    );
  }

  // COURSE VIEW - Grid de aulas
  if (currentView === 'course' && selectedCourse) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Controles Admin */}
        {isAdmin && adminModeEnabled && <AdminStatsPanel />}

        <div className="p-6">
          <Button 
            variant="outline" 
            onClick={handleBackToHome}
            className="mb-6 border-border text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Cursos
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              {selectedCourse.title}
              {adminModeEnabled && (
                <Badge className="ml-4 bg-destructive text-destructive-foreground">
                  [MODO ADMIN]
                </Badge>
              )}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">{selectedCourse.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{selectedCourse.instructor_name}</span>
              </div>
              <Badge variant="outline" className="border-border text-muted-foreground">
                {selectedCourse.category}
              </Badge>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-foreground">Aulas do Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedCourse.lessons.map((lesson, index) => (
              <Card 
                key={lesson.id} 
                className="bg-card border-border cursor-pointer hover:scale-105 transition-all duration-300 group"
                onClick={() => !adminModeEnabled && handleLessonClick(lesson)}
              >
                <div className="relative aspect-video">
                  <img 
                    src={lesson.thumbnail_url} 
                    alt={lesson.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  {!adminModeEnabled && (
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-300 flex items-center justify-center">
                      <Button 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-background/70 px-2 py-1 rounded text-xs text-foreground">
                    {formatDuration(lesson.duration)}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                    {adminModeEnabled && (
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLessonClick(lesson);
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PLAYER VIEW - Estilo Netflix Premium
  if (currentView === 'player' && selectedLesson && selectedCourse) {
    const currentIndex = getCurrentLessonIndex();
    const progress = getCourseProgress();
    const remainingTime = getRemainingTime();
    const isLessonCompleted = completedLessons.has(selectedLesson.id);
    
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Controles Admin */}
        {isAdmin && adminModeEnabled && (
          <>
            <AdminStatsPanel />
            <AdminEditControls 
              type="lesson" 
              lesson={selectedLesson as any}
              onSave={handleSaveEdit}
            />
          </>
        )}

        {/* Header compacto */}
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToHome}
              className="text-muted-foreground hover:text-foreground hover:bg-muted -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            {/* Progresso compacto - Desktop */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span>{progress}%</span>
              <Progress value={progress} className="h-1.5 w-24" />
              {remainingTime > 0 && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {formatRemainingTime(remainingTime)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Layout do Player */}
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 pb-24">
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
            
            {/* Player Principal */}
            <div className="flex-1">
              {/* Container do vídeo */}
              <div className="relative rounded-xl overflow-hidden shadow-xl ring-1 ring-border">
                {(() => {
                  const videoUrl = selectedLesson.video_url;
                  const provider = detectVideoProvider(videoUrl);
                  const embedUrl = getVideoEmbedUrl(videoUrl);
                  const isOneDrive = provider.type === 'onedrive';
                  
                  return (
                    <>
                      <div className="relative w-full aspect-video bg-muted">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full border-0"
                          title={selectedLesson.title}
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
                        />
                      </div>
                      {isOneDrive && (
                        <div className="absolute bottom-3 right-3">
                          <Button
                            asChild
                            size="sm"
                            className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs"
                          >
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="h-3 w-3 mr-1 fill-primary-foreground" />
                              OneDrive
                            </a>
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {/* Info + Ações em linha */}
              <div className="mt-4">
                {/* Título e navegação */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                      {selectedLesson.title}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="text-primary font-medium">{selectedCourse.title}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(selectedLesson.duration)}
                      </span>
                      <span>•</span>
                      <span>Aula {currentIndex + 1}/{selectedCourse.lessons.length}</span>
                    </div>
                  </div>
                  
                  {/* Navegação compacta */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToPreviousLesson}
                      disabled={!hasPreviousLesson()}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToNextLesson}
                      disabled={!hasNextLesson()}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Descrição */}
                {selectedLesson.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {selectedLesson.description}
                  </p>
                )}

                {/* Botões de Ação - Todos em linha */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Marcar como Concluída */}
                  <Button 
                    variant={isLessonCompleted ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLessonComplete(selectedLesson.id)}
                    className={isLessonCompleted 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs" 
                      : "border-border hover:bg-muted text-foreground h-8 text-xs"
                    }
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {isLessonCompleted ? 'Concluída' : 'Concluir'}
                  </Button>
                  
                  {/* Anotações */}
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted text-foreground h-8 text-xs"
                    onClick={() => {
                      setCurrentNote(lessonNotes[selectedLesson.id] || '');
                      setShowNotesModal(true);
                    }}
                  >
                    <StickyNote className="h-3 w-3 mr-1" />
                    Notas
                    {lessonNotes[selectedLesson.id] && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Button>
                  
                  {/* Material - Só se tiver */}
                  {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-muted text-foreground h-8 text-xs"
                      onClick={() => setShowMaterialModal(true)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Material ({selectedLesson.resources.length})
                    </Button>
                  )}

                  {/* Quiz - Só se tiver */}
                  {selectedLesson.quiz_questions?.questions?.length > 0 && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-muted text-foreground h-8 text-xs"
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                        setQuizScore(0);
                        setShowQuizModal(true);
                      }}
                    >
                      <Award className="h-3 w-3 mr-1" />
                      Quiz ({selectedLesson.quiz_questions.questions.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Aulas - Sidebar Compacta */}
            <div className="w-full xl:w-72 shrink-0">
              <div className="sticky top-4">
                {/* Progresso Mobile */}
                <div className="sm:hidden mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{progress}%</span>
                  <Progress value={progress} className="h-1.5 flex-1" />
                  {remainingTime > 0 && (
                    <span>{formatRemainingTime(remainingTime)}</span>
                  )}
                </div>
                
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Aulas ({selectedCourse.lessons.length})
                </h3>
                
                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {selectedCourse.lessons.map((lesson, index) => {
                    const isActive = lesson.id === selectedLesson.id;
                    const isCompleted = completedLessons.has(lesson.id);
                    return (
                      <div 
                        key={lesson.id}
                        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card/60 hover:bg-muted/80'
                        }`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {/* Número/Check */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                          isCompleted 
                            ? isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/20 text-primary'
                            : isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-medium truncate ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {lesson.title}
                          </h4>
                          <span className={`text-[10px] ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {formatDuration(lesson.duration)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Material de Apoio */}
        <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
          <DialogContent className="bg-card border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Material de Apoio
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {selectedLesson.resources?.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    toast({
                      title: "Download iniciado",
                      description: `Baixando ${resource.title}...`,
                    });
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">{resource.type || 'Arquivo'}</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
              {(!selectedLesson.resources || selectedLesson.resources.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum material disponível para esta aula.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Quiz */}
        <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
          <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Quiz: {selectedLesson.title}
              </DialogTitle>
            </DialogHeader>
            
            {!quizSubmitted ? (
              <div className="space-y-6 mt-4">
                {selectedLesson.quiz_questions?.questions?.map((q, qIndex) => (
                  <div key={qIndex} className="bg-muted rounded-lg p-4">
                    <p className="font-medium text-foreground mb-3">
                      {qIndex + 1}. {q.question}
                    </p>
                    <RadioGroup
                      value={quizAnswers[qIndex]?.toString()}
                      onValueChange={(value) => setQuizAnswers({...quizAnswers, [qIndex]: parseInt(value)})}
                    >
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2 py-2">
                          <RadioGroupItem 
                            value={oIndex.toString()} 
                            id={`q${qIndex}-o${oIndex}`}
                            className="border-muted-foreground text-primary"
                          />
                          <Label 
                            htmlFor={`q${qIndex}-o${oIndex}`} 
                            className="text-muted-foreground cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    const questions = selectedLesson.quiz_questions?.questions || [];
                    let correct = 0;
                    questions.forEach((q, i) => {
                      if (quizAnswers[i] === q.correct) correct++;
                    });
                    setQuizScore(correct);
                    setQuizSubmitted(true);
                  }}
                  disabled={Object.keys(quizAnswers).length !== (selectedLesson.quiz_questions?.questions?.length || 0)}
                >
                  Enviar Respostas
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  quizScore >= (selectedLesson.quiz_questions?.questions?.length || 0) * 0.7 
                    ? 'bg-primary/20' 
                    : 'bg-amber-500/20'
                }`}>
                  <Award className={`h-10 w-10 ${
                    quizScore >= (selectedLesson.quiz_questions?.questions?.length || 0) * 0.7 
                      ? 'text-primary' 
                      : 'text-amber-500'
                  }`} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {quizScore} / {selectedLesson.quiz_questions?.questions?.length || 0}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {quizScore >= (selectedLesson.quiz_questions?.questions?.length || 0) * 0.7 
                    ? 'Parabéns! Você foi muito bem!' 
                    : 'Continue estudando e tente novamente!'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    className="border-border text-foreground hover:bg-muted"
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                  >
                    Tentar Novamente
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setShowQuizModal(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Anotações */}
        <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
          <DialogContent className="bg-card border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                Anotações: {selectedLesson.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Escreva suas anotações sobre esta aula..."
                className="min-h-[200px] bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-muted"
                  onClick={() => setShowNotesModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={saveNote}
                >
                  Salvar Anotação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
};

export default CoursePlatformNetflix;