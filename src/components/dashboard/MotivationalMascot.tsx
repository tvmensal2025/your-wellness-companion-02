import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import mascotImage from '@/assets/butterfly-mascot.png';
const dailyPhrases = ["Cada pequeno passo te aproxima do seu objetivo! 💪", "Você é mais forte do que imagina!", "Acredite em você, a transformação começa agora!", "A consistência é a chave do sucesso!", "Seu corpo é seu maior aliado, cuide dele!", "Hoje é um novo dia para fazer escolhas saudáveis!", "A jornada de mil passos começa com o primeiro!", "Você está no caminho certo, continue assim!", "Sua saúde é seu maior tesouro!", "Pequenas mudanças geram grandes resultados!", "Acredite no processo, os resultados virão!", "Você merece se sentir bem consigo mesmo!", "A mudança começa de dentro para fora!", "Cada dia é uma nova oportunidade de evoluir!", "Sua dedicação vai te levar longe!", "O melhor investimento é em você mesmo!", "Você é capaz de conquistar seus sonhos!", "A persistência transforma sonhos em realidade!", "Cuide do seu corpo, ele é sua casa!", "O sucesso é construído um dia de cada vez!", "Você está mais perto do que imagina!", "A disciplina de hoje é a liberdade de amanhã!", "Seu esforço nunca é em vão!", "Celebre cada pequena vitória!", "A transformação é um processo, aproveite a jornada!", "Você tem o poder de mudar sua história!", "Saúde é riqueza, invista nela!", "O impossível é só questão de tempo!", "Você nasceu para brilhar!", "Sua melhor versão está sendo construída!", "Confie no processo e nos seus passos!"];
const getDailyPhrase = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const phraseIndex = dayOfYear % dailyPhrases.length;
  return dailyPhrases[phraseIndex];
};
export const MotivationalMascot: React.FC = () => {
  const [phrase, setPhrase] = useState('');
  useEffect(() => {
    setPhrase(getDailyPhrase());
  }, []);
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30">
      <motion.img alt="Instituto dos Sonhos" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain flex-shrink-0" animate={{
      y: [0, -3, 0]
    }} transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }} src="/lovable-uploads/18a78f32-e758-4df9-8608-afc179bbdd31.png" />
      <p className="text-sm sm:text-base text-muted-foreground font-medium flex-1 line-clamp-2">
        {phrase}
      </p>
    </motion.div>;
};