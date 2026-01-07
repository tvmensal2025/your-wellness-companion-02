import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Activity, User, Ruler, Scale } from 'lucide-react';

interface MetabolismCardProps {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'M' | 'F' | string;
  waistCircumference?: number; // cm
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export const MetabolismCard: React.FC<MetabolismCardProps> = ({
  weight,
  height,
  age,
  gender,
  waistCircumference,
  activityLevel = 'light'
}) => {
  const metabolism = useMemo(() => {
    if (!weight || !height || !age) {
      return null;
    }

    // Fórmula de Mifflin-St Jeor (mais precisa que Harris-Benedict)
    // Homens: TMB = 10 × peso(kg) + 6.25 × altura(cm) − 5 × idade(anos) + 5
    // Mulheres: TMB = 10 × peso(kg) + 6.25 × altura(cm) − 5 × idade(anos) − 161
    const isMale = gender === 'M' || gender === 'masculino' || gender === 'male';
    
    const tmb = isMale
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    // Fatores de atividade física
    const activityFactors = {
      sedentary: 1.2,      // Pouco ou nenhum exercício
      light: 1.375,        // Exercício leve 1-3 dias/semana
      moderate: 1.55,      // Exercício moderado 3-5 dias/semana
      active: 1.725,       // Exercício intenso 6-7 dias/semana
      very_active: 1.9     // Exercício muito intenso ou trabalho físico
    };

    const factor = activityFactors[activityLevel] || 1.375;
    const tdee = tmb * factor; // Total Daily Energy Expenditure

    // Cálculo de IMC
    const heightM = height / 100;
    const imc = weight / (heightM * heightM);

    // Relação Cintura-Altura (RCE) se disponível
    let rce = null;
    let riscoAbdominal = null;
    if (waistCircumference && height) {
      rce = waistCircumference / height;
      if (rce < 0.4) riscoAbdominal = 'Baixo';
      else if (rce < 0.5) riscoAbdominal = 'Normal';
      else if (rce < 0.55) riscoAbdominal = 'Aumentado';
      else if (rce < 0.6) riscoAbdominal = 'Alto';
      else riscoAbdominal = 'Muito Alto';
    }

    // Classificação IMC
    let imcClass = 'Normal';
    let imcColor = 'text-emerald-500';
    if (imc < 18.5) { imcClass = 'Abaixo'; imcColor = 'text-amber-500'; }
    else if (imc >= 25 && imc < 30) { imcClass = 'Sobrepeso'; imcColor = 'text-amber-500'; }
    else if (imc >= 30) { imcClass = 'Obesidade'; imcColor = 'text-rose-500'; }

    return {
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      imc: imc.toFixed(1),
      imcClass,
      imcColor,
      rce: rce ? (rce * 100).toFixed(0) : null,
      riscoAbdominal,
      activityLabel: {
        sedentary: 'Sedentário',
        light: 'Leve',
        moderate: 'Moderado',
        active: 'Ativo',
        very_active: 'Muito Ativo'
      }[activityLevel]
    };
  }, [weight, height, age, gender, waistCircumference, activityLevel]);

  // Se não tem dados suficientes, mostrar estado vazio
  if (!metabolism) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl sm:rounded-2xl bg-card border border-border/50 p-4 sm:p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          <h3 className="text-sm sm:text-base font-semibold text-foreground">Metabolismo</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
          Complete seu perfil (peso, altura, idade) para ver seu metabolismo
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Metabolismo</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {gender === 'M' || gender === 'masculino' ? 'Masculino' : 'Feminino'} • {age} anos
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="px-4 sm:px-5 py-3 sm:py-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* TMB */}
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Taxa Metabólica Basal
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xl sm:text-2xl font-bold text-orange-500">
                {metabolism.tmb.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">kcal</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
              Em repouso absoluto
            </p>
          </div>

          {/* TDEE */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Gasto Diário Total
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-500">
                {metabolism.tdee.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">kcal</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
              Atividade: {metabolism.activityLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 divide-x divide-border/50 border-t border-border/50 bg-muted/20">
        {/* IMC */}
        <div className="py-3 sm:py-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Scale className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
          </div>
          <p className={`text-sm sm:text-base font-bold ${metabolism.imcColor}`}>
            {metabolism.imc}
          </p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">
            IMC • {metabolism.imcClass}
          </p>
        </div>

        {/* Altura */}
        <div className="py-3 sm:py-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Ruler className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm sm:text-base font-bold text-foreground">
            {height}
          </p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">
            Altura (cm)
          </p>
        </div>

        {/* RCE ou Peso */}
        <div className="py-3 sm:py-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
          </div>
          {metabolism.rce ? (
            <>
              <p className={`text-sm sm:text-base font-bold ${
                metabolism.riscoAbdominal === 'Baixo' || metabolism.riscoAbdominal === 'Normal' 
                  ? 'text-emerald-500' 
                  : metabolism.riscoAbdominal === 'Aumentado'
                    ? 'text-amber-500'
                    : 'text-rose-500'
              }`}>
                {metabolism.rce}%
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                RCE • {metabolism.riscoAbdominal}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm sm:text-base font-bold text-foreground">
                {weight.toFixed(1)}
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                Peso (kg)
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
