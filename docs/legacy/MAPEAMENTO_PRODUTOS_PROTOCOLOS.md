# 🔗 MAPEAMENTO DE PRODUTOS NOS PROTOCOLOS

## ⚠️ IMPORTANTE: Diferenças entre Arquivos

O arquivo `MIGRACAO_PRODUTOS_FINAL_V2.sql` usa **external_ids diferentes** do arquivo antigo `20251123_nemasway_products_complete.sql`.

### 📋 MAPEAMENTO CORRETO (Baseado em MIGRACAO_PRODUTOS_FINAL_V2.sql)

| Nome no Protocolo | External ID Correto | Status |
|-------------------|---------------------|--------|
| Ozônio em Cápsulas | ❌ **FALTANDO** | Precisa adicionar ao MIGRACAO_PRODUTOS_FINAL_V2.sql |
| Spirulina | `SPIRULINA_VIT_E` | ✅ Existe |
| SDFibro / SDFibro3 | `SD_FIBRO3` | ✅ Existe |
| BVBInsu | `BVB_INSU` | ✅ Existe |
| D3K2 | `BVB_D3K2` | ✅ Existe |
| Ômega 3 | `OMEGA_3_1400MG` | ✅ Existe |
| BVB B12 | `BVB_B12` | ✅ Existe |
| Propoway | `PROPOWAY_VERMELHA` | ✅ Existe |
| Própolis Verde | `PROPOLIS_VERDE` | ✅ Existe |
| ProWoman | `PROWOMAN` | ✅ Existe |
| ProMen | `PROMEN` | ✅ Existe |
| Seremix | `SEREMIX` | ✅ Existe |
| Coenzima Q10 | `BVB_Q10` | ✅ Existe |
| RX21 | `MEGA_NUTRI_RX21` | ✅ Existe |
| VitamixSkin | `VITAMIX_SKIN` | ✅ Existe |
| VisionWay | `VISION_WAY` | ✅ Existe |
| LibWay | `LIBWAY` | ✅ Existe |
| Lipoway | `LIPOWAY` | ✅ Existe |
| Amargo | `AMARGO` | ✅ Existe |
| Óleo de Prímula | `OLEO_PRIMULA` | ✅ Existe |
| Vitamina C | `VITAMINA_C_400MG` | ✅ Existe |
| Polivitamix | `POLIVITAMIX` | ✅ Existe |
| Colágeno Tipo II | `COLAGENO_TIPO_II` | ✅ Existe |
| SDArtro | `SD_ARTRO` | ✅ Existe |
| Melatonina | `MELATONINA` | ✅ Existe |
| Sabonete Íntimo | `SABONETE_INTIMO_SEDUCAO` | ✅ Existe |
| Óleo Hot | `OLEO_HOT` | ✅ Existe |
| Óleo de Girassol Ozonizado | `OLEO_GIRASSOL_OZONIZADO` | ✅ Existe |
| Óleo de Massagem Ozonizado | `OLEO_MASSAGEM_OZONIZADO` | ✅ Existe |
| Gel Crioterápico | `GEL_CRIOTERAPICO` | ✅ Existe |
| Peeling 5x1 | `PEELING_5X1` | ✅ Existe |
| Top Secrets | `TOP_SECRETS` | ✅ Existe |
| Fresh Glow Sabonete | `FRESH_GLOW_SABONETE` | ✅ Existe |
| Sérum Vitamina C | `SERUM_VITAMINA_C` | ✅ Existe |
| Sérum Retinol | `SERUM_RETINOL` | ✅ Existe |

## ❌ PRODUTO FALTANDO

**OZONIO** - "Ozônio em Cápsulas"
- **External ID:** `OZONIO`
- **Preço:** R$ 149.90 (original) / R$ 74.95 (desconto)
- **Descrição:** Óleo de girassol ozonizado em cápsulas para oxigenação e regeneração celular
- **Ação:** Precisa adicionar ao `MIGRACAO_PRODUTOS_FINAL_V2.sql`

## 🔧 CORREÇÃO NECESSÁRIA

O produto **OZONIO** é usado em **TODOS** os protocolos, mas não está no arquivo `MIGRACAO_PRODUTOS_FINAL_V2.sql`. 

**Solução:** Adicionar o produto OZONIO ao arquivo antes de criar os protocolos.

---

**Data:** 2025-01-XX  
**Status:** ⚠️ Aguardando correção do produto OZONIO

