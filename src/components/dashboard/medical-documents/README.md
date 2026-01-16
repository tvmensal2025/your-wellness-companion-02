# Medical Documents Section - Refactored

## Overview

This directory contains the refactored components extracted from `MedicalDocumentsSection.tsx` (originally 1209 lines). The component has been split into smaller, focused components for better maintainability.

## Structure

```
medical-documents/
├── DocumentStatsCards.tsx   # Statistics cards for documents overview
├── DocumentFilters.tsx      # Search and filter controls
├── DocumentCard.tsx         # Individual document card component
├── DocumentUploadModal.tsx  # Upload modal for new documents
├── DocumentList.tsx         # List of documents with loading states
└── README.md                # This file
```

## Components

### DocumentStatsCards
Displays statistics cards showing:
- Total Documents
- Health Score
- Critical Alerts
- Upcoming Exams

**Props:**
- `stats`: DocumentStats object with counts and metrics

### DocumentFilters
Provides search and filter functionality for documents.

**Props:**
- `searchTerm`: Current search term
- `filterType`: Current filter type
- `onSearchChange`: Callback for search term changes
- `onFilterChange`: Callback for filter type changes

### DocumentCard
Displays an individual medical document with actions.

**Props:**
- `document`: MedicalDocument object
- `onViewReport`: Callback to view analysis report
- `onDownloadPdf`: Callback to download as PDF
- `onDownloadPng`: Callback to download as PNG
- `onDelete`: Callback to delete document
- `onTriggerAnalysis`: Callback to trigger analysis
- `onRestartAnalysis`: Callback to restart analysis

### DocumentUploadModal
Modal for uploading new medical documents.

**Props:**
- `open`: Whether modal is open
- `onClose`: Callback to close modal
- `onUpload`: Callback to handle file upload
- `uploading`: Whether upload is in progress

### DocumentList
Displays a list of documents with loading and empty states.

**Props:**
- `documents`: Array of MedicalDocument objects
- `loading`: Loading state
- `onViewReport`: Callback to view report
- `onDownloadPdf`: Callback to download PDF
- `onDownloadPng`: Callback to download PNG
- `onDelete`: Callback to delete document
- `onTriggerAnalysis`: Callback to trigger analysis
- `onRestartAnalysis`: Callback to restart analysis

## Usage

```tsx
import { DocumentStatsCards } from './medical-documents/DocumentStatsCards';
import { DocumentFilters } from './medical-documents/DocumentFilters';
import { DocumentCard } from './medical-documents/DocumentCard';

function MedicalDocuments() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  return (
    <div>
      {stats && <DocumentStatsCards stats={stats} />}
      
      <DocumentFilters
        searchTerm={searchTerm}
        filterType={filterType}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterType}
      />
      
      <div className="space-y-4">
        {documents.map(doc => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onView={handleView}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onViewReport={handleViewReport}
          />
        ))}
      </div>
    </div>
  );
}
```

## Benefits

1. **Reduced Complexity**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Testability**: Easier to test individual components
4. **Maintainability**: Smaller files are easier to understand and modify
5. **Responsive Design**: All components are mobile-friendly

## Features

- **Document Types**: Supports various medical document types (lab exams, imaging, reports, prescriptions)
- **Status Indicators**: Visual badges for document status (normal, altered, critical, pending)
- **Search & Filter**: Quick search and type-based filtering
- **Actions**: View, download, delete, and view analysis reports
- **Statistics**: Overview cards with key metrics

## Requirements Satisfied

- ✅ Requirement 1.10: Divide MedicalDocumentsSection into separate sections
- ✅ Component size < 500 lines per file
- ✅ Improved code organization
- ✅ Better separation of concerns

## Note

The original `MedicalDocumentsSection.tsx` file remains intact. To use the refactored components, import them from this directory and integrate them into the main component gradually.
