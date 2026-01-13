/**
 * 🦴 SkeletonOverlay - Overlay visual do esqueleto detectado
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Keypoint } from '@/types/camera-workout';

interface SkeletonOverlayProps {
  keypoints: Keypoint[];
  formScore: number;
  showLabels?: boolean;
  animate?: boolean;
}

// Conexões do esqueleto (pares de índices de keypoints)
const SKELETON_CONNECTIONS = [
  // Cabeça
  [0, 1], [0, 2], [1, 3], [2, 4],
  // Tronco
  [5, 6], [5, 11], [6, 12], [11, 12],
  // Braço esquerdo
  [5, 7], [7, 9],
  // Braço direito
  [6, 8], [8, 10],
  // Perna esquerda
  [11, 13], [13, 15],
  // Perna direita
  [12, 14], [14, 16],
];

export function SkeletonOverlay({
  keypoints,
  formScore,
  showLabels = false,
  animate = true,
}: SkeletonOverlayProps) {
  // Cor baseada no score
  const getColor = () => {
    if (formScore >= 80) return '#22c55e'; // green
    if (formScore >= 60) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const color = getColor();

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Conexões */}
      {SKELETON_CONNECTIONS.map(([i, j], idx) => {
        const p1 = keypoints[i];
        const p2 = keypoints[j];
        
        if (!p1 || !p2 || p1.confidence < 0.3 || p2.confidence < 0.3) {
          return null;
        }

        return (
          <motion.line
            key={`line-${idx}`}
            x1={`${p1.x * 100}%`}
            y1={`${p1.y * 100}%`}
            x2={`${p2.x * 100}%`}
            y2={`${p2.y * 100}%`}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
          />
        );
      })}

      {/* Pontos */}
      {keypoints.map((kp, idx) => {
        if (kp.confidence < 0.3) return null;

        return (
          <motion.circle
            key={`point-${idx}`}
            cx={`${kp.x * 100}%`}
            cy={`${kp.y * 100}%`}
            r={6}
            fill={color}
            stroke="white"
            strokeWidth={2}
            initial={animate ? { scale: 0 } : undefined}
            animate={animate ? { scale: 1 } : undefined}
          />
        );
      })}
    </svg>
  );
}
