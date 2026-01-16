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
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado', code: 'INVALID_REQUEST' });
    }
    
    const { folder = 'general', userId } = req.body;
    // Todas as pastas do MinIO bucket 'images'
    const allowedFolders = [
      'avatars',
      'chat-images',
      'exercise-videos',
      'feed',
      'food-analysis',
      'medical-exams',
      'medical-reports',
      'profiles',
      'stories',
      'weight-photos',
      'whatsapp',
      'course-thumbnails',
      'product-images',
      'exercise-media',
      'general'
    ];
    
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ 
        success: false, 
        error: `Pasta inválida: ${folder}. Permitidas: ${allowedFolders.join(', ')}`,
        code: 'INVALID_REQUEST'
      });
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
      req.file.originalname,
      userId || null
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ success: false, error: error.message, code: 'UPLOAD_FAILED' });
  }
});

// ===========================================
// POST /storage/upload-base64
// Upload de arquivo em base64
// ===========================================
router.post('/upload-base64', async (req, res) => {
  try {
    const { data, folder = 'general', mimeType, filename, userId } = req.body;
    
    if (!data) {
      return res.status(400).json({ success: false, error: 'Dados não fornecidos', code: 'INVALID_REQUEST' });
    }
    
    // Todas as pastas do MinIO bucket 'images'
    const allowedFolders = [
      'avatars',
      'chat-images',
      'exercise-videos',
      'feed',
      'food-analysis',
      'medical-exams',
      'medical-reports',
      'profiles',
      'stories',
      'weight-photos',
      'whatsapp',
      'course-thumbnails',
      'product-images',
      'exercise-media',
      'general'
    ];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ success: false, error: `Pasta inválida: ${folder}`, code: 'INVALID_REQUEST' });
    }
    
    // Validar MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'application/pdf'
    ];
    
    const finalMimeType = mimeType || 'image/jpeg';
    if (!allowedMimeTypes.includes(finalMimeType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.',
        code: 'INVALID_TYPE'
      });
    }
    
    // Decodificar base64
    const base64Data = data.replace(/^data:[^;]+;base64,/, '');
    let buffer = Buffer.from(base64Data, 'base64');
    
    // Validar tamanho (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Máximo 50MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
    
    let processedMimeType = finalMimeType;
    
    // Otimizar imagens
    if (finalMimeType.startsWith('image/') && finalMimeType !== 'image/gif') {
      const optimized = await optimizeImage(buffer, finalMimeType);
      buffer = optimized.buffer;
      processedMimeType = optimized.mimeType;
    }
    
    const result = await uploadFile(buffer, folder, processedMimeType, filename, userId || null);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erro no upload base64:', error);
    res.status(500).json({ success: false, error: error.message, code: 'UPLOAD_FAILED' });
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
    res.status(500).json({ success: false, error: error.message, code: 'DELETE_FAILED' });
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
    res.status(500).json({ success: false, error: error.message, code: 'LIST_FAILED' });
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
