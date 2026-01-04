import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, Star, Play, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  duration_minutes: number;
  difficulty_level: string;
  price: number;
  category: string;
  is_published: boolean;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  module_id: string;
  is_free: boolean;
  created_at: string;
}

const CoursePlatform = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to match our Course interface
      const mappedCourses: Course[] = (data || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        instructor_name: 'Instrutor', // Default instructor name
        duration_minutes: course.duration_minutes || 60,
        difficulty_level: course.difficulty_level || 'Iniciante',
        price: 0,
        category: course.category || 'Geral',
        is_published: course.is_published,
        created_at: course.created_at
      }));

      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, module_id, title, description, video_url, duration_minutes, order_index, is_free, is_premium, created_at')
        .eq('module_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Map the data to match our Lesson interface
      const mappedLessons: Lesson[] = (data || []).map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        video_url: lesson.video_url || '',
        duration_minutes: lesson.duration_minutes || 0,
        order_index: lesson.order_index,
        module_id: lesson.module_id || '',
        is_free: !lesson.is_premium,
        created_at: lesson.created_at
      }));

      setLessons(mappedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24">
        <Button 
          variant="outline" 
          onClick={() => setSelectedCourse(null)}
          className="mb-4 sm:mb-6 text-sm"
        >
          ← Voltar
        </Button>
        
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-2xl">{selectedCourse.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{selectedCourse.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 sm:mb-6 flex items-center justify-center">
                  <Play className="h-10 w-10 sm:h-16 sm:w-16 text-gray-400" />
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-xl font-semibold">Aulas do Curso</h3>
                  {lessons.length === 0 ? (
                    <p className="text-sm text-gray-500">Carregando aulas...</p>
                  ) : (
                    lessons.map((lesson) => (
                      <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{lesson.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                                {lesson.duration_minutes} min
                              </p>
                            </div>
                            {lesson.is_free && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">Grátis</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{selectedCourse.instructor_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{selectedCourse.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{selectedCourse.difficulty_level}</span>
                </div>
                <Badge variant="outline" className="text-xs">{selectedCourse.category}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24">
      <div className="text-center mb-6 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Plataforma de Cursos</h1>
        <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto">
          Aprenda com especialistas e transforme sua saúde
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-xl">{course.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="truncate max-w-[80px]">{course.instructor_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{course.duration_minutes}min</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs">{course.category}</Badge>
                  <Badge variant="secondary" className="text-xs">{course.difficulty_level}</Badge>
                </div>
                
                <Button 
                  className="w-full text-sm" 
                  onClick={() => {
                    setSelectedCourse(course);
                    fetchLessons(course.id);
                  }}
                >
                  Ver Curso
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursePlatform;
