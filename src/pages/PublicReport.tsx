import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, AlertCircle, Loader2, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";

const PublicReport = () => {
  const { token } = useParams<{ token: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Relatório Médico");

  useEffect(() => {
    if (!token) {
      setError("Token não fornecido");
      setLoading(false);
      return;
    }

    fetchReport();
  }, [token]);

  const fetchReport = async () => {
    try {
      // Buscar dados do relatório via edge function
      const { data, error: fnError } = await supabase.functions.invoke("get-public-report", {
        body: { token },
      });

      if (fnError) {
        throw new Error(fnError.message || "Erro ao buscar relatório");
      }

      if (!data?.html) {
        throw new Error("Relatório não encontrado ou expirado");
      }

      setHtml(data.html);
      setTitle(data.title || "Relatório Médico");
      
      // Atualizar título da página
      document.title = `${data.title || "Relatório"} - MaxNutrition`;
    } catch (err: any) {
      console.error("Erro ao carregar relatório:", err);
      setError(err.message || "Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: "Confira meu relatório médico",
          url,
        });
      } catch (err) {
        // Usuário cancelou ou erro
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copiado!");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Relatório não encontrado
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            O link pode ter expirado ou o relatório foi removido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo com ações */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                {title}
              </h1>
              <p className="text-xs text-gray-500">MaxNutrition</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Salvar PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      <div 
        className="report-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html || "") }}
      />

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 py-6 print:hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Relatório gerado pela plataforma{" "}
            <span className="font-medium text-purple-600">MaxNutrition</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Este documento é educativo e não substitui consulta médica.
          </p>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style>{`
        @media print {
          .report-content {
            padding: 0 !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicReport;
