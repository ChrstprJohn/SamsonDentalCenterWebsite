'use client';

import React, { useMemo, useState } from 'react';
import { Select } from '@/components/ui/select';
import {
  DEFAULT_COPY,
  DEFAULT_SAMPLE_DATA,
  DEFAULT_TOKENS,
  DynamicDataControls,
  EMAIL_DESIGNS,
  EmailDesignDefinition,
  EmailDesignId,
  EmailDesignPreview,
  EmailPreviewHeader,
  EmailTemplateSelector,
  PreviewMode,
  SampleData,
} from './sub-components/email-design-studio';

export function SecretaryEmailDesignStudioView() {
  const [activeId, setActiveId] = useState<EmailDesignId>('appointment-confirmed');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [sample, setSample] = useState<SampleData>(DEFAULT_SAMPLE_DATA);

  const activeDesign = EMAIL_DESIGNS.find((design) => design.id === activeId) || EMAIL_DESIGNS[0];
  const activeCopy = DEFAULT_COPY[activeId];
  const visibleFields = useMemo(() => new Set(activeDesign.fields), [activeDesign]);

  const groupedDesigns = useMemo(
    () =>
      EMAIL_DESIGNS.reduce<Record<string, EmailDesignDefinition[]>>((groups, design) => {
        groups[design.category] = [...(groups[design.category] || []), design];
        return groups;
      }, {}),
    []
  );

  const updateSampleField = <K extends keyof SampleData>(key: K, value: SampleData[K]) => {
    setSample((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (presetData: SampleData) => {
    setSample(presetData);
  };

  const clearAllFields = () => {
    setSample({
      patientName: '',
      serviceName: '',
      doctorName: '',
      dateStr: '',
      timeRangeStr: '',
      appointmentId: '',
      baseUrl: 'http://localhost:3000',
      rejectionReason: '',
      cancellationReason: '',
    });
  };

  return (
    <div className="grid h-full min-h-0 flex-1 grid-cols-1 overflow-hidden bg-background xl:grid-cols-[350px_minmax(0,1fr)_320px]">
      {/* Left Sidebar: Email Template Selector */}
      <EmailTemplateSelector
        groupedDesigns={groupedDesigns}
        activeId={activeId}
        onSelectDesign={setActiveId}
      />

      {/* Center Main: Live Email Preview */}
      <main className="flex h-full min-h-0 flex-col bg-background overflow-hidden">
        <EmailPreviewHeader
          subject={activeCopy.subject}
          designLabel={activeDesign.label}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
        />

        <div
          data-lenis-prevent
          style={{ scrollbarWidth: 'thin' }}
          className="flex-1 min-h-0 !overflow-y-auto bg-background p-4 md:p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <div className="pb-4 xl:hidden">
            <Select
              label="Email template"
              value={activeId}
              onChange={(event) => setActiveId(event.target.value as EmailDesignId)}
              options={EMAIL_DESIGNS.map((email) => ({ value: email.id, label: email.label }))}
            />
          </div>

          <div
            className="mx-auto transition-all duration-300 bg-white"
            style={{ width: previewMode === 'mobile' ? 375 : '100%', maxWidth: previewMode === 'mobile' ? 375 : 680 }}
          >
            <EmailDesignPreview design={activeDesign} tokens={DEFAULT_TOKENS} copy={activeCopy} sample={sample} />
          </div>
        </div>
      </main>

      {/* Right Sidebar: Dynamic Data Controls */}
      <DynamicDataControls
        sample={sample}
        visibleFields={visibleFields}
        onUpdateField={updateSampleField}
        onApplyPreset={applyPreset}
        onClearAll={clearAllFields}
      />
    </div>
  );
}

export default SecretaryEmailDesignStudioView;
