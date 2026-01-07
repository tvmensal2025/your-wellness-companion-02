import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkPreviewProps {
  url: string;
  className?: string;
}

interface LinkMetadata {
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

// Simple URL detection regex
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

// Extract URLs from text
export const extractUrls = (text: string): string[] => {
  const matches = text.match(URL_REGEX);
  return matches || [];
};

// Get domain from URL
const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Simple metadata fetcher (client-side fallback)
const fetchLinkMetadata = async (url: string): Promise<LinkMetadata | null> => {
  try {
    // For now, we'll use a simple approach - in production, this should use an edge function
    // to properly scrape metadata and avoid CORS issues
    const domain = getDomain(url);
    
    // Return basic metadata based on URL
    return {
      title: domain,
      description: url,
      siteName: domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    };
  } catch {
    return null;
  }
};

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, className = '' }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoading(true);
      setHasError(false);
      
      const data = await fetchLinkMetadata(url);
      if (data) {
        setMetadata(data);
      } else {
        setHasError(true);
      }
      setIsLoading(false);
    };

    loadMetadata();
  }, [url]);

  if (hasError) {
    return null;
  }

  const domain = getDomain(url);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'block rounded-xl border border-border/50 overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors',
        className
      )}
    >
      <div className="flex">
        {/* Image placeholder */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted flex items-center justify-center flex-shrink-0">
          {metadata?.image ? (
            <img 
              src={metadata.image} 
              alt={metadata.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-8 h-8 text-muted-foreground/50" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                {metadata?.favicon && (
                  <img 
                    src={metadata.favicon} 
                    alt="" 
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {domain}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </div>
              
              <h4 className="font-medium text-sm text-foreground line-clamp-1 mb-1">
                {metadata?.title || domain}
              </h4>
              
              {metadata?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {metadata.description}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </motion.a>
  );
};

// Component to render text with clickable links
export const TextWithLinks: React.FC<{ 
  text: string; 
  showPreview?: boolean;
  className?: string;
}> = ({ text, showPreview = true, className = '' }) => {
  const urls = extractUrls(text);
  const firstUrl = urls[0];

  // Replace URLs with clickable links
  const renderTextWithLinks = () => {
    const parts = text.split(URL_REGEX);
    
    return parts.map((part, index) => {
      if (URL_REGEX.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap">{renderTextWithLinks()}</p>
      
      {/* Show preview for first URL */}
      {showPreview && firstUrl && (
        <div className="mt-3">
          <LinkPreview url={firstUrl} />
        </div>
      )}
    </div>
  );
};
