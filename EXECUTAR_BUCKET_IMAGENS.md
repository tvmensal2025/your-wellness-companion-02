# 🖼️ Como Executar o Bucket de Imagens

## ✅ Passo a Passo

### **1. Executar o SQL no Supabase**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo: `CRIAR_BUCKET_IMAGENS_PRODUTOS.sql`
4. Clique em **Run**

### **2. Verificar se Funcionou**

Execute este SQL para verificar:

```sql
-- Verificar se o bucket foi criado
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-images';

-- Verificar se as políticas foram criadas
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product%';

-- Testar a função
SELECT 
  id,
  name,
  image_url,
  get_product_image_url(image_url) as full_url
FROM products_with_images 
WHERE image_url IS NOT NULL 
LIMIT 5;
```

### **3. Resultado Esperado**

Você deve ver:
- ✅ Bucket `product-images` criado
- ✅ 4 políticas RLS criadas
- ✅ Função `get_product_image_url()` funcionando
- ✅ View `products_with_images` funcionando
- ✅ URLs de imagem sendo geradas

---

## 🎯 O Que Foi Criado

### **Bucket de Storage**
- **Nome**: `product-images`
- **Público**: Sim (qualquer um pode ver as imagens)
- **Limite**: 5MB por arquivo
- **Tipos permitidos**: JPG, PNG, WebP, GIF

### **Políticas RLS**
1. **Leitura pública**: Qualquer um pode ver as imagens
2. **Upload**: Apenas usuários autenticados
3. **Atualização**: Apenas usuários autenticados
4. **Exclusão**: Apenas usuários autenticados

### **Funções e Views**
- `get_product_image_url()`: Gera URL pública das imagens
- `products_with_images`: View com URLs completas

---

## 🚀 Como Usar

### **No Frontend (React)**
```typescript
// Upload de imagem
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`products/${fileName}`, file);

// Obter URL pública
const { data: urlData } = supabase.storage
  .from('product-images')
  .getPublicUrl(filePath);
```

### **No Banco de Dados**
```sql
-- Inserir produto com imagem
INSERT INTO supplements (name, image_url) 
VALUES ('Produto Teste', 'products/imagem.jpg');

-- Buscar produtos com imagens
SELECT * FROM products_with_images 
WHERE has_image = true;
```

---

## 🔧 Configurações

### **Variáveis de Ambiente**
Certifique-se de que tem no `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### **Permissões**
- ✅ Usuários autenticados podem fazer upload
- ✅ Qualquer um pode ver as imagens
- ✅ URLs públicas funcionam

---

## 🐛 Troubleshooting

### **Erro: "Bucket não encontrado"**
```sql
-- Verificar se o bucket existe
SELECT * FROM storage.buckets WHERE id = 'product-images';
```

### **Erro: "Política não encontrada"**
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### **Erro: "Função não encontrada"**
```sql
-- Verificar se a função existe
SELECT * FROM pg_proc WHERE proname = 'get_product_image_url';
```

### **Imagens não aparecem**
1. Verificar se a URL está correta
2. Verificar se o arquivo existe no storage
3. Verificar se as políticas RLS estão corretas

---

## ✅ Checklist

- [ ] SQL executado no Supabase
- [ ] Bucket `product-images` criado
- [ ] 4 políticas RLS criadas
- [ ] Função `get_product_image_url()` criada
- [ ] View `products_with_images` criada
- [ ] Teste de upload funcionando
- [ ] URLs públicas funcionando

---

## 🎉 Próximos Passos

1. **Testar upload** no componente `ImageUpload`
2. **Verificar imagens** aparecendo nos produtos
3. **Configurar CDN** se necessário
4. **Otimizar imagens** (compressão automática)

---

**Desenvolvido por**: Instituto dos Sonhos  
**Sistema**: Sofia Nutricional  
**Data**: 15 de Outubro de 2025
