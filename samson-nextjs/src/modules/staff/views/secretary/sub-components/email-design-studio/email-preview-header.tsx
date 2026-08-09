import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { PreviewMode } from './types';

export interface EmailPreviewHeaderProps {
  subject: string;
  preheader?: string;
  designLabel: string;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
}

export function EmailPreviewHeader({
  subject,
  preheader,
  designLabel,
  previewMode,
  onPreviewModeChange,
}: EmailPreviewHeaderProps) {
  return (
    <div className="flex h-auto min-h-[61px] items-center justify-between gap-3 bg-background border-b border-border px-4 py-2.5 shrink-0">
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
    </div>
  );
}
