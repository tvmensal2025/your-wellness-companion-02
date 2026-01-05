// @ts-nocheck
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  CheckCircle
} from "lucide-react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { AdminEditControls, AdminStatsPanel, AdminViewToggle } from "@/components/admin/AdminEditControls";
import { supabase } from "@/integrations/supabase/client";
import { getVideoEmbedUrl, detectVideoProvider } from "@/utils/videoUrlParser";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number; // seconds for UI
  thumbnail_url?: string;
  video_url?: string;
  is_completed: boolean;
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

interface CoursePlatformNetflixProps {
  user: User | null;
}

const CoursePlatformNetflix = ({ user }: CoursePlatformNetflixProps) => {
  const [currentView, setCurrentView] = useState<'home' | 'course' | 'player'>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [dashboardViewMode, setDashboardViewMode] = useState<'courses' | 'modules'>('courses');
  const [loading, setLoading] = useState<boolean>(true);
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [dbModules, setDbModules] = useState<Module[]>([]);
  
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
      instructor_name: "Instituto dos Sonhos",
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
      instructor_name: "Instituto dos Sonhos",
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
      instructor_name: "Instituto dos Sonhos",
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
      instructor_name: "Instituto dos Sonhos",
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
      instructor_name: "Instituto dos Sonhos",
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
      instructor_name: "Instituto dos Sonhos",
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
    // Se o curso tem aulas, ir direto para a primeira aula (player)
    if (course.lessons && course.lessons.length > 0) {
      setSelectedLesson(course.lessons[0]);
      setCurrentView('player');
    } else {
      // Se não tem aulas, mostra a tela do curso
      setCurrentView('course');
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

  const handleSaveEdit = (data: any) => {
    console.log('Salvando alterações:', data);
    // Aqui você implementaria a lógica para salvar no banco de dados
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

            courseBase.lessons = (lessonsRows || []).map((l: any) => ({
              id: l.id,
              title: l.title,
              description: l.description ?? undefined,
              duration: (l.duration_minutes || 0) * 60,
              thumbnail_url: l.thumbnail_url ?? '/placeholder.svg',
              video_url: l.video_url ?? undefined,
              is_completed: false,
            }));

            courses.push(courseBase);
          })
        );

        setDbCourses(courses);
        setDbModules(allModules);
      } catch (e) {
        console.error('Falha ao carregar cursos/módulos/aulas:', e);
        setDbCourses([]);
        setDbModules([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // HOME VIEW - Estilo Netflix Premium
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black text-white relative overflow-hidden">
        {/* Controles Admin */}
        {isAdmin && (
          <>
            <div className="fixed top-4 right-4 z-50">
              <Button
                onClick={toggleAdminMode}
                className={`${adminModeEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20'} transition-all duration-300`}
              >
                <Shield className="h-4 w-4 mr-2" />
                {adminModeEnabled ? 'Sair Admin' : 'Modo Admin'}
              </Button>
            </div>
            {adminModeEnabled && (
              <AdminViewToggle 
                viewMode={dashboardViewMode} 
                onToggle={setDashboardViewMode} 
              />
            )}
            {adminModeEnabled && <AdminStatsPanel />}
          </>
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
              backgroundImage: dbCourses[0]?.thumbnail_url 
                ? `url(${dbCourses[0].thumbnail_url})` 
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
            }}
          >
            {/* Gradientes sobrepostos estilo Netflix */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>

          {/* Conteúdo do Hero - Simples */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-2xl">
              {adminModeEnabled && (
                <Badge className="mb-3 bg-red-600 text-white px-3 py-1">
                  ADMIN MODE
                </Badge>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 drop-shadow-2xl">
                PLATAFORMA DOS SONHOS
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-xl">
                Transforme sua vida com nossos cursos exclusivos
              </p>
            </div>
          </div>
        </div>

        {/* CATÁLOGO DE CURSOS */}
        <div className="relative z-20 -mt-8 sm:-mt-12 px-4 sm:px-8 md:px-12 lg:px-16 pb-16">
          {/* Título da seção */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
              Nossos Cursos
            </h2>
            {adminModeEnabled && (
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {dbCourses.length} cursos
              </Badge>
            )}
          </div>

          {/* Grid de cursos - Cards Poster Style (2:3 vertical) */}
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
                
                {/* Card Poster Style - Aspect 2:3 */}
                <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-white/10 group-hover:z-30">
                  {/* Imagem */}
                  <img 
                    src={course.thumbnail_url || '/placeholder.svg'} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play button central no hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Título no hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 drop-shadow-lg">
                      {course.title}
                    </h3>
                    <span className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {course.lessons.length} aulas
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // COURSE VIEW - Grid de aulas
  if (currentView === 'course' && selectedCourse) {
    return (
      <div className="min-h-screen bg-black text-white relative">
        {/* Controles Admin */}
        {isAdmin && adminModeEnabled && <AdminStatsPanel />}

        <div className="p-6">
          <Button 
            variant="outline" 
            onClick={handleBackToHome}
            className="mb-6 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Cursos
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {selectedCourse.title}
              {adminModeEnabled && (
                <Badge className="ml-4 bg-red-600 text-white">
                  [ADMIN MODE]
                </Badge>
              )}
            </h1>
            <p className="text-xl text-gray-400 mb-4">{selectedCourse.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>{selectedCourse.instructor_name}</span>
              </div>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {selectedCourse.category}
              </Badge>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Aulas do Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedCourse.lessons.map((lesson, index) => (
              <Card 
                key={lesson.id} 
                className="bg-gray-900 border-gray-700 cursor-pointer hover:scale-105 transition-all duration-300 group"
                onClick={() => !adminModeEnabled && handleLessonClick(lesson)}
              >
                <div className="relative aspect-video">
                  <img 
                    src={lesson.thumbnail_url} 
                    alt={lesson.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  {!adminModeEnabled && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <Button 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-black hover:bg-white/90"
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                    {formatDuration(lesson.duration)}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-2">{lesson.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                    {adminModeEnabled && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
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

        {/* Header minimalista */}
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para Cursos
          </Button>
        </div>

        {/* Layout do Player */}
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 pb-16">
          <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
            
            {/* Player Principal */}
            <div className="flex-1">
              {/* Container do vídeo com sombra cinematográfica */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                {(() => {
                  const videoUrl = selectedLesson.video_url;
                  const provider = detectVideoProvider(videoUrl);
                  const embedUrl = getVideoEmbedUrl(videoUrl);
                  const isOneDrive = provider.type === 'onedrive';
                  
                  return (
                    <>
                      <div className="relative w-full aspect-video bg-zinc-900">
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
                        <div className="absolute bottom-4 right-4">
                          <Button
                            asChild
                            size="sm"
                            className="bg-white/90 hover:bg-white text-black font-semibold"
                          >
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-2 fill-black" />
                              Abrir no OneDrive
                            </a>
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {/* Info do vídeo */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                      {selectedLesson.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm sm:text-base text-gray-400">
                      <span className="text-red-500 font-semibold">{selectedCourse.title}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(selectedLesson.duration)}
                      </span>
                    </div>
                  </div>
                  {adminModeEnabled && (
                    <Badge className="bg-red-600 text-white shrink-0">
                      ADMIN MODE
                    </Badge>
                  )}
                </div>
                
                {selectedLesson.description && (
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-4xl">
                    {selectedLesson.description}
                  </p>
                )}

                {/* Seção de Download e Quiz */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Download */}
                  <div className="bg-zinc-800/60 rounded-xl p-5 border border-zinc-700/50 hover:border-zinc-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <Download className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Material de Apoio</h4>
                        <p className="text-xs text-gray-400">Arquivos para download</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Baixar Material
                    </Button>
                  </div>

                  {/* Quiz */}
                  <div className="bg-zinc-800/60 rounded-xl p-5 border border-zinc-700/50 hover:border-zinc-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Quiz da Aula</h4>
                        <p className="text-xs text-gray-400">Teste seu conhecimento</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Iniciar Quiz
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Aulas - Sidebar */}
            <div className="w-full xl:w-96 shrink-0">
              <div className="sticky top-4">
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-red-500" />
                  Aulas do Curso
                  <span className="text-sm font-normal text-gray-500">
                    ({selectedCourse.lessons.length})
                  </span>
                </h3>
                
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  {selectedCourse.lessons.map((lesson, index) => {
                    const isActive = lesson.id === selectedLesson.id;
                    return (
                      <div 
                        key={lesson.id}
                        className={`group flex gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                          isActive 
                            ? 'bg-red-600/90 ring-2 ring-red-500' 
                            : 'bg-zinc-800/80 hover:bg-zinc-700/80'
                        }`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-28 h-16 shrink-0 rounded-md overflow-hidden bg-zinc-900">
                          <img 
                            src={lesson.thumbnail_url || '/placeholder.svg'} 
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Play overlay */}
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="h-4 w-4 text-black fill-black ml-0.5" />
                            </div>
                          </div>
                          {/* Duração */}
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {formatDuration(lesson.duration)}
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-gray-400 mb-1 block">
                            Aula {index + 1}
                          </span>
                          <h4 className={`font-medium text-sm line-clamp-2 ${isActive ? 'text-white' : 'text-gray-200'}`}>
                            {lesson.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CoursePlatformNetflix;