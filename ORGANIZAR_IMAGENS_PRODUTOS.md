# 📁 Organização das Imagens dos Produtos

## 📋 Instruções para Organizar as Imagens

### **1. 📂 Estrutura de Pastas**
Crie a seguinte estrutura de pastas:
```
Public/images/produtos/
├── cart-control.png
├── az-complex.png
├── bcaa.png
├── maca-peruana.png
├── imunic.png
├── chlorella.png
├── coenzima-q10.png
├── espirulina.png
├── vitamina-d3.png
├── magnesio.png
├── colageno.png
├── vitamina-k2.png
├── vitamina-b12.png
├── vitamina-a.png
├── colageno-sub30.png
├── focuss.png
├── imuni-pro.png
├── geleia-real.png
├── imuni-kids.png
├── natuoz-bronze.png
├── natuoz-bucal.png
├── l-triptofano.png
├── natuoz-hot.png
├── life-control.png
├── omega3.png
├── dermo-peeling.png
├── shake-baunilha.png
├── shake-chocolate.png
├── zma.png
├── slim-cha.png
├── pre-treino-cafe.png
├── picolinato-cromo.png
├── cafe-fibras.png
├── nighth-cha.png
├── shake-morango.png
└── thermo-heat.png
```

### **2. 🖼️ Nomes dos Arquivos**
Use os seguintes nomes para cada produto:

| Produto | Nome do Arquivo |
|---------|----------------|
| CART CONTROL | `cart-control.png` |
| A-Z COMPLEX | `az-complex.png` |
| BCAA | `bcaa.png` |
| MACA PERUANA | `maca-peruana.png` |
| IMUNIC | `imunic.png` |
| Chlorella | `chlorella.png` |
| Coenzima Q10 | `coenzima-q10.png` |
| Espirulina | `espirulina.png` |
| Vitamina D3 | `vitamina-d3.png` |
| Cloreto de Magnésio | `magnesio.png` |
| Colágeno | `colageno.png` |
| Vitamina K2 MK7 | `vitamina-k2.png` |
| Vitamina B12 | `vitamina-b12.png` |
| Vitamina A | `vitamina-a.png` |
| Colágeno SUB 30 | `colageno-sub30.png` |
| Focuss | `focuss.png` |
| İMUNİ PRO | `imuni-pro.png` |
| GELEIA REAL | `geleia-real.png` |
| IMUNI KIDS | `imuni-kids.png` |
| NatuOz BRONZE | `natuoz-bronze.png` |
| NatuOz BUCAL | `natuoz-bucal.png` |
| L-TRIPTOFANO | `l-triptofano.png` |
| NatuOz HOT | `natuoz-hot.png` |
| LÍFE control | `life-control.png` |
| OMEGA3 | `omega3.png` |
| Dermo Natuoz PEELING | `dermo-peeling.png` |
| Shake BAUNILHA | `shake-baunilha.png` |
| Shake CHOCOLATE | `shake-chocolate.png` |
| ZMA | `zma.png` |
| SLIM Cha SB. | `slim-cha.png` |
| NATURAL PRÉ-TREINO CAFÉ | `pre-treino-cafe.png` |
| Picolinato de Cromo | `picolinato-cromo.png` |
| NATURAL Café Fibras | `cafe-fibras.png` |
| Nighth Chá | `nighth-cha.png` |
| Shake Morango | `shake-morango.png` |
| Thermo Heat | `thermo-heat.png` |

### **3. 📋 Passos para Organizar**

#### **Passo 1: Criar a Pasta**
```bash
mkdir -p Public/images/produtos
```

#### **Passo 2: Mover as Imagens**
Mova todas as imagens que você enviou para a pasta `Public/images/produtos/` e renomeie-as conforme a tabela acima.

#### **Passo 3: Executar Script SQL**
Execute o script `ATUALIZAR_IMAGENS_LOCAIS.sql` no Supabase SQL Editor.

#### **Passo 4: Verificar**
Acesse o painel administrativo e verifique se as imagens estão aparecendo.

### **4. 🔧 Script SQL Criado**
O arquivo `ATUALIZAR_IMAGENS_LOCAIS.sql` já está pronto e configurado para usar as URLs locais.

### **5. 📊 Resultado Esperado**
Após organizar as imagens e executar o script:
- ✅ **Imagens locais funcionando**
- ✅ **Carregamento rápido**
- ✅ **Sem dependência de URLs externas**
- ✅ **Controle total sobre as imagens**

### **6. 🚨 Se Alguma Imagem Não Aparecer**
1. **Verifique o nome do arquivo** - deve corresponder exatamente à tabela
2. **Verifique o caminho** - deve estar em `Public/images/produtos/`
3. **Verifique o formato** - preferencialmente PNG ou JPG
4. **Verifique o tamanho** - recomendado 300x300px

---

**🎯 Organize as imagens conforme esta estrutura e execute o script SQL!**
