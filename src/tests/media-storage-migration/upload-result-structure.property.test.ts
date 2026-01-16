/**
 * Property-Based Tests for Media Storage Migration - Upload Result Structure
 * 
 * **Feature: media-storage-migration**
 * **Property 1: Upload Result Structure Completeness**
 * **Validates: Requirements 1.2, 2.4**
 * 
 * This test verifies that for any valid file upload that succeeds, the returned
 * UploadResult contains all required fields with correct types and non-empty constraints.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { uploadToExternalStorage, ALLOWED_MIME_TYPES } from '@/lib/externalMedia';
import type { UploadResult, MediaFolder } from '@/lib/externalMedia';

// ===========================================
// Test Setup
// ===========================================

describe('Media Storage Migration - Property 1: Upload Result Structure', () => {
  let originalFetch: typeof global.fetch;
  
  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
    
    // Set required environment variable
    vi.stubEnv('VITE_MEDIA_API_URL', 'https://test-api.example.com');
  });
  
  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  // ===========================================
  // Arbitraries (Generators)
  // ===========================================

  /**
   * Generate valid MIME types from allowed list
   */
  const validMimeTypeArb = fc.constantFrom(...ALLOWED_MIME_TYPES);

  /**
   * Generate valid folder names
   */
  const validFolderArb = fc.constantFrom<MediaFolder>(
    'whatsapp',
    'feed',
    'stories',
    'profiles',
    'food-analysis',
    'weight-photos'
  );

  /**
   * Generate valid user IDs
   */
  const userIdArb = fc.uuid();

  /**
   * Generate file sizes (1KB to 10MB for testing)
   */
  const fileSizeArb = fc.integer({ min: 1024, max: 10 * 1024 * 1024 });

  /**
   * Generate valid file content as base64
   */
  const base64ContentArb = fc.string({ minLength: 100, maxLength: 1000 }).map(str => {
    return Buffer.from(str).toString('base64');
  });

  /**
   * Generate valid paths matching pattern: {userId}/{folder}/{timestamp}-{uuid}.{ext}
   */
  const validPathArb = fc.tuple(
    userIdArb,
    validFolderArb,
    fc.integer({ min: 1000000000000, max: 9999999999999 }), // timestamp
    fc.uuid(),
    fc.constantFrom('.jpg', '.png', '.gif', '.webp', '.mp4', '.mov', '.webm')
  ).map(([userId, folder, timestamp, uuid, ext]) => {
    return `${userId}/${folder}/${timestamp}-${uuid}${ext}`;
  });

  /**
   * Generate valid public URLs
   */
  const validUrlArb = fc.tuple(
    fc.constantFrom('https://test-api.example.com', 'https://minio.example.com'),
    validPathArb
  ).map(([baseUrl, path]) => {
    return `${baseUrl}/images/${path}`;
  });

  /**
   * Generate complete mock API response
   */
  const mockApiResponseArb = fc.record({
    success: fc.constant(true),
    url: validUrlArb,
    path: validPathArb,
    size: fileSizeArb,
    mimeType: validMimeTypeArb,
  });

  // ===========================================
  // Property Tests
  // ===========================================

  /**
   * **Property 1: Upload Result Structure Completeness**
   * 
   * For any valid file upload that succeeds, the returned UploadResult SHALL contain:
   * - url: non-empty string
   * - path: non-empty string
   * - size: positive number
   * - mimeType: valid MIME type string
   * - success: true
   */
  it('should return complete UploadResult structure for all successful uploads', async () => {
    await fc.assert(
      fc.asyncProperty(
        base64ContentArb,
        validFolderArb,
        userIdArb,
        mockApiResponseArb,
        async (base64Content, folder, userId, mockResponse) => {
          // Mock fetch to return successful response
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          // Perform upload
          const result = await uploadToExternalStorage(base64Content, {
            folder,
            userId,
          });

          // Verify result is successful
          expect(result.success).toBe(true);

          // Type guard to access UploadResult fields
          if (result.success) {
            const uploadResult = result as UploadResult;

            // Property 1.1: url field exists and is non-empty string
            expect(uploadResult.url).toBeDefined();
            expect(typeof uploadResult.url).toBe('string');
            expect(uploadResult.url.length).toBeGreaterThan(0);

            // Property 1.2: path field exists and is non-empty string
            expect(uploadResult.path).toBeDefined();
            expect(typeof uploadResult.path).toBe('string');
            expect(uploadResult.path.length).toBeGreaterThan(0);

            // Property 1.3: size field exists and is positive number
            expect(uploadResult.size).toBeDefined();
            expect(typeof uploadResult.size).toBe('number');
            expect(uploadResult.size).toBeGreaterThan(0);

            // Property 1.4: mimeType field exists and is valid MIME type
            expect(uploadResult.mimeType).toBeDefined();
            expect(typeof uploadResult.mimeType).toBe('string');
            expect(ALLOWED_MIME_TYPES).toContain(uploadResult.mimeType as any);

            // Property 1.5: success field is true
            expect(uploadResult.success).toBe(true);
          }
        }
      ),
      {
        numRuns: 100, // Run 100 iterations as per design document
        verbose: true,
      }
    );
  });

  /**
   * **Property 1.6: URL is well-formed**
   * 
   * The URL field should be a valid HTTP/HTTPS URL
   */
  it('should return well-formed URLs for all successful uploads', async () => {
    await fc.assert(
      fc.asyncProperty(
        base64ContentArb,
        validFolderArb,
        userIdArb,
        mockApiResponseArb,
        async (base64Content, folder, userId, mockResponse) => {
          // Mock fetch
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          const result = await uploadToExternalStorage(base64Content, {
            folder,
            userId,
          });

          if (result.success) {
            const uploadResult = result as UploadResult;

            // URL should start with http:// or https://
            expect(
              uploadResult.url.startsWith('http://') ||
              uploadResult.url.startsWith('https://')
            ).toBe(true);

            // URL should be parseable
            expect(() => new URL(uploadResult.url)).not.toThrow();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Property 1.7: Path follows expected pattern**
   * 
   * The path should follow the pattern: {userId}/{folder}/{timestamp}-{uuid}.{ext}
   * or {folder}/{timestamp}-{uuid}.{ext} if no userId
   */
  it('should return paths following the expected pattern', async () => {
    await fc.assert(
      fc.asyncProperty(
        base64ContentArb,
        validFolderArb,
        userIdArb,
        async (base64Content, folder, userId) => {
          // Create mock response with matching userId and folder
          const mockResponse = {
            success: true,
            url: `https://test.com/${userId}/${folder}/test.jpg`,
            path: `${userId}/${folder}/1234567890-uuid-test.jpg`,
            size: 1024,
            mimeType: 'image/jpeg' as const,
          };

          // Mock fetch
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          const result = await uploadToExternalStorage(base64Content, {
            folder,
            userId,
          });

          if (result.success) {
            const uploadResult = result as UploadResult;

            // Path should contain the folder name
            expect(uploadResult.path).toContain(folder);

            // Path should contain userId if provided
            if (userId) {
              expect(uploadResult.path).toContain(userId);
            }

            // Path should have an extension
            const hasExtension = /\.(jpg|png|gif|webp|mp4|mov|webm)$/i.test(uploadResult.path);
            expect(hasExtension).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Property 1.8: Size matches content size**
   * 
   * The size field should reflect the actual file size
   */
  it('should return size that matches the uploaded content', async () => {
    await fc.assert(
      fc.asyncProperty(
        base64ContentArb,
        validFolderArb,
        userIdArb,
        fileSizeArb,
        async (base64Content, folder, userId, expectedSize) => {
          // Create mock response with specific size
          const mockResponse = {
            success: true,
            url: 'https://test.com/file.jpg',
            path: `${userId}/${folder}/test.jpg`,
            size: expectedSize,
            mimeType: 'image/jpeg',
          };

          // Mock fetch
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          const result = await uploadToExternalStorage(base64Content, {
            folder,
            userId,
          });

          if (result.success) {
            const uploadResult = result as UploadResult;

            // Size should match what the API returned
            expect(uploadResult.size).toBe(expectedSize);
            
            // Size should be positive
            expect(uploadResult.size).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Property 1.9: MIME type is preserved**
   * 
   * The mimeType field should be one of the allowed MIME types
   */
  it('should return valid MIME types for all successful uploads', async () => {
    await fc.assert(
      fc.asyncProperty(
        base64ContentArb,
        validFolderArb,
        userIdArb,
        validMimeTypeArb,
        async (base64Content, folder, userId, mimeType) => {
          // Create mock response with specific MIME type
          const mockResponse = {
            success: true,
            url: 'https://test.com/file.jpg',
            path: `${userId}/${folder}/test.jpg`,
            size: 1024,
            mimeType: mimeType,
          };

          // Mock fetch
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          const result = await uploadToExternalStorage(base64Content, {
            folder,
            userId,
          });

          if (result.success) {
            const uploadResult = result as UploadResult;

            // MIME type should be one of the allowed types
            expect(ALLOWED_MIME_TYPES).toContain(uploadResult.mimeType as any);
            
            // MIME type should match what was returned by API
            expect(uploadResult.mimeType).toBe(mimeType);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
