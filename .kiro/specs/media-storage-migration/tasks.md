# Implementation Plan: Media Storage Migration

## Overview

This implementation plan covers the migration of media storage from Supabase Storage to a self-hosted MinIO instance on a VPS. The implementation follows a bottom-up approach: first building the VPS infrastructure (Media API + MinIO), then the client library, followed by integration with existing components, and finally comprehensive testing.

## Tasks

- [x] 1. Set up VPS Media API infrastructure
  - [x] 1.1 Create Media API project structure
    - Create `vps-backend/src/routes/media.js` with upload endpoint
    - Create `vps-backend/src/services/minio.js` for MinIO client
    - Add MinIO SDK dependency (`minio` package)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 1.2 Implement MinIO service layer
    - Initialize MinIO client with environment variables
    - Implement `uploadFile(buffer, folder, userId, filename)` function
    - Implement unique filename generation with UUID
    - Implement path structure: `{userId}/{folder}/{timestamp}-{uuid}.{ext}`
    - _Requirements: 2.6, 2.7_

  - [x] 1.3 Implement upload endpoint with validation
    - Handle both JSON (base64) and multipart/form-data requests
    - Implement server-side MIME type validation
    - Implement server-side file size validation (default 50MB)
    - Return standardized success/error responses
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.5_

  - [x] 1.4 Configure MinIO bucket and CORS
    - Create `images` bucket with public read policy
    - Configure CORS for browser access
    - Set up bucket lifecycle policies if needed
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 1.5 Update docker-compose for MinIO integration
    - Add MinIO service configuration
    - Add media-api service configuration
    - Configure environment variables
    - _Requirements: 5.4_

- [x] 2. Checkpoint - Verify VPS infrastructure
  - Ensure MinIO is accessible and bucket is created
  - Test upload endpoint manually with curl/Postman
  - Verify public URLs are accessible
  - Ask the user if questions arise

- [x] 3. Implement External Storage Client Library
  - [x] 3.1 Create externalMedia.ts with types and interfaces
    - Define `MediaFolder`, `UploadOptions`, `UploadResult`, `UploadError` types
    - Define `UploadResponse` union type
    - Export allowed MIME types constant
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Implement file validation function
    - Create `validateMediaFile(file, maxSizeMB)` function
    - Validate MIME type against allowed list
    - Validate file size against maximum
    - Return Portuguese error messages as specified
    - _Requirements: 1.5, 1.6, 7.1, 7.2, 7.3, 7.4_

  - [x] 3.3 Implement uploadToExternalStorage function
    - Support File, Blob, and base64 string inputs
    - Convert File/Blob to base64 for API request
    - Call validation before making network request
    - Handle API responses and errors
    - Read MEDIA_API_URL from environment
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 5.1, 5.2, 5.3_

  - [ ]* 3.4 Write property test for MIME type validation
    - **Property 3: MIME Type Validation Consistency**
    - Generate random MIME types, verify correct acceptance/rejection
    - Verify exact error message for invalid types
    - **Validates: Requirements 1.5, 7.1, 7.3**

  - [ ]* 3.5 Write property test for file size validation
    - **Property 4: File Size Validation Consistency**
    - Generate files of various sizes around the limit
    - Verify exact error message pattern for oversized files
    - **Validates: Requirements 1.6, 7.2, 7.4**

  - [ ]* 3.6 Write property test for no network on validation failure
    - **Property 5: No Network Request on Validation Failure**
    - Mock fetch, generate invalid files, verify no network calls
    - **Validates: Requirements 1.7**

- [x] 4. Checkpoint - Verify client library
  - Ensure externalMedia.ts compiles without errors
  - Run property tests for validation functions
  - Ask the user if questions arise

- [-] 5. Implement property tests for upload functionality
  - [x] 5.1 Write property test for upload result structure
    - **Property 1: Upload Result Structure Completeness**
    - Generate valid files, verify all required fields present
    - Verify field types and non-empty constraints
    - **Validates: Requirements 1.2, 2.4**

  - [ ]* 5.2 Write property test for input format flexibility
    - **Property 2: Input Format Flexibility**
    - Generate files, upload as both base64 and File/Blob
    - Verify same result (size, mimeType) for both formats
    - **Validates: Requirements 1.4**

  - [ ]* 5.3 Write property test for unique filename generation
    - **Property 6: Unique Filename Generation**
    - Generate many uploads without explicit filenames
    - Verify no filename collisions
    - **Validates: Requirements 2.6**

  - [ ]* 5.4 Write property test for path structure pattern
    - **Property 7: Path Structure Pattern**
    - Generate uploads with various folders/userIds
    - Verify path matches pattern `{userId}/{folder}/{timestamp}-{uuid}.{ext}`
    - **Validates: Requirements 2.7, 4.2, 4.4**

  - [ ]* 5.5 Write property test for server-client validation consistency
    - **Property 8: Server-Client Validation Consistency**
    - Generate files, validate on client and server
    - Verify matching acceptance/rejection results
    - **Validates: Requirements 7.5**

  - [ ]* 5.6 Write property test for public URL accessibility
    - **Property 9: Public URL Accessibility**
    - Upload files, verify URLs return 200 with correct content
    - **Validates: Requirements 8.1, 8.3**

- [x] 6. Update Community Media integration
  - [x] 6.1 Update communityMedia.ts to use external storage
    - Import `uploadToExternalStorage` from externalMedia
    - Update `uploadCommunityMedia` to call external storage
    - Map 'posts' folder to 'feed' for external storage
    - Maintain backward compatibility with return type
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.2 Update feed post upload components
    - Verify components use communityMedia.ts
    - Handle error responses with user-friendly messages
    - _Requirements: 3.6_

  - [x] 6.3 Update story upload components
    - Verify components use communityMedia.ts
    - Handle error responses with user-friendly messages
    - _Requirements: 3.6_

  - [ ]* 6.4 Write unit tests for community media integration
    - Test feed upload flow
    - Test story upload flow
    - Test error handling
    - _Requirements: 3.1, 3.2, 3.6_

- [x] 7. Update WhatsApp Image Handler
  - [x] 7.1 Create uploadToExternalMedia function in Edge Function
    - Read MEDIA_API_URL and MEDIA_API_KEY from Deno.env
    - Convert Uint8Array to base64
    - Make POST request to Media API
    - Handle success and error responses
    - _Requirements: 4.1, 4.2, 5.5_

  - [x] 7.2 Update whatsapp-nutrition-webhook to use external storage
    - Replace Supabase Storage upload with external media upload
    - Use 'whatsapp' folder for organization
    - Pass userId for path structure
    - Store MinIO URL in database on success
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [x] 7.3 Implement graceful degradation for WhatsApp uploads
    - Log errors when Media API is unavailable
    - Continue processing message without image
    - Do not fail the entire webhook on upload failure
    - _Requirements: 4.3_

  - [ ]* 7.4 Write unit tests for WhatsApp image handler
    - Test successful upload flow
    - Test graceful degradation on API failure
    - Test error logging
    - _Requirements: 4.1, 4.3_

- [x] 8. Checkpoint - Verify integrations
  - Test community feed upload end-to-end
  - Test story upload end-to-end
  - Test WhatsApp image upload (if possible)
  - Verify URLs work in existing components
  - Ask the user if questions arise

- [x] 9. Configure environment variables
  - [x] 9.1 Update frontend environment configuration
    - Add VITE_MEDIA_API_URL to .env.example
    - Document required environment variables
    - _Requirements: 5.1, 5.4_

  - [x] 9.2 Configure Supabase Edge Function secrets
    - Document MEDIA_API_URL secret requirement
    - Document optional MEDIA_API_KEY secret
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 9.3 Verify retained buckets are not affected
    - Confirm medical-documents uses Supabase Storage
    - Confirm avatars uses Supabase Storage
    - Confirm medical-documents-reports uses Supabase Storage
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 10. Documentation and final verification
  - [x] 10.1 Update GUIA_MINIO_STORAGE.md with implementation details
    - Document API endpoints and request/response formats
    - Document environment variable configuration
    - Document which buckets are migrated vs retained
    - _Requirements: 6.5_

  - [x] 10.2 Add error handling documentation
    - Document client-side error codes and messages
    - Document server-side error codes and HTTP statuses
    - _Requirements: 1.3, 2.5_

- [x] 11. Final checkpoint - Complete verification
  - Run all property tests
  - Run all unit tests
  - Verify all integrations work end-to-end
  - Verify documentation is complete
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The VPS infrastructure (MinIO + Media API) must be set up before client integration
- Sensitive data buckets (medical-documents, avatars) are NOT migrated
