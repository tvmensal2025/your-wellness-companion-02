/**
 * MinIO Service - Storage de Mídia
 */

import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

let minioClient = null;

export async function initMinIO() {
  minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
  });

  // Verificar/criar bucket
  const bucket = process.env.MINIO_BUCKET || 'images';
  const exists = await minioClient.bucketExists(bucket);
  
  if (!exists) {
    await minioClient.makeBucket(bucket);
    console.log(`📦 Bucket '${bucket}' criado`);
    
    // Configurar política pública para leitura
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucket}/*`]
      }]
    };
    await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
  }
  
  return minioClient;
}

export function getMinioClient() {
  if (!minioClient) {
    throw new Error('MinIO não inicializado');
  }
  return minioClient;
}

/**
 * Upload de arquivo para MinIO
 * @param {Buffer} buffer - Conteúdo do arquivo
 * @param {string} folder - Pasta (whatsapp, feed, stories, profiles)
 * @param {string} mimeType - Tipo MIME
 * @param {string} originalName - Nome original (opcional)
 * @returns {Promise<{url: string, path: string, size: number}>}
 */
export async function uploadFile(buffer, folder, mimeType, originalName = '') {
  const client = getMinioClient();
  const bucket = process.env.MINIO_BUCKET || 'images';
  
  // Gerar nome único
  const ext = getExtensionFromMime(mimeType);
  const fileName = `${uuidv4()}${ext}`;
  const path = `${folder}/${fileName}`;
  
  // Metadados
  const metaData = {
    'Content-Type': mimeType,
    'X-Original-Name': originalName,
    'X-Upload-Date': new Date().toISOString()
  };
  
  // Upload
  await client.putObject(bucket, path, buffer, buffer.length, metaData);
  
  // URL pública - MinIO pode ter bucket no path ou como subdomínio
  const baseUrl = process.env.MINIO_PUBLIC_URL || `https://${process.env.MINIO_ENDPOINT}`;
  // Se a URL já inclui o bucket, não duplicar
  const publicUrl = baseUrl.includes(bucket) 
    ? `${baseUrl}/${path}` 
    : `${baseUrl}/${bucket}/${path}`;
  
  return {
    url: publicUrl,
    path,
    size: buffer.length,
    mimeType
  };
}

/**
 * Deletar arquivo do MinIO
 */
export async function deleteFile(path) {
  const client = getMinioClient();
  const bucket = process.env.MINIO_BUCKET || 'images';
  await client.removeObject(bucket, path);
}

/**
 * Listar arquivos de uma pasta
 */
export async function listFiles(folder, limit = 100) {
  const client = getMinioClient();
  const bucket = process.env.MINIO_BUCKET || 'images';
  
  const files = [];
  const stream = client.listObjects(bucket, folder, true);
  
  // Construir URL base
  const baseUrl = process.env.MINIO_PUBLIC_URL || `https://${process.env.MINIO_ENDPOINT}`;
  const urlPrefix = baseUrl.includes(bucket) ? baseUrl : `${baseUrl}/${bucket}`;
  
  return new Promise((resolve, reject) => {
    stream.on('data', (obj) => {
      if (files.length < limit) {
        files.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          url: `${urlPrefix}/${obj.name}`
        });
      }
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(files));
  });
}

function getExtensionFromMime(mimeType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/webm': '.webm',
    'application/pdf': '.pdf'
  };
  return map[mimeType] || '.bin';
}
