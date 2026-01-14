/**
 * Zone Classifier Service
 * Classifica frequência cardíaca em zonas e retorna cores apropriadas
 * 
 * Validates: Requirements 1.4, 1.5, 1.6
 */

export type HeartRateZone = 'bradycardia' | 'normal' | 'elevated' | 'unknown';

export interface ZoneInfo {
  zone: HeartRateZone;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Classifica a frequência cardíaca em uma zona
 * - bradycardia: < 60 bpm (azul)
 * - normal: 60-100 bpm (verde)
 * - elevated: > 100 bpm (laranja/vermelho)
 */
export function classifyHeartRateZone(bpm: number | null | undefined): HeartRateZone {
  if (bpm === null || bpm === undefined || bpm <= 0) {
    return 'unknown';
  }
  
  if (bpm < 60) {
    return 'bradycardia';
  }
  
  if (bpm <= 100) {
    return 'normal';
  }
  
  return 'elevated';
}

/**
 * Retorna informações completas da zona incluindo cores e labels
 */
export function getZoneInfo(zone: HeartRateZone): ZoneInfo {
  const zoneInfoMap: Record<HeartRateZone, ZoneInfo> = {
    bradycardia: {
      zone: 'bradycardia',
      label: 'Bradicardia',
      description: 'Frequência cardíaca baixa',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    normal: {
      zone: 'normal',
      label: 'Normal',
      description: 'Frequência cardíaca saudável',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
    },
    elevated: {
      zone: 'elevated',
      label: 'Elevada',
      description: 'Frequência cardíaca alta',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
    },
    unknown: {
      zone: 'unknown',
      label: 'Sem dados',
      description: 'Conecte seu smartwatch',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-border',
    },
  };

  return zoneInfoMap[zone];
}

/**
 * Retorna apenas a classe de cor CSS para a zona
 */
export function getZoneColor(zone: HeartRateZone): string {
  return getZoneInfo(zone).color;
}

/**
 * Retorna a classe de cor de fundo CSS para a zona
 */
export function getZoneBgColor(zone: HeartRateZone): string {
  return getZoneInfo(zone).bgColor;
}

/**
 * Verifica se o BPM está em uma faixa saudável
 */
export function isHealthyHeartRate(bpm: number): boolean {
  const zone = classifyHeartRateZone(bpm);
  return zone === 'normal';
}
