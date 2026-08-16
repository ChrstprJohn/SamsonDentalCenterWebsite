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

const SYMPTOM_OPTIONS = ['Moderate-to-severe pain', 'Swelling', 'Bleeding', 'Fever', 'Nausea', 'Other'] as const;

const CONCERN_CHIPS = ['Pain', 'Swelling', 'Bleeding', 'Fever', 'Nausea', 'Medication question', 'Other'] as const;

function toggleChip(chip: string, current: string): string {
  const parts = current.split(', ').filter(Boolean);
  const idx = parts.indexOf(chip);
  if (idx === -1) {
    parts.unshift(chip);
  } else {
    parts.splice(idx, 1);
  }
  return parts.join(', ');
}

function ConcernChips({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const active = value.split(', ');
  return (
    <div className="flex flex-wrap gap-2">
      {CONCERN_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onChange(toggleChip(chip, value))}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            active.includes(chip)
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-card text-text-secondary border-card-border hover:border-teal-500/50 hover:text-text-primary'
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function YesNoPicker({ value, onChange }: { value: boolean | null; onChange: (value: boolean) => void }) {
  return (
    <div className="flex gap-2" role="radiogroup">
      {[{ v: true, label: 'Yes' }, { v: false, label: 'No' }].map((opt) => (
        <button
          key={opt.label}
          type="button"
          role="radio"
          aria-checked={value === opt.v}
          onClick={() => onChange(opt.v)}
          className={`cursor-pointer flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            value === opt.v
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-card text-text-secondary border-card-border hover:border-teal-500/50 hover:text-text-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function WellbeingForm({
  appointmentId,
  patientName,
  clinicPhone,
}: {
  appointmentId: string;
  patientName: string;
  clinicPhone?: string | null;
}) {
  const { addToast } = useToast();
  const [feeling, setFeeling] = useState<MoodValue | null>(null);
  const [noteGreat, setNoteGreat] = useState('');
  const [noteOkay, setNoteOkay] = useState('');
  const [noteBad, setNoteBad] = useState('');
  const [medsTaken, setMedsTaken] = useState<boolean | null>(null);
  const [medsManageable, setMedsManageable] = useState<boolean | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [callBack, setCallBack] = useState<'YES' | 'NO' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const note = feeling === 'FEELING_GREAT' ? noteGreat : feeling === 'OKAY' ? noteOkay : noteBad;

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
      medsTaken: medsTaken ?? undefined,
      medsManageable: medsManageable ?? undefined,
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
            {patientName}, your response has been received. If you need anything, please don&apos;t hesitate to call or text us.
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
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Kamusta, {patientName}?</h1>
          <p className="text-sm text-text-muted max-w-md">
            It&apos;s been 2 days since your visit at our clinic. We hope your recovery is going smoothly!
          </p>
          <p className="text-sm text-text-muted max-w-md">
            Your comfort and wellbeing matter to us. Please take 30 seconds to let us know how you are feeling today.
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
              That&apos;s wonderful news! We&apos;re happy to hear you&apos;re feeling good.
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
              <ConcernChips value={noteGreat} onChange={setNoteGreat} />
            </div>
          </div>
        )}

        {feeling === 'OKAY' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-teal-200 dark:border-teal-500/20 bg-teal-50 dark:bg-teal-500/10 p-4 text-sm text-teal-900 dark:text-teal-100">
              Some mild discomfort can be normal after a procedure, but we want to make sure you stay comfortable.
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Are you currently taking your prescribed medications?</label>
              <YesNoPicker value={medsTaken} onChange={setMedsTaken} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Is the discomfort manageable with medication?</label>
              <YesNoPicker value={medsManageable} onChange={setMedsManageable} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">
                Any specific concerns or questions? <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <Textarea
                value={noteOkay}
                onChange={(e) => setNoteOkay(e.target.value)}
                placeholder="Tell us anything we should know..."
                rows={4}
                maxLength={2000}
              />
              <ConcernChips value={noteOkay} onChange={setNoteOkay} />
            </div>
          </div>
        )}

        {feeling === 'NOT_SO_GOOD' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-100">
              We&apos;re sorry to hear you&apos;re not feeling well. Your safety is our priority.
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">What symptoms are you experiencing?</label>
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
                value={noteBad}
                onChange={(e) => setNoteBad(e.target.value)}
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
            <span className="font-semibold text-text-primary">Important Note:</span> If you are experiencing a severe medical
            emergency, sudden uncontrolled bleeding, or difficulty breathing, please do not wait for a form response.{' '}
            {clinicPhone ? (
              <>
                Contact our clinic directly at <strong className="font-semibold text-text-primary">{clinicPhone}</strong> or
                visit the nearest emergency room immediately.
              </>
            ) : (
              <>
                Contact our clinic directly or visit the nearest emergency room immediately.{' '}
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