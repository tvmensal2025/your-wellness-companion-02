import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Printer, Image as ImageIcon, Info, ShoppingCart } from 'lucide-react';
import { detectFoodIntent, sumBlockKcal, avoidRepetition, estimateSuggestionLine, MealLine } from '@/lib/food-intents';
import { exportPDF, exportPNG } from '@/lib/exporters';
import { useShoppingList } from '@/hooks/mealie/useShoppingList';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type LayoutType = 'guia-colorido' | 'minimalista' | 'planner' | 'instagram';

type BlockName = 'DESJEJUM' | 'LANCHE DA MANHÃ' | 'ALMOÇO' | 'LANCHE DA TARDE' | 'JANTAR';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const BLOCKS: BlockName[] = ['DESJEJUM','LANCHE DA MANHÃ','ALMOÇO','LANCHE DA TARDE','JANTAR'];

export interface CardapioEstruturado7DProps {
  logoUrl?: string;
  layout?: LayoutType;
  input?: Partial<Record<string, Partial<Record<BlockName, MealLine[]>>>>; // opcional: entradas do usuário
}

// Pools por bloco para variedade BR
const POOLS = {
  DESJEJUM: [
    { food: 'Ovo mexido', homemade: '2 unidades', kcal: 150, unit: 'un' },
    { food: 'Ovo cozido', homemade: '2 unidades', kcal: 140, unit: 'un' },
    { food: 'Pão integral', homemade: '1 fatia', kcal: 70, unit: 'g' },
    { food: 'Aveia em flocos', homemade: '2 colheres de sopa', kcal: 80, unit: 'g' },
    { food: 'Iogurte natural', homemade: '1 pote (170 g)', kcal: 110, unit: 'g' },
    { food: 'Fruta (banana)', homemade: '1 porção (100 g)', kcal: 89, unit: 'g' },
    { food: 'Fruta (maçã)', homemade: '1 porção (100 g)', kcal: 52, unit: 'g' },
  ],
  'LANCHE DA MANHÃ': [
    { food: 'Iogurte natural', homemade: '1 pote (170 g)', kcal: 110, unit: 'g' },
    { food: 'Castanhas', homemade: '1 punhado (30 g)', kcal: 180, unit: 'g' },
    { food: 'Fruta (maçã)', homemade: '1 porção (100 g)', kcal: 52, unit: 'g' },
    { food: 'Fruta (banana)', homemade: '1 porção (100 g)', kcal: 89, unit: 'g' },
  ],
  ALMOÇO: [
    { food: 'Frango grelhado', homemade: '1 filé (150 g)', kcal: 230, unit: 'g' },
    { food: 'Peito de frango grelhado', homemade: '1 filé (150 g)', kcal: 230, unit: 'g' },
    { food: 'Coxa de frango assada', homemade: '1 unidade', kcal: 250, unit: 'un' },
    { food: 'Arroz integral', homemade: '6 col. sopa cheias', kcal: 150, unit: 'g' },
    { food: 'Feijão cozido', homemade: '1 concha média', kcal: 120, unit: 'g' },
    { food: 'Salada crua variada', homemade: 'à vontade', kcal: 60, unit: 'g' },
    { food: 'Legumes cozidos', homemade: '1/2 prato', kcal: 80, unit: 'g' },
  ],
  'LANCHE DA TARDE': [
    { food: 'Bolo integral de banana', homemade: '1 fatia média', kcal: 150, unit: 'g' },
    { food: 'Pão integral', homemade: '1 fatia', kcal: 70, unit: 'g' },
    { food: 'Iogurte natural', homemade: '1 pote (170 g)', kcal: 110, unit: 'g' },
    { food: 'Fruta (morango)', homemade: '1 porção (100 g)', kcal: 33, unit: 'g' },
    { food: 'Chá sem açúcar', homemade: '1 xícara', kcal: 0, unit: 'ml' },
  ],
  JANTAR: [
    { food: 'Sopa de legumes', homemade: '1 prato de sopa', kcal: 200, unit: 'ml' },
    { food: 'Frango cozido', homemade: '1 filé (150 g)', kcal: 220, unit: 'g' },
    { food: 'Ovo mexido', homemade: '2 unidades', kcal: 150, unit: 'un' },
    { food: 'Salada crua variada', homemade: 'à vontade', kcal: 60, unit: 'g' },
    { food: 'Arroz integral', homemade: '4 col. sopa', kcal: 100, unit: 'g' },
  ],
} as Record<BlockName, MealLine[]>;

function seedRandom(seed: number) {
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

function pickUnique(pool: MealLine[], count: number, rnd: () => number): MealLine[] {
  const copy = [...pool];
  const out: MealLine[] = [];
  while (copy.length && out.length < count) {
    const idx = Math.floor(rnd() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function buildFallbackLines(block: BlockName, dayIdx = 0): MealLine[] {
  const rnd = seedRandom(dayIdx * 13 + block.length);
  switch (block) {
    case 'DESJEJUM':
      return pickUnique(POOLS.DESJEJUM, 3, rnd);
    case 'LANCHE DA MANHÃ':
      return pickUnique(POOLS['LANCHE DA MANHÃ'], 2, rnd);
    case 'ALMOÇO':
      return pickUnique(POOLS.ALMOÇO, 3, rnd);
    case 'LANCHE DA TARDE':
      return pickUnique(POOLS['LANCHE DA TARDE'], 2, rnd);
    case 'JANTAR':
      return pickUnique(POOLS.JANTAR, 2, rnd);
  }
}

function applyIntelligence(lines: MealLine[]): MealLine[] {
  return avoidRepetition(lines).map((line) => {
    const intent = detectFoodIntent(line.food);
    const foodName = intent.displayName;
    if (intent.displayName.includes('(kcal/100g)') && !line.kcal) {
      // já será explicado no popover, mantemos kcal da linha
    }
    return { ...line, food: foodName };
  });
}

function BlockTable({ dayIdx, block, lines, layout, suggestions, attention }: { dayIdx: number; block: BlockName; lines: MealLine[]; layout: LayoutType; suggestions?: string; attention?: string }) {
  const processed = applyIntelligence(lines);
  const total = sumBlockKcal(processed);

  return (
    <div className="mb-3">
      <div className={`px-3 py-1 rounded-t ${layout === 'guia-colorido' ? 'bg-emerald-500 text-white' : 'bg-muted text-foreground'} text-xs font-semibold tracking-wider`}>{block} — {total} Kcal</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="text-left p-2 border">ALIMENTOS</th>
              <th className="text-left p-2 border">MEDIDA CASEIRA</th>
              <th className="text-left p-2 border">Kcal</th>
              <th className="text-left p-2 border">ml/g</th>
            </tr>
          </thead>
          <tbody>
            {processed.map((l, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border align-top">
                  <div className="flex items-center gap-1">
                    {/* Popover de inteligência */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="underline underline-offset-2 decoration-dotted hover:opacity-80" aria-label="Detalhes e sugestões">
                          {l.food}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 text-xs">
                        <IntelligencePopover foodName={l.food} />
                      </PopoverContent>
                    </Popover>

                    {layout === 'planner' && <Checkbox className="ml-2" aria-label="Marcar adesão" />}
                  </div>
                </td>
                <td className="p-2 border align-top">{l.homemade}</td>
                <td className="p-2 border align-top">{Math.round(l.kcal)}</td>
                <td className="p-2 border align-top">{l.unit || '—'}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} className="p-2 border font-semibold">Total do bloco: {Math.round(total)} kcal</td>
            </tr>
          </tbody>
        </table>
      </div>
      {suggestions && (
        <div className="text-[11px] text-muted-foreground px-1">Sugestões: {suggestions}</div>
      )}
      {attention && (
        <div className="text-[11px] text-amber-700 px-1">ATENÇÃO: {attention}</div>
      )}
    </div>
  );
}

function IntelligencePopover({ foodName }: { foodName: string }) {
  const intent = detectFoodIntent(foodName);
  const suggestions = intent.suggestions.map(s => estimateSuggestionLine(s));
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">Sugestões inteligentes</div>
      {suggestions.length === 0 ? (
        <div className="text-muted-foreground">Sem sugestões específicas</div>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {suggestions.map((s, i) => (
            <li key={i}>{s.food} — {s.homemade} {s.kcal ? `• ${s.kcal} kcal` : ''}</li>
          ))}
        </ul>
      )}
      {intent.ask && <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded">{intent.ask}</div>}
      {intent.tip && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2 rounded">{intent.tip}</div>}
    </div>
  );
}

export default function CardapioEstruturado7D({ logoUrl, layout: initialLayout = 'guia-colorido', input }: CardapioEstruturado7DProps) {
  const [layout, setLayout] = useState<LayoutType>(initialLayout);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { generating, generateList, sendToWhatsApp } = useShoppingList(user?.id);

  const daysData = useMemo(() => {
    // Monta 7 dias com 5 blocos cada; completa faltantes com variedade
    const map: Record<string, { blocks: Record<BlockName, MealLine[]>, tips: Record<BlockName, { s?: string; a?: string }> }> = {};
    DAYS.forEach((d) => {
      const idx = DAYS.indexOf(d);
      map[d] = {
        blocks: {
          'DESJEJUM': buildFallbackLines('DESJEJUM', idx),
          'LANCHE DA MANHÃ': buildFallbackLines('LANCHE DA MANHÃ', idx),
          'ALMOÇO': buildFallbackLines('ALMOÇO', idx),
          'LANCHE DA TARDE': buildFallbackLines('LANCHE DA TARDE', idx),
          'JANTAR': buildFallbackLines('JANTAR', idx)
        },
        tips: {
          'DESJEJUM': { s: 'Hidratação logo ao acordar; incluir proteínas.', a: '' },
          'LANCHE DA MANHÃ': { s: 'Opções práticas e nutritivas.', a: '' },
          'ALMOÇO': { s: 'Temperar salada com azeite e limão; prefira grelhados/assados.', a: 'Evitar frituras.' },
          'LANCHE DA TARDE': { s: 'Evitar açúcar em excesso.', a: '' },
          'JANTAR': { s: 'Evitar refeições muito tardias; hidratação adequada.', a: '' },
        }
      };
    });

    if (input) {
      Object.entries(input).forEach(([day, blocks]) => {
        const d = map[day];
        if (!d) return;
        Object.entries(blocks || {}).forEach(([blockName, lines]) => {
          if (!lines || (lines as MealLine[]).length === 0) return;
          d.blocks[blockName as BlockName] = lines as MealLine[];
        });
      });
    }

    return map;
  }, [input]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (ref.current) await exportPDF(ref.current, 'cardapio-semanal.pdf');
  };

  const handleExportPNG = async () => {
    if (ref.current) await exportPNG(ref.current, 'cardapio-semanal.png');
  };

  const handleGenerateShoppingList = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Calcular início e fim da semana (próximos 7 dias)
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      toast({
        title: '🛒 Gerando lista...',
        description: 'Analisando seu cardápio da semana',
      });

      const list = await generateList(weekStart, weekEnd);

      if (!list) {
        toast({
          title: 'Erro',
          description: 'Não foi possível gerar a lista',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '📱 Enviando para WhatsApp...',
        description: 'Aguarde alguns segundos',
      });

      const sent = await sendToWhatsApp(list.id);

      if (sent) {
        toast({
          title: '✅ Lista enviada!',
          description: 'Confira seu WhatsApp 💚',
        });
      } else {
        toast({
          title: 'Erro ao enviar',
          description: 'Verifique se seu telefone está cadastrado',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao gerar lista:', error);
      toast({
        title: 'Erro',
        description: 'Algo deu errado. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">CARDÁPIO SEMANAL — Sugestões da Sof.ia Nutricional</div>
          <div className="text-xs text-muted-foreground">Conteúdo educativo e sugestivo. Consulte um profissional para ajustes personalizados.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleGenerateShoppingList}
            disabled={generating}
            className="bg-emerald-500 hover:bg-emerald-600"
            aria-label="Gerar lista de compras"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {generating ? 'Gerando...' : 'Gerar Lista de Compras'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} aria-label="Imprimir"><Printer className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} aria-label="Baixar PDF"><Download className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} aria-label="Baixar PNG"><ImageIcon className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Layout selector */}
      <Tabs value={layout} onValueChange={(v) => setLayout(v as LayoutType)}>
        <TabsList>
          <TabsTrigger value="guia-colorido">Guia Colorido</TabsTrigger>
          <TabsTrigger value="minimalista">Minimalista</TabsTrigger>
          <TabsTrigger value="planner">Planner</TabsTrigger>
          <TabsTrigger value="instagram">Feed Instagram</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      <div ref={ref} className="bg-white p-3 rounded border print:p-0">
        {DAYS.map((day, dIdx) => (
          <Card key={day} className="mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {day}
                {logoUrl && <img src={logoUrl} alt="logo" className="h-6" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {BLOCKS.map((block) => (
                <BlockTable key={block} dayIdx={dIdx} block={block} lines={daysData[day].blocks[block]} layout={layout} suggestions={daysData[day].tips[block]?.s} attention={daysData[day].tips[block]?.a} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


