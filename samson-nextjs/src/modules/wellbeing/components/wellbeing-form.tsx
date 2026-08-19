'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/feedback/toast-container';
import { submitWellbeingAction } from '../actions/submit-wellbeing.action';

const MOOD_OPTIONS = [
  { value: 'FEELING_GREAT', emoji: '😊', label: 'Feeling Great', description: 'No pain, recovering well' },
  { value: 'OKAY', emoji: '🙂', label: 'Okay', description: 'Mild discomfort, manageable' },
  { value: 'NOT_SO_GOOD', emoji: '😟', label: 'Not So Good', description: 'Experiencing unexpected pain or symptoms' },
] as const;

type MoodValue = (typeof MOOD_OPTIONS)[number]['value'];

const SYMPTOM_OPTIONS = ['Moderate-to-severe pain', 'Swelling', 'Bleeding', 'Fever', 'Nausea'] as const;

export function WellbeingForm({
  appointmentId,
  patientName,
  clinicPhone,
  clinicLandline,
}: {
  appointmentId: string;
  patientName: string;
  clinicPhone?: string | null;
  clinicLandline?: string | null;
}) {
  const { addToast } = useToast();
  const [feeling, setFeeling] = useState<MoodValue | null>(null);
  const [noteGreat, setNoteGreat] = useState('');
  const [noteConcern, setNoteConcern] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [callBack, setCallBack] = useState<'YES' | 'NO' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const note = feeling === 'FEELING_GREAT' ? noteGreat : noteConcern;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!feeling) {
      const message = 'Please tell us how you are feeling.';
      setFormError(message);
      addToast(message, 'error');
      return;
    }
    setIsSubmitting(true);
    const result = await submitWellbeingAction({
      appointmentId,
      feeling,
      note,
      symptoms: symptoms.length ? symptoms : undefined,
      callBack: callBack ?? undefined,
    });
    setIsSubmitting(false);
    if (!result.success) {
      addToast(result.error, 'error');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">Thank you for letting us know!</h2>
          <p className="text-sm text-gray-700 max-w-md">
            {patientName}, your response has been received. If you need anything, call or text us
            {clinicPhone ? <> at <strong className="font-semibold text-gray-900">{clinicPhone}</strong></> : ''}.
          </p>
        </div>
        <Button
          onClick={() => window.location.assign('/')}
          className="w-full max-w-[280px] bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background"
        >
          Go to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-muted text-text-secondary flex items-center justify-center">
          <HeartHandshake className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Hello, {patientName}!</h1>
          <p className="text-sm text-text-muted max-w-md">
            It&apos;s been 2 days since your visit — we hope your recovery is going well.
          </p>
          <p className="text-sm text-text-muted max-w-md">
            Take 30 seconds to let us know how you&apos;re feeling today.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-semibold text-text-primary">How are you feeling today?</label>
          <div className="grid grid-cols-3 gap-3 w-full" role="radiogroup" aria-label="How are you feeling">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={feeling === option.value}
                onClick={() => {
                  setFeeling(option.value);
                  setFormError(null);
                }}
                className={`cursor-pointer flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-semibold transition-colors ${
                  feeling === option.value
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-card text-text-secondary border-card-border hover:border-teal-500/50 hover:text-text-primary'
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span>{option.label}</span>
                <span className={`text-xs font-normal ${feeling === option.value ? 'text-white/70' : 'text-text-muted'}`}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
          {formError && !feeling && (
            <p className="text-xs text-red-500 font-medium">{formError}</p>
          )}
        </div>

        {feeling === 'FEELING_GREAT' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-teal-200 dark:border-teal-500/20 bg-teal-50 dark:bg-teal-500/10 p-4 text-sm text-teal-900 dark:text-teal-100">
              That&apos;s great to hear! Happy you&apos;re feeling good.
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">
                Any questions or notes for your doctor? <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <Textarea
                value={noteGreat}
                onChange={(e) => setNoteGreat(e.target.value)}
                placeholder="Anything we can help with?"
                rows={4}
                maxLength={2000}
              />
            </div>
          </div>
        )}

        {(feeling === 'OKAY' || feeling === 'NOT_SO_GOOD') && (
          <div className="flex flex-col gap-4">
            {feeling === 'OKAY' ? (
              <div className="rounded-2xl border border-teal-200 dark:border-teal-500/20 bg-teal-50 dark:bg-teal-500/10 p-4 text-sm text-teal-900 dark:text-teal-100">
                Mild discomfort can be normal after a procedure.
              </div>
            ) : (
              <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-100">
                Sorry you&apos;re not feeling well — your safety is our priority.
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">
                What symptoms are you experiencing? <span className="font-normal text-text-muted">Select all that apply</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      setSymptoms((prev) =>
                        prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
                      )
                    }
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      symptoms.includes(symptom)
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-card text-text-secondary border-card-border hover:border-teal-500/50 hover:text-text-primary'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">
                Please describe what you are feeling in detail: <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <Textarea
                value={noteConcern}
                onChange={(e) => setNoteConcern(e.target.value)}
                placeholder="Tell us more about what you're experiencing..."
                rows={4}
                maxLength={2000}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">
                Would you like our clinic staff or doctor to call you back today?
              </label>
              <div className="flex gap-2">
                {[
                  { v: 'YES' as const, label: 'Yes, as soon as possible' },
                  { v: 'NO' as const, label: 'No, just logging my update' },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setCallBack(opt.v)}
                    className={`cursor-pointer flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      callBack === opt.v
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-card text-text-secondary border-card-border hover:border-teal-500/50 hover:text-text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>

        <div className="rounded-2xl border border-card-border bg-card p-4">
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="font-semibold text-text-primary">Emergency?</span> If you&apos;re experiencing uncontrolled
            bleeding, difficulty breathing, or another severe emergency, don&apos;t wait for a form response —{' '}
            {clinicPhone || clinicLandline ? (
              <>
                call us at{' '}
                <strong className="font-semibold text-text-primary">{clinicPhone || clinicLandline}</strong>
                {clinicPhone && clinicLandline && (
                  <>
                    {' '}or <strong className="font-semibold text-text-primary">{clinicLandline}</strong>
                  </>
                )}{' '}
                or visit the nearest emergency room.
              </>
            ) : (
              <>
                call us or visit the nearest emergency room.{' '}
                <Link href="/contact" className="font-semibold text-text-primary underline">
                  Contact the clinic
                </Link>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}