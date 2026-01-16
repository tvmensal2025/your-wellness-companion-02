# Requirements Document

## Introduction

This document specifies the requirements for migrating media storage from Supabase Storage to a self-hosted MinIO instance on a VPS. The MaxNutrition application currently stores images (WhatsApp chat images, community feed/stories, food analysis images) in Supabase Storage buckets. This migration aims to reduce costs, eliminate platform storage limits, and provide greater control over media assets while maintaining seamless integration with the existing Lovable/Supabase-based application.

## Glossary

- **Media_API**: The Node.js REST API service running on the VPS that handles file uploads and returns public URLs
- **MinIO**: S3-compatible object storage server running on the VPS
- **External_Storage_Client**: The TypeScript library (`src/lib/externalMedia.ts`) that abstracts upload operations to the VPS
- **Upload_Result**: The response object containing the public URL, path, size, and MIME type of an uploaded file
- **Media_Folder**: A logical folder within the MinIO bucket (whatsapp, feed, stories, profiles)
- **Supabase_Storage**: The current cloud storage service provided by Supabase (to be replaced for high-volume buckets)

## Requirements

### Requirement 1: External Storage Client Library

**User Story:** As a developer, I want a centralized library for uploading media to external storage, so that I can easily migrate existing upload code without duplicating logic.

#### Acceptance Criteria

1. THE External_Storage_Client SHALL export an `uploadToExternalStorage` function that accepts file data, folder type, and optional filename
2. WHEN a file is uploaded successfully, THE External_Storage_Client SHALL return an Upload_Result containing publicUrl, path, size, and mimeType
3. WHEN the Media_API is unavailable, THE External_Storage_Client SHALL throw a descriptive error with the HTTP status code
4. THE External_Storage_Client SHALL support both base64-encoded strings and File/Blob objects as input
5. THE External_Storage_Client SHALL validate file type against allowed MIME types before uploading
6. THE External_Storage_Client SHALL validate file size against configurable maximum (default 50MB)
7. WHEN validation fails, THE External_Storage_Client SHALL return a validation error without making a network request

### Requirement 2: Media API Interface

**User Story:** As a developer, I want a well-defined API contract for the VPS upload endpoint, so that frontend and backend implementations remain consistent.

#### Acceptance Criteria

1. THE Media_API SHALL accept POST requests to `/upload` endpoint with multipart/form-data or JSON body
2. WHEN receiving a JSON body, THE Media_API SHALL accept `{ file: string (base64), folder: string, filename?: string }`
3. WHEN receiving multipart/form-data, THE Media_API SHALL accept a `file` field with binary data and `folder` field
4. THE Media_API SHALL return `{ success: true, url: string, path: string, size: number, mimeType: string }` on success
5. WHEN an error occurs, THE Media_API SHALL return `{ success: false, error: string }` with appropriate HTTP status code
6. THE Media_API SHALL generate unique filenames using UUID when filename is not provided
7. THE Media_API SHALL organize files in MinIO using the pattern `images/{folder}/{uuid}.{extension}`

### Requirement 3: Community Media Migration

**User Story:** As a user, I want to upload feed posts and stories without interruption, so that my social experience remains seamless after the migration.

#### Acceptance Criteria

1. WHEN a user uploads media for a feed post, THE System SHALL send the file to the Media_API instead of Supabase Storage
2. WHEN a user uploads media for a story, THE System SHALL send the file to the Media_API instead of Supabase Storage
3. THE System SHALL maintain the same validation rules (file type, size limits) as the current implementation
4. WHEN upload succeeds, THE System SHALL return the public MinIO URL to the calling component
5. THE System SHALL preserve backward compatibility with existing components that consume media URLs
6. IF the Media_API fails, THEN THE System SHALL display a user-friendly error message

### Requirement 4: WhatsApp Image Migration

**User Story:** As a system administrator, I want WhatsApp images stored on our VPS, so that we reduce Supabase storage costs for high-volume chat images.

#### Acceptance Criteria

1. WHEN a WhatsApp webhook receives an image, THE Edge_Function SHALL upload it to the Media_API instead of Supabase Storage
2. THE Edge_Function SHALL use the `whatsapp` folder for organizing WhatsApp images
3. WHEN the Media_API is unavailable, THE Edge_Function SHALL log the error and continue processing the message without the image
4. THE Edge_Function SHALL pass the user ID to maintain the existing path structure (`whatsapp/{userId}/{timestamp}.{ext}`)
5. WHEN upload succeeds, THE Edge_Function SHALL store the MinIO public URL in the database

### Requirement 5: Environment Configuration

**User Story:** As a DevOps engineer, I want configurable environment variables for the media service, so that I can easily switch between environments and update endpoints.

#### Acceptance Criteria

1. THE System SHALL read `MEDIA_API_URL` environment variable for the VPS API endpoint
2. THE System SHALL read `MEDIA_API_KEY` environment variable for optional authentication
3. WHEN `MEDIA_API_URL` is not set, THE External_Storage_Client SHALL throw a configuration error
4. THE System SHALL support different configurations for development and production environments
5. THE Edge_Functions SHALL read environment variables using `Deno.env.get()`

### Requirement 6: Sensitive Data Retention

**User Story:** As a compliance officer, I want medical documents and avatars to remain in Supabase, so that sensitive data stays within our established security perimeter.

#### Acceptance Criteria

1. THE System SHALL NOT migrate the `medical-documents` bucket to external storage
2. THE System SHALL NOT migrate the `avatars` bucket to external storage
3. THE System SHALL NOT migrate the `medical-documents-reports` bucket to external storage
4. WHEN uploading to retained buckets, THE System SHALL continue using the existing Supabase Storage implementation
5. THE documentation SHALL clearly specify which buckets are migrated and which are retained

### Requirement 7: File Type and Size Validation

**User Story:** As a security engineer, I want strict validation of uploaded files, so that malicious or oversized files are rejected before reaching storage.

#### Acceptance Criteria

1. THE External_Storage_Client SHALL accept only these MIME types: image/jpeg, image/png, image/gif, image/webp, video/mp4, video/quicktime, video/webm
2. THE External_Storage_Client SHALL reject files larger than the configured maximum size (default 50MB)
3. WHEN a file type is invalid, THE External_Storage_Client SHALL return error "Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM."
4. WHEN a file is too large, THE External_Storage_Client SHALL return error "Arquivo muito grande. Máximo {maxSize}MB."
5. THE Media_API SHALL perform server-side validation matching the client-side rules

### Requirement 8: URL Compatibility

**User Story:** As a frontend developer, I want MinIO URLs to work seamlessly with existing components, so that I don't need to modify image display logic.

#### Acceptance Criteria

1. THE Media_API SHALL return publicly accessible URLs that can be used directly in `<img>` and `<video>` tags
2. THE MinIO URLs SHALL support CORS for browser-based access
3. THE System SHALL NOT require authentication to read public media URLs
4. WHEN displaying media, THE existing components SHALL work without modification using the new URLs
