# 📸 Guia para Organizar Imagens dos Produtos

## 🎯 Objetivo
Organizar as imagens dos produtos que você enviou através do chat para que apareçam corretamente no sistema.

## 📋 Passo a Passo

### 1. **Salvar as Imagens no Projeto**
Você precisa salvar manualmente cada imagem que enviou no chat na pasta do projeto:

```
Public/images/produtos/
```

### 2. **Nomes dos Arquivos Padronizados**
Salve cada imagem com os seguintes nomes (em minúsculas, com hífens):

#### Produtos Principais:
- `balsamo-oleo-da-vida.png`
- `curcu-mais.png`
- `cart-control.png`
- `liquid-efeito-matte.png`
- `oleo-essencial-menta.png`
- `oleo-essencial-eucalipto.png`
- `bcaa.png`
- `maca-peruana.png`
- `imunic.png`
- `chlorella.png`
- `coenzima-q10.png`
- `espirulina.png`
- `mascara-facial-ozonizada.png`
- `natuoz-oleo-girassol-ozonizado.png`
- `fibras-complex.png`
- `vitamina-d3.png`
- `cloreto-magnesio.png`
- `gloss.png`
- `natuoz-creme-dental-ozonizado.png`
- `eleva-day.png`
- `colageno.png`
- `vitamina-k2mk7.png`
- `essencial-beauty.png`
- `az-complex.png`
- `vitamina-b12.png`
- `vitamina-a.png`
- `colageno-sub-30.png`
- `focuss.png`
- `imuni-pro.png`
- `geleia-real.png`
- `imuni-kids.png`
- `natuoz-bronze.png`
- `natuoz-bucal.png`
- `ltriptofano.png`
- `natuoz-hot.png`
- `life-control.png`
- `omega3.png`
- `dermo-natuoz-peeling-cristal-ozonizado.png`
- `shake-baunilha.png`
- `shake-chocolate.png`
- `zma.png`
- `slim-cha-sb.png`
- `natural-pre-treino-cafe.png`
- `picolinato-cromo.png`
- `natural-cafe-fibras.png`
- `nighth-cha.png`
- `shake-morango.png`
- `thermo-heat.png`
- `moro-treiny.png`
- `energy-guarana.png`

### 3. **Como Salvar as Imagens**

#### Opção A: Arrastar e Soltar
1. Abra a pasta `Public/images/produtos/` no Finder (Mac) ou Explorer (Windows)
2. Arraste cada imagem do chat para esta pasta
3. Renomeie cada arquivo conforme a lista acima

#### Opção B: Copiar e Colar
1. Clique com o botão direito na imagem no chat
2. Selecione "Salvar imagem como..."
3. Navegue até `Public/images/produtos/`
4. Salve com o nome padronizado

### 4. **Verificar se as Imagens Foram Salvas**
Execute este comando para verificar:

```bash
ls -la Public/images/produtos/
```

### 5. **Executar o Script SQL**
Após organizar todas as imagens, execute o arquivo `ATUALIZAR_IMAGENS_LOCAIS_REAIS.sql` no Supabase SQL Editor.

## ⚠️ Importante

- **Formato**: Use apenas `.png` ou `.jpg`
- **Nomes**: Use apenas letras minúsculas, números e hífens
- **Tamanho**: Mantenha as imagens com tamanho razoável (máximo 2MB cada)
- **Qualidade**: Use imagens com boa qualidade e resolução

## 🔧 Script de Verificação

Após organizar as imagens, execute este comando para verificar se tudo está correto:

```bash
# Verificar se todas as imagens estão na pasta
ls -la Public/images/produtos/ | wc -l

# Verificar se os nomes estão corretos
ls Public/images/produtos/ | sort
```

## 📞 Suporte

Se tiver dúvidas sobre algum nome específico ou precisar de ajuda para organizar as imagens, me avise!

---

**Total de produtos esperados: 59 imagens**
