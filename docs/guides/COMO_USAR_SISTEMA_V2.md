# 🚀 Como Usar o Sistema de Recomendação v2.0

## ⚡ Início Rápido

### **1. Importar o Serviço**

```typescript
// Importar o novo serviço melhorado
import { recomendarProdutosMelhorado } from '@/services/iaRecomendacaoSuplementosMelhorada';
```

### **2. Usar no Componente**

```typescript
import React, { useEffect, useState } from 'react';
import { recomendarProdutosMelhorado } from '@/services/iaRecomendacaoSuplementosMelhorada';

function MeuComponente() {
  const [recomendacoes, setRecomendacoes] = useState([]);
  
  useEffect(() => {
    // Buscar dados do usuário (do Supabase ou estado)
    const userProfile = {
      id: userId,
      age: 45,
      gender: 'feminino',
      weight: 85,
      height: 160,
      goals: ['emagrecimento', 'energia'],
      health_conditions: ['hipertensao', 'fadiga'],
      allergies: [],
      dietary_restrictions: [],
      medications: []
    };
    
    const userAnamnesis = null; // ou carregar do banco
    const userMeasurements = [
      {
        id: '123',
        user_id: userId,
        body_fat: 38,
        metabolic_age: 52,
        visceral_fat: 12
      }
    ];
    
    // Gerar recomendações
    const recommendations = recomendarProdutosMelhorado(
      userProfile,
      userAnamnesis,
      userMeasurements,
      6 // quantidade de produtos
    );
    
    setRecomendacoes(recommendations);
  }, [userId]);
  
  return (
    <div>
      {recomendacoes.map((rec, index) => (
        <div key={rec.produto.id}>
          <h3>{index + 1}. {rec.produto.name}</h3>
          <p>Score: {rec.score_final} pontos</p>
          <p>Prioridade: {rec.prioridade_medica}</p>
          <p>{rec.mensagem_personalizada}</p>
          
          {rec.validacoes.alertas.length > 0 && (
            <div className="alertas">
              {rec.validacoes.alertas.map(alerta => (
                <p key={alerta}>{alerta}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Estrutura dos Dados Retornados

```typescript
interface RecomendacaoCompleta {
  // PRODUTO
  produto: {
    id: string;                    // "CART_CONTROL"
    name: string;                  // "CART CONTROL"
    brand: string;                 // "Atlântica Natural"
    category: string;              // "emagrecimento"
    active_ingredients: string[];  // ["Cafeína", "Chá Verde", ...]
    benefits: string[];            // ["Acelera metabolismo", ...]
    contraindications: string[];   // ["Hipertensão grave", ...]
    description: string;
    original_price: number;        // 189.90
    discount_price: number;        // 94.90
    tags: string[];                // ["termogenico", "emagrecimento"]
  };
  
  // SCORES
  score_base: number;              // 0-200 pontos
  score_medico: number;            // 0-1000+ pontos
  score_final: number;             // Base + Médico
  
  // PRIORIDADE
  prioridade_medica: 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA';
  
  // CONDIÇÕES
  condicoes_tratadas: CondicaoMedica[];  // Array de condições relacionadas
  
  // INFORMAÇÕES PERSONALIZADAS
  razoes_medicas: string[];              // ["🚨 PRIORIDADE MÉDICA...", ...]
  mensagem_personalizada: string;        // "Maria, identifiquei..."
  dosagem_personalizada: string;         // "2 cápsulas 30 min antes do almoço"
  beneficios_especificos: string[];      // Benefícios persuasivos
  
  // CIÊNCIA
  artigo_cientifico?: {
    titulo: string;
    autores: string;
    ano: number;
    revista: string;
    url: string;
    resumo: string;
    nivel_evidencia: string;          // "1A", "2A", etc.
  };
  
  // EVIDÊNCIAS PERSUASIVAS
  evidencias_persuasivas: {
    mensagem_persuasiva: string;
    gatilhos_mentais: string[];
    beneficios_persuasivos: string[];
  };
  
  // SEGURANÇA
  validacoes: {
    seguro: boolean;                    // true/false
    alertas: string[];                  // ["⚠️ ALERTA: ...", ...]
  };
}
```

---

## 🎨 Exemplos de Uso

### **Exemplo 1: Mostrar Apenas Produtos CRÍTICOS**

```typescript
const produtosCriticos = recomendacoes.filter(r => 
  r.prioridade_medica === 'CRÍTICA'
);

return (
  <div>
    <h2>🔴 Produtos de Prioridade CRÍTICA</h2>
    {produtosCriticos.map(rec => (
      <ProductCard key={rec.produto.id} recommendation={rec} />
    ))}
  </div>
);
```

### **Exemplo 2: Mostrar Condições Detectadas**

```typescript
const condicoesUnicas = Array.from(
  new Set(
    recomendacoes
      .flatMap(r => r.condicoes_tratadas)
      .map(c => c.id)
  )
).map(id => 
  recomendacoes
    .flatMap(r => r.condicoes_tratadas)
    .find(c => c.id === id)
);

return (
  <div>
    <h2>🏥 Condições de Saúde Identificadas</h2>
    {condicoesUnicas.map(condicao => (
      <div key={condicao.id} className={`badge-${condicao.cor_badge}`}>
        {condicao.icone} {condicao.nome}
        <span>Urgência: {condicao.urgencia}/10</span>
        <p>{condicao.mensagem_alerta}</p>
      </div>
    ))}
  </div>
);
```

### **Exemplo 3: Mostrar Perfil de Saúde**

```typescript
const userProfile = { age: 45, weight: 85, height: 160 };
const imc = userProfile.weight / Math.pow(userProfile.height / 100, 2);

return (
  <div className="perfil-saude">
    <h2>🫀 Seu Perfil de Saúde</h2>
    <div className="cards">
      <div className="card">
        <span>{userProfile.age}</span>
        <p>anos</p>
      </div>
      <div className="card">
        <span>{userProfile.weight}kg</span>
        <p>peso</p>
      </div>
      <div className="card">
        <span>{imc.toFixed(1)}</span>
        <p>IMC</p>
      </div>
    </div>
  </div>
);
```

### **Exemplo 4: Mostrar Alertas de Segurança**

```typescript
{recomendacoes.map(rec => (
  <div key={rec.produto.id}>
    <h3>{rec.produto.name}</h3>
    
    {/* Alertas de segurança */}
    {rec.validacoes.alertas.length > 0 && (
      <div className="alertas">
        {rec.validacoes.alertas.map((alerta, idx) => (
          <div 
            key={idx} 
            className={
              alerta.includes('CONTRAINDICADO') ? 'alerta-critico' :
              alerta.includes('INTERAÇÃO') ? 'alerta-atencao' :
              'alerta-info'
            }
          >
            {alerta}
          </div>
        ))}
      </div>
    )}
    
    {/* Só mostrar botão "Adicionar" se for seguro */}
    {rec.validacoes.seguro && (
      <button onClick={() => adicionarAoPlano(rec.produto.id)}>
        Adicionar ao Plano
      </button>
    )}
  </div>
))}
```

### **Exemplo 5: Mostrar Artigo Científico**

```typescript
{rec.artigo_cientifico && (
  <div className="artigo-cientifico">
    <h4>📚 Base Científica</h4>
    <p className="titulo">{rec.artigo_cientifico.titulo}</p>
    <p className="autores">{rec.artigo_cientifico.autores}</p>
    <p className="revista">
      {rec.artigo_cientifico.revista} ({rec.artigo_cientifico.ano})
    </p>
    <p className="nivel">
      Nível de Evidência: {rec.artigo_cientifico.nivel_evidencia}
    </p>
    <a 
      href={rec.artigo_cientifico.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      🔗 Ver no PubMed →
    </a>
  </div>
)}
```

---

## 🎯 Casos de Uso Comuns

### **1. Atualizar Recomendações Quando Dados Mudam**

```typescript
useEffect(() => {
  if (userProfile && userMeasurements) {
    const recommendations = recomendarProdutosMelhorado(
      userProfile,
      userAnamnesis,
      userMeasurements,
      quantidadeProdutos
    );
    setRecomendacoes(recommendations);
  }
}, [userProfile, userMeasurements, quantidadeProdutos]);
```

### **2. Filtrar por Categoria**

```typescript
const filtrarPorCategoria = (categoria: string) => {
  return recomendacoes.filter(r => 
    r.produto.category === categoria
  );
};

// Uso:
const vitaminas = filtrarPorCategoria('vitaminas');
```

### **3. Buscar Produto Específico**

```typescript
const buscarProduto = (produtoId: string) => {
  return recomendacoes.find(r => 
    r.produto.id === produtoId
  );
};

// Uso:
const cartControl = buscarProduto('CART_CONTROL');
```

### **4. Estatísticas**

```typescript
const estatisticas = {
  total: recomendacoes.length,
  criticos: recomendacoes.filter(r => r.prioridade_medica === 'CRÍTICA').length,
  altos: recomendacoes.filter(r => r.prioridade_medica === 'ALTA').length,
  scoreMedio: recomendacoes.reduce((acc, r) => acc + r.score_final, 0) / recomendacoes.length,
  comAlertas: recomendacoes.filter(r => r.validacoes.alertas.length > 0).length,
  comArtigos: recomendacoes.filter(r => r.artigo_cientifico).length
};
```

---

## 🔧 Configurações Avançadas

### **Personalizar Quantidade de Produtos**

```typescript
// Mínimo: 1, Máximo: 60
const recomendacoes = recomendarProdutosMelhorado(
  userProfile,
  userAnamnesis,
  userMeasurements,
  10  // ← Ajustar aqui
);
```

### **Adicionar Novos Produtos**

1. Editar: `src/data/produtos-atlantica-completo.json`
2. Adicionar novo objeto com todas as propriedades
3. Sistema detectará automaticamente

### **Adicionar Novos Artigos**

1. Editar: `src/data/artigos-cientificos-especificos.json`
2. Adicionar novo artigo com `produto_id` correspondente
3. Sistema buscará automaticamente

### **Adicionar Novas Condições**

1. Editar: `src/services/condicoesMedicas.ts`
2. Adicionar no objeto `condicoesMedicas`
3. Adicionar lógica de detecção em `detectarCondicoesMedicas()`

---

## ⚠️ Avisos Importantes

1. **Sempre validar dados do usuário** antes de passar para o sistema
2. **Tratar erros** caso algum JSON não carregue
3. **Não modificar** os arquivos JSON manualmente (pode quebrar o formato)
4. **Respeitar alertas de segurança** - não ignorar contraindicações
5. **Sistema não substitui** consulta médica profissional

---

## 🐛 Troubleshooting

### **Problema: Nenhuma recomendação retornada**

```typescript
// Verificar:
1. userProfile tem dados válidos?
2. userMeasurements é array?
3. Console.log para debug:

console.log('Perfil:', userProfile);
console.log('Medições:', userMeasurements);
console.log('Condições detectadas:', condicoesDetectadas);
```

### **Problema: Scores muito baixos**

```typescript
// Verificar se:
1. Objetivos do usuário estão preenchidos
2. Problemas de saúde estão corretos
3. Tags dos produtos correspondem aos objetivos
```

### **Problema: Artigos não aparecem**

```typescript
// Verificar:
1. produto_id corresponde ao id do produto
2. JSON está válido (sem erros de sintaxe)
3. Arquivo foi importado corretamente
```

---

## 📞 Suporte

Se tiver dúvidas:
1. Consulte: `SISTEMA_RECOMENDACAO_NUTRACEUTICOS_V2_COMPLETO.md`
2. Verifique os exemplos acima
3. Consulte o código-fonte dos serviços

---

**Desenvolvido por**: Instituto dos Sonhos  
**Versão**: 2.0.0  
**Data**: 15 de Outubro de 2025

