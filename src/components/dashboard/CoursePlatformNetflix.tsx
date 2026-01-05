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
  EyeOff
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
    setCurrentView('course');
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

  // HOME VIEW - Grid de cursos (320x480px cards)
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-black text-white relative">
        {/* Controles Admin */}
        {isAdmin && (
          <>
            {/* Botão para ativar modo admin */}
            <div className="fixed top-4 right-4 z-50">
              <Button
                onClick={toggleAdminMode}
                className={`${adminModeEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <Shield className="h-4 w-4 mr-2" />
                {adminModeEnabled ? 'Sair Admin' : 'Modo Admin'}
              </Button>
            </div>

            {/* Toggle para escolher entre cursos e módulos */}
            {adminModeEnabled && (
              <AdminViewToggle 
                viewMode={dashboardViewMode} 
                onToggle={setDashboardViewMode} 
              />
            )}

            {/* Painel de estatísticas */}
            {adminModeEnabled && <AdminStatsPanel />}
          </>
        )}

        {/* Banner/Video no topo - Responsivo */}
        <div className="relative h-32 sm:h-48 md:h-64 lg:h-80 mb-3 sm:mb-4 md:mb-6 rounded-lg overflow-hidden mx-2 sm:mx-4 md:mx-6 mt-2 sm:mt-4">
          {/* Controles admin do banner */}
          {adminModeEnabled && (
            <AdminEditControls 
              type="banner" 
              onSave={handleSaveEdit}
            />
          )}
          
          {showVideo ? (
            <div className="absolute inset-0">
              <video
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
                poster="/placeholder.svg"
              >
                <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url(/placeholder.svg)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
            </div>
          )}
          
          <div className="relative z-10 flex items-end justify-between h-full p-4 sm:p-6 md:p-8">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                PLATAFORMA DOS SONHOS
                {adminModeEnabled && (
                  <Badge className="ml-2 bg-red-600 text-white text-[10px] sm:text-xs">
                    ADMIN
                  </Badge>
                )}
              </h1>
              <p className="text-xs sm:text-sm md:text-base opacity-90">Novo conteúdo mensalmente</p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowVideo(!showVideo)}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9"
            >
              {showVideo ? (
                <BookOpen className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Grid de cursos - Cards Responsivos */}
        <div className="px-2 sm:px-4 md:px-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold">
              {dashboardViewMode === 'courses' ? 'Todos os Cursos' : 'Módulos do Sistema'}
            </h2>
            {adminModeEnabled && (
              <Badge className="bg-yellow-600 text-black text-[10px] sm:text-xs">
                {dashboardViewMode === 'courses' ? 'Cursos' : 'Módulos'}
              </Badge>
            )}
          </div>
          
          {/* Seções por Curso: título do curso + grid de módulos (estilo Netflix) */}
          <div className="space-y-8">
            {dbCourses.map((course) => {
              const courseModules = dbModules.filter((m) => m.course_id === course.id);
              return (
                <section key={course.id} className="pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold">{course.title}</h3>
                    {adminModeEnabled && (
                      <Badge className="bg-blue-600">Curso</Badge>
                    )}
                  </div>
                  {/* Grid de cursos - Cards responsivos */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    <Card 
                      key={course.id} 
                      className="w-full h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] bg-gray-900 border-gray-700 cursor-pointer hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                      onClick={() => handleCourseClick(course)}
                    >
                      {adminModeEnabled && (
                        <AdminEditControls 
                          type="course" 
                          course={course as any}
                          onSave={handleSaveEdit}
                        />
                      )}
                      <div className="relative h-full">
                        <img 
                          src={course.thumbnail_url || '/placeholder.svg'} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                          <h4 className="text-xs sm:text-sm font-semibold line-clamp-2">{course.title}</h4>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">{course.lessons.length} aulas</p>
                        </div>
                        {!adminModeEnabled && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                            <Button size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-black hover:bg-white/90 h-8 w-8 sm:h-10 sm:w-10">
                              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </section>
              );
            })}
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

  // PLAYER VIEW - Player 1380x776px + Thumbs à direita
  if (currentView === 'player' && selectedLesson && selectedCourse) {
    return (
      <div className="min-h-screen bg-black text-white relative">
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

        <div className="p-6">
          <Button 
            variant="outline" 
            onClick={handleBackToCourse}
            className="mb-6 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Aulas
          </Button>

          {/* Layout Responsivo - Coluna no mobile, lado a lado no desktop */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Player principal - Responsivo */}
            <div className="flex-1">
              {(() => {
                const videoUrl = selectedLesson.video_url;
                const provider = detectVideoProvider(videoUrl);
                const embedUrl = getVideoEmbedUrl(videoUrl);
                const isOneDrive = provider.type === 'onedrive';
                
                // Para OneDrive, mostra iframe e também botão alternativo
                return (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900 shadow-2xl">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      title={selectedLesson.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
                      onError={() => {
                        console.error('Erro ao carregar vídeo embed');
                      }}
                    />
                    {isOneDrive && (
                      <div className="absolute bottom-4 right-4">
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Abrir no OneDrive
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {/* Título/subtítulo/descrição abaixo do player */}
              <div className="mt-4 lg:mt-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                  {selectedLesson.title}
                  {adminModeEnabled && (
                    <Badge className="ml-2 lg:ml-4 bg-red-600 text-white text-xs sm:text-sm">
                      [ADMIN MODE]
                    </Badge>
                  )}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-3 lg:mb-4">{selectedCourse.title}</p>
                <p className="text-sm sm:text-base text-gray-300">{selectedLesson.description}</p>
              </div>
            </div>

            {/* Lista de aulas - Abaixo no mobile, à direita no desktop */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold mb-3 lg:mb-4">Aulas do Curso</h3>
              <div className="space-y-2 lg:space-y-3 max-h-96 lg:max-h-[600px] overflow-y-auto">
                {selectedCourse.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className={`flex gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      lesson.id === selectedLesson.id 
                        ? 'bg-red-600' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="relative w-16 h-12 lg:w-24 lg:h-16 flex-shrink-0">
                      <img 
                        src={lesson.thumbnail_url} 
                        alt={lesson.title}
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                      </div>
                      <div className="absolute bottom-0.5 right-0.5 lg:bottom-1 lg:right-1 bg-black/70 px-1 py-0.5 rounded text-[10px] lg:text-xs">
                        {formatDuration(lesson.duration)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1">{lesson.title}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1">{lesson.description}</p>
                    </div>
                  </div>
                ))}
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