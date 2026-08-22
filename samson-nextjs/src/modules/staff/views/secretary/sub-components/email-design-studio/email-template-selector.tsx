import React from 'react';
import { ChevronRight, Mail } from 'lucide-react';
import { EmailDesignDefinition, EmailDesignId } from './types';

export interface EmailTemplateSelectorProps {
  groupedDesigns: Record<string, EmailDesignDefinition[]>;
  activeId: EmailDesignId;
  onSelectDesign: (id: EmailDesignId) => void;
}

export function EmailTemplateSelector({
  groupedDesigns,
  activeId,
  onSelectDesign,
}: EmailTemplateSelectorProps) {
  return (
    <aside className="hidden h-full min-h-0 flex-col border-r border-border bg-sidebar xl:flex overflow-hidden">
      <div className="flex h-[61px] items-center border-b border-border p-4 shrink-0 bg-sidebar">
        <div>
          <div className="text-base font-medium text-foreground">Email Templates</div>
          <p className="text-[11px] text-muted-foreground">Select an email notification to preview</p>
        </div>
      </div>
      <div
        data-lenis-prevent
        style={{ scrollbarWidth: 'thin' }}
        className="flex-1 min-h-0 !overflow-y-auto space-y-4 p-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {Object.entries(groupedDesigns).filter(([category]) => category !== 'Conversation').map(([category, designs]) => (
          <div key={category}>
            <div className="px-1 pb-2 text-[11px] font-semibold text-muted-foreground">{category}</div>
            <div className="space-y-2">
              {designs.map((design) => {
                const active = design.id === activeId;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => onSelectDesign(design.id)}
                    className={`group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      active
                        ? 'border-primary/40 bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                        : 'border-border/50 bg-background text-foreground hover:border-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{design.label}</span>
                        <span className="block truncate text-[11px] text-muted-foreground mt-0.5">{design.description}</span>
                      </div>
                    </div>
                    <ChevronRight className={`size-4 shrink-0 transition-transform ${active ? 'translate-x-0.5 text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
