import React from 'react';
import { Monitor, Moon, Smartphone, Sun } from 'lucide-react';
import { EmailThemeMode, PreviewMode } from './types';

export interface EmailPreviewHeaderProps {
  subject: string;
  preheader?: string;
  designLabel: string;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  themeMode: EmailThemeMode;
  onThemeModeChange: (mode: EmailThemeMode) => void;
}

export function EmailPreviewHeader({
  subject,
  preheader,
  designLabel,
  previewMode,
  onPreviewModeChange,
  themeMode,
  onThemeModeChange,
}: EmailPreviewHeaderProps) {
  return (
    <div className="flex h-auto min-h-[61px] items-center justify-between gap-3 bg-background border-b border-border px-4 py-2.5 shrink-0 flex-wrap sm:flex-nowrap">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground truncate">{subject}</div>
        {preheader ? (
          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
            <span className="font-medium text-foreground/75">Snippet:</span> {preheader}
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground truncate block mt-0.5">{designLabel}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Device toggle */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-muted/30 p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onPreviewModeChange('desktop')}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
              previewMode === 'desktop'
                ? 'bg-foreground text-background shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            }`}
          >
            <Monitor className="mr-1.5 size-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onPreviewModeChange('mobile')}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
              previewMode === 'mobile'
                ? 'bg-foreground text-background shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            }`}
          >
            <Smartphone className="mr-1.5 size-3.5" />
            Mobile
          </button>
        </div>

        {/* Email Theme Mode toggle (Light / Dark) */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-muted/30 p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onThemeModeChange('light')}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
              themeMode === 'light'
                ? 'bg-foreground text-background shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            }`}
            title="Preview email in light mode"
          >
            <Sun className="mr-1.5 size-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => onThemeModeChange('dark')}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
              themeMode === 'dark'
                ? 'bg-foreground text-background shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            }`}
            title="Preview email in dark mode"
          >
            <Moon className="mr-1.5 size-3.5" />
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
