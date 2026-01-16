/**
 * Storage Routes - Upload/Download de mídia
 */

import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { uploadFile, deleteFile, listFiles } from '../services/minio.js';

const router = express.Router();

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

// ===========================================
// POST /storage/upload
// Upload de arquivo
// ===========================================
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    const { folder = 'general' } = req.body;
    const allowedFolders = ['whatsapp', 'feed', 'stories', 'profiles', 'general'];
    
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: 'Pasta inválida' });
    }
    
    let buffer = req.file.buffer;
    let mimeType = req.file.mimetype;
    
    // Otimizar imagens
    if (mimeType.startsWith('image/') && mimeType !== 'image/gif') {
      const optimized = await optimizeImage(buffer, mimeType);
      buffer = optimized.buffer;
      mimeType = optimized.mimeType;
    }
    
    const result = await uploadFile(
      buffer,
      folder,
      mimeType,
      req.file.originalname
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /storage/upload-base64
// Upload de arquivo em base64
// ===========================================
router.post('/upload-base64', async (req, res) => {
  try {
    const { data, folder = 'general', mimeType, filename } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Dados não fornecidos' });
    }
    
    const allowedFolders = ['whatsapp', 'feed', 'stories', 'profiles', 'general'];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: 'Pasta inválida' });
    }
    
    // Decodificar base64
    const base64Data = data.replace(/^data:[^;]+;base64,/, '');
    let buffer = Buffer.from(base64Data, 'base64');
    let finalMimeType = mimeType || 'image/jpeg';
    
    // Otimizar imagens
    if (finalMimeType.startsWith('image/') && finalMimeType !== 'image/gif') {
      const optimized = await optimizeImage(buffer, finalMimeType);
      buffer = optimized.buffer;
      finalMimeType = optimized.mimeType;
    }
    
    const result = await uploadFile(buffer, folder, finalMimeType, filename);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erro no upload base64:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// DELETE /storage/:folder/:filename
// Deletar arquivo
// ===========================================
router.delete('/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const path = `${folder}/${filename}`;
    
    await deleteFile(path);
    
    res.json({ success: true, deleted: path });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /storage/list/:folder
// Listar arquivos de uma pasta
// ===========================================
router.get('/list/:folder', async (req, res) => {
  try {
    const { folder } = req.params;
    const { limit = 100 } = req.query;
    
    const files = await listFiles(folder, parseInt(limit));
    
    res.json({
      success: true,
      folder,
      count: files.length,
      files
    });
  } catch (error) {
    console.error('Erro ao listar:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// Helpers
// ===========================================

async function optimizeImage(buffer, mimeType) {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  // Redimensionar se muito grande
  let pipeline = image;
  if (metadata.width > 1920 || metadata.height > 1920) {
    pipeline = pipeline.resize(1920, 1920, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  // Converter para WebP para melhor compressão
  const optimized = await pipeline
    .webp({ quality: 85 })
    .toBuffer();
  
  return {
    buffer: optimized,
    mimeType: 'image/webp'
  };
}

export default router;
