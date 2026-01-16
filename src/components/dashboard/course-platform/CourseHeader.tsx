import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { AdminEditControls, AdminViewToggle } from "@/components/admin/AdminEditControls";

/**
 * Dashboard settings for the course platform banner
 */
export interface DashboardSettings {
  banner_title: string;
  banner_subtitle: string;
  banner_image_url: string;
}

/**
 * View mode for the dashboard content display
 */
export type DashboardViewMode = 'courses' | 'modules' | 'lessons';

/**
 * Props for the CourseHeader component
 */
export interface CourseHeaderProps {
  /** Whether the current user is an admin */
  isAdmin: boolean;
  /** Whether admin mode is currently enabled */
  adminModeEnabled: boolean;
  /** Function to toggle admin mode on/off */
  toggleAdminMode: () => void;
  /** Current view mode for the dashboard */
  dashboardViewMode: DashboardViewMode;
  /** Function to change the view mode */
  setDashboardViewMode: (mode: DashboardViewMode) => void;
  /** Function to save the view mode to the database */
  saveViewMode: (mode: DashboardViewMode) => Promise<void>;
  /** Banner settings from the database */
  bannerSettings: DashboardSettings;
  /** Function to handle saving banner edits */
  onSaveBannerEdit: (data: Record<string, unknown>) => Promise<void>;
}

/**
 * CourseHeader component - Displays the hero banner and admin controls
 * for the Netflix-style course platform.
 * 
 * Features:
 * - Cinematic hero banner with customizable background
 * - Admin mode toggle button
 * - View mode toggle (courses/modules/lessons) for admins
 * - Editable banner title and subtitle
 * 
 * @example
 * ```tsx
 * <CourseHeader
 *   isAdmin={true}
 *   adminModeEnabled={false}
 *   toggleAdminMode={() => setAdminMode(!adminMode)}
 *   dashboardViewMode="courses"
 *   setDashboardViewMode={setViewMode}
 *   saveViewMode={handleSaveViewMode}
 *   bannerSettings={settings}
 *   onSaveBannerEdit={handleSaveEdit}
 * />
 * ```
 */
export const CourseHeader: React.FC<CourseHeaderProps> = ({
  isAdmin,
  adminModeEnabled,
  toggleAdminMode,
  dashboardViewMode,
  setDashboardViewMode,
  saveViewMode,
  bannerSettings,
  onSaveBannerEdit,
}) => {
  return (
    <>
      {/* Admin Mode Toggle Button */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={toggleAdminMode}
            className={`${
              adminModeEnabled 
                ? 'bg-destructive hover:bg-destructive/90' 
                : 'bg-card/80 backdrop-blur-md hover:bg-card border border-border'
            } transition-all duration-300`}
          >
            <Shield className="h-4 w-4 mr-2" />
            {adminModeEnabled ? 'Sair Admin' : 'Modo Admin'}
          </Button>
        </div>
      )}

      {/* View Mode Toggle - Admin Only */}
      {isAdmin && adminModeEnabled && (
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 pt-4">
          <AdminViewToggle 
            viewMode={dashboardViewMode} 
            onToggle={setDashboardViewMode}
            onSave={saveViewMode}
          />
        </div>
      )}

      {/* Hero Banner - Netflix Cinematic Style */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[55vh]">
        {adminModeEnabled && (
          <AdminEditControls type="banner" onSave={onSaveBannerEdit} />
        )}
        
        {/* Background with cinematic gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${bannerSettings.banner_image_url})`
          }}
        >
          {/* Overlapping gradients - Netflix style - stronger to cover image text */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />
        </div>

        {/* Hero Content - Simple and Clean */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-2xl">
            {adminModeEnabled && (
              <Badge className="mb-3 bg-destructive text-destructive-foreground px-3 py-1">
                MODO ADMINISTRADOR
              </Badge>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 drop-shadow-2xl text-foreground">
              {bannerSettings.banner_title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl">
              {bannerSettings.banner_subtitle}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseHeader;
