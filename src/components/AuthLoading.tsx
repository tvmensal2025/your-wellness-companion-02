import React from 'react';
import { Leaf } from 'lucide-react';

const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Loader com folha - CSS puro para garantir que funciona */}
      <div className="relative w-20 h-20">
        {/* Círculo girando */}
        <div className="absolute inset-0 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        {/* Folha central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
      
      <div className="text-center mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          MaxNutrition
        </h2>
        <p className="text-sm text-muted-foreground animate-pulse">
          Verificando autenticação...
        </p>
      </div>
      
      {/* Barra de progresso */}
      <div className="mt-6 w-32 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full animate-[progress_1.5s_ease-in-out_infinite]"
          style={{ width: '40%' }}
        />
      </div>
    </div>
  );
};

export default AuthLoading;
