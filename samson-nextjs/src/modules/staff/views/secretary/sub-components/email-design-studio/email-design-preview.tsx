import React from 'react';
import { EmailBranding, resolveEmailBranding } from '@/components/emails/email-branding';
import { formatRefId } from '@/shared/utils/date.util';
import {
  DesignTokens,
  DraftCopy,
  EmailDesignDefinition,
  SampleData,
} from './types';

const p: React.CSSProperties = { margin: '0 0 16px', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 };
const bold: React.CSSProperties = { fontWeight: 700 };
const link: React.CSSProperties = { color: '#2563eb', textDecoration: 'underline', fontWeight: 600 };
const muted: React.CSSProperties = { color: '#64748b', fontSize: 12, lineHeight: 1.6 };

export interface EmailDesignPreviewProps {
  design: EmailDesignDefinition;
  tokens: DesignTokens;
  copy: DraftCopy;
  sample: SampleData;
  branding?: EmailBranding;
}

export function EmailDesignPreview({
  design,
  tokens,
  copy,
  sample,
  branding,
}: EmailDesignPreviewProps) {
  const isCancelled = design.id === 'cancelled';
  const isConfirmed = design.id === 'appointment-confirmed';
  const isReminder = design.id === 'reminder-24h' || design.id === 'reminder-48h';
  const isRescheduled = design.id === 'rescheduled';
  const isPostCare = design.id === 'post-care';
  const isNoShow = design.id === 'no-show';
  const isStaffReply = design.id === 'staff-reply';
  const isBookingRequestReceived = design.id === 'booking-request-received';
  const isRequestRejected = design.id === 'request-rejected';
  const baseUrl = sample.baseUrl || 'http://localhost:3000';
  const b = branding ?? resolveEmailBranding(undefined, baseUrl);
  const chatUrl = `${baseUrl}/manage?token=${sample.appointmentId || 'APT-SAMPLE'}&openChat=true`;
  const feedbackUrl = `${baseUrl}/feedback?ref=${sample.appointmentId || 'APT-SAMPLE'}`;
  const noShowReasonUrl = `${baseUrl}/no-show-reason?ref=${sample.appointmentId || 'APT-SAMPLE'}`;
  const ctaHref = isPostCare ? feedbackUrl : isNoShow ? noShowReasonUrl : chatUrl;
  const referenceCode = sample.referenceCode || formatRefId(sample.appointmentId);

  const statusLabel = isConfirmed || isReminder || isRescheduled ? 'Confirmed / Approved' : isPostCare ? 'Completed' : isNoShow ? 'Missed' : isBookingRequestReceived ? 'Pending Review' : isRequestRejected ? 'Rejected' : isCancelled ? 'Cancelled' : null;
  const statusColor = (isCancelled || isRequestRejected || isNoShow) ? '#dc2626' : isPostCare ? '#0f766e' : '#2563eb';

  const showDetails = copy.showSummary && !isCancelled && !isStaffReply && !isRequestRejected && !isNoShow;

  return (
    <div style={{ background: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', minHeight: '100%' }}>
      <style>{`
        .eml-body { padding: 36px 40px 48px; }
        .eml-logo { width: 130px; }
        .eml-p { font-size: 14px; line-height: 1.75; }
        @media only screen and (max-width: 480px) {
          .eml-body { padding: 24px 20px 36px !important; }
          .eml-logo { width: 100px !important; }
          .eml-p { font-size: 15px !important; line-height: 1.8 !important; }
        }
      `}</style>
      <div className="eml-body" style={{ maxWidth: 720, margin: '0 auto', background: '#ffffff' }}>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <img
            src={b.logoUrl}
            alt={b.clinicName}
            className="eml-logo"
            style={{ height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        </div>

        {/* Greeting */}
        <p style={p}>Dear <span style={{ fontWeight: 700 }}>{sample.patientName || 'Valued Patient'}</span>,</p>

        {/* Opening paragraph */}
        <p style={p}>{copy.intro}</p>

        {/* Appointment details block — label: value format */}
        {showDetails && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            {isRescheduled && (sample.oldDoctorName || sample.oldServiceName || sample.oldDateStr || sample.oldTimeRangeStr) && (
              <div style={{ margin: '0 0 16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ ...p, margin: '0 0 6px', fontWeight: 700, color: '#64748b', fontSize: 13 }}>
                  Previously scheduled:
                </p>
                {sample.oldDoctorName && (
                  <p style={{ ...p, margin: '0 0 3px', fontSize: 13, color: '#64748b' }}>
                    <span style={bold}>Doctor:</span>{' '}
                    <span style={{ textDecoration: 'line-through' }}>{sample.oldDoctorName}</span>
                  </p>
                )}
                {sample.oldServiceName && (
                  <p style={{ ...p, margin: '0 0 3px', fontSize: 13, color: '#64748b' }}>
                    <span style={bold}>Service:</span>{' '}
                    <span style={{ textDecoration: 'line-through' }}>{sample.oldServiceName}</span>
                  </p>
                )}
                {sample.oldDateStr && (
                  <p style={{ ...p, margin: '0 0 3px', fontSize: 13, color: '#64748b' }}>
                    <span style={bold}>Date:</span>{' '}
                    <span style={{ textDecoration: 'line-through' }}>{sample.oldDateStr}</span>
                  </p>
                )}
                {sample.oldTimeRangeStr && (
                  <p style={{ ...p, margin: '0 0 3px', fontSize: 13, color: '#64748b' }}>
                    <span style={bold}>Time:</span>{' '}
                    <span style={{ textDecoration: 'line-through' }}>{sample.oldTimeRangeStr}</span>
                  </p>
                )}
              </div>
            )}
            {isRescheduled && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your new appointment details:</p>
            )}
            {isPostCare && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your recent visit:</p>
            )}
            {statusLabel && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Status:</span>{' '}
                <span style={{ fontWeight: 700, color: statusColor }}>{statusLabel}</span>
                {isBookingRequestReceived && (
                  <span style={{ fontWeight: 400, fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>(preview only — actual status is NEW or CONVERTED)</span>
                )}
              </p>
            )}
            {sample.doctorName && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Doctor:</span> {sample.doctorName}</p>
            )}
            {sample.serviceName && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Service:</span> {sample.serviceName}</p>
            )}
            <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Location:</span> {b.locationLine}
              {!isConfirmed && !isRescheduled && !isReminder && !isPostCare && (b.mapUrl || sample.googleMapsUrl) && (
                <> (<a href={(b.mapUrl || sample.googleMapsUrl)} target="_blank" rel="noreferrer" style={link}>View on Google Maps</a>)</>
              )}
            </p>
            {sample.dateStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Date:</span> {sample.dateStr}</p>
            )}
            {sample.timeRangeStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Time:</span> {sample.timeRangeStr}</p>
            )}
            {referenceCode && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Reference ID:</span> {referenceCode}</p>
            )}
          </div>
        )}

        {isRescheduled && sample.rescheduleReason && (
          <p style={p}>Reschedule reason: <span style={bold}>{sample.rescheduleReason}</span></p>
        )}

        {/* Rescheduled — checklist bullets */}
        {isRescheduled && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>Please arrive 10-15 minutes early so we can get you checked in smoothly.</li>
              <li style={{ marginBottom: 6 }}>
                Have questions or need to reschedule?{' '}
                <a href={ctaHref} style={link}>Click here to open clinic chat</a>, or call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {isBookingRequestReceived && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Here is a copy of your request:</p>
            <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Status:</span>{' '}
              <span style={{ fontWeight: 700, color: '#2563eb' }}>Pending Review</span>
            </p>
            {sample.serviceName && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Service:</span> {sample.serviceName}</p>}
            {sample.dateStr && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Preferred date:</span> {sample.dateStr}</p>}
            {sample.preferredStartTimeStr && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Preferred time:</span> {sample.preferredStartTimeStr}</p>}
            {sample.appointmentId && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Reference ID:</span> {sample.appointmentId}</p>}
            <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Location:</span> {b.locationLine}</p>
            {sample.patientNote && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Your note:</span> {sample.patientNote}</p>}
          </div>
        )}

        {/* Booking request — what happens next */}
        {isBookingRequestReceived && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>What happens next?</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>Our staff reviews your request.</li>
              <li style={{ marginBottom: 6 }}>Confirmation is sent by email or text.</li>
              <li>No action needed from you — we&apos;ll be in touch.</li>
            </ul>
          </div>
        )}

        {/* Booking request — help checklist bullets */}
        {isBookingRequestReceived && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Cancelled — details + optional reason + rebook CTA */}
        {isCancelled && (
          <>
            <div style={{ margin: '0 0 16px', paddingLeft: 0 }}>
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your cancelled appointment:</p>
              {sample.serviceName && (
                <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Service:</span> {sample.serviceName}</p>
              )}
              {sample.dateStr && (
                <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Date:</span> {sample.dateStr}</p>
              )}
              {sample.timeRangeStr && (
                <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Time:</span> {sample.timeRangeStr}</p>
              )}
              {referenceCode && (
                <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Reference ID:</span> {referenceCode}</p>
              )}
            </div>
            {sample.cancellationReason && (
              <p style={p}>Cancellation reason: <span style={bold}>{sample.cancellationReason}</span></p>
            )}
          </>
        )}

        {/* Cancelled — help checklist bullets */}
        {isCancelled && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              {sample.rebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to book again?{' '}
                  <a href={sample.rebookUrl} target="_blank" rel="noreferrer" style={link}>Click here to make a new request</a>.
                </li>
              )}
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {/* No-show — missed appointment details */}
        {isNoShow && (
          <div style={{ margin: '0 0 16px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Details of your missed visit:</p>
            <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Status:</span>{' '}
              <span style={{ fontWeight: 700, color: '#dc2626' }}>Missed</span>
            </p>
            {sample.doctorName && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Doctor:</span> {sample.doctorName}</p>
            )}
            {sample.serviceName && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Service:</span> {sample.serviceName}</p>
            )}
            {sample.dateStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Date:</span> {sample.dateStr}</p>
            )}
            {sample.timeRangeStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Time:</span> {sample.timeRangeStr}</p>
            )}
            {referenceCode && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Reference ID:</span> {referenceCode}</p>
            )}
          </div>
        )}

        {/* No-show — optional feedback CTA */}
        {isNoShow && copy.showCta && copy.ctaLabel && (
          <p style={p}>
            Have a moment?{' '}
            <a href={noShowReasonUrl} style={link}>Share quick feedback</a>{' '}
            to help us improve our service (optional).
          </p>
        )}

        {/* No-show — what's next checklist */}
        {isNoShow && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>What&apos;s Next?</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              {sample.rebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to reschedule?{' '}
                  <a href={sample.rebookUrl} target="_blank" rel="noreferrer" style={link}>Click here to request a new appointment</a>.
                </li>
              )}
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Staff reply — primary CTA paragraph */}
        {isStaffReply && copy.showCta && (
          <p style={p}>
            Please{' '}
            <a href={ctaHref} style={link}>click here to open your clinic chat</a>{' '}
            to view the message and continue the conversation.
          </p>
        )}

        {/* Staff reply — help checklist bullets */}
        {isStaffReply && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Confirmed — checklist bullets */}
        {isConfirmed && sample.approvalReason && (
          <p style={p}>Approval reason: <span style={bold}>{sample.approvalReason}</span></p>
        )}

        {/* Confirmed & reminders — checklist bullets */}
        {(isConfirmed || isReminder) && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>Please arrive 10-15 minutes early so we can get you checked in smoothly.</li>
              <li style={{ marginBottom: 6 }}>
                Have questions or need to reschedule?{' '}
                <a href={ctaHref} style={link}>Click here to open clinic chat</a>, or call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Instructions */}
        {!isConfirmed && !isRescheduled && !isReminder && copy.showInstructions && (copy.primaryInstruction || copy.secondaryInstruction) && (
          <>
            {copy.primaryInstruction && <p style={p}>{copy.primaryInstruction}</p>}
            {copy.secondaryInstruction && <p style={p}>{copy.secondaryInstruction}</p>}
          </>
        )}

        {/* Post-care feedback CTA */}
        {isPostCare && copy.showCta && copy.ctaLabel && (
          <p style={p}>
            If you have a free moment, we would love to hear how your visit went —{' '}
            <a href={ctaHref} style={link}>click here to share your feedback</a>. Your feedback helps us improve our service.
          </p>
        )}

        {/* Post-care — after your visit bullets */}
        {isPostCare && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>Follow all post-treatment care instructions from your doctor.</li>
              <li style={{ marginBottom: 6 }}>Concerns or questions? Call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Appreciation / care paragraph — skipped for confirmed, rescheduled, reminders & post-care (kept short) */}
        {!isConfirmed && !isRescheduled && !isReminder && !isPostCare && !isCancelled && !isStaffReply && !isRequestRejected && !isNoShow && (
          <p style={p}>
            {isBookingRequestReceived
              ? 'We appreciate your patience while we review your request. Our team will reach out to you shortly to confirm the details of your appointment.'
              : 'Your health is our top priority, and we greatly appreciate your trust in our care. If you have any specific concerns or requests for your appointment, please feel free to let us know.'
            }
          </p>
        )}

        {/* Request rejected — apology + labeled reason */}
        {isRequestRejected && (
          <>
            <p style={p}>We sincerely apologize for any inconvenience this may cause.</p>
            <p style={p}>Rejection reason: <span style={bold}>{sample.rejectionReason || 'Unfortunately, we are unable to accommodate your request at this time.'}</span></p>
          </>
        )}

        {/* Request rejected — what was requested */}
        {isRequestRejected && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your request:</p>
            <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Status:</span>{' '}
              <span style={{ fontWeight: 700, color: '#dc2626' }}>Rejected</span>
            </p>
            {sample.serviceName && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Service:</span> {sample.serviceName}</p>}
            {sample.dateStr && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Preferred date:</span> {sample.dateStr}</p>}
            {sample.preferredStartTimeStr && <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Preferred time:</span> {sample.preferredStartTimeStr}</p>}
          </div>
        )}

        {/* Request rejected — what you can do */}
        {isRequestRejected && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, listStyle: 'disc', color: '#1a1a1a', fontSize: 14, lineHeight: 1.75 }}>
              <li style={{ marginBottom: 6 }}>
                Request a different date or time — call/text us at{' '}
                <a href={b.phoneHref} style={link}>{b.phone}</a>.
              </li>
              {sample.rebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to book again?{' '}
                  <a href={sample.rebookUrl} target="_blank" rel="noreferrer" style={link}>Click here to make a new request</a>.
                </li>
              )}
              <li>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: Replies to this email are unmonitored.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Single consolidated contact block — chat link + phone if chat available, phone-only if not */}
        {!isConfirmed && !isCancelled && !isRescheduled && !isReminder && !isPostCare && !isStaffReply && !isBookingRequestReceived && !isRequestRejected && !isNoShow && (
          <p style={p}>
            {copy.showCta && !isPostCare
              ? <>
                  If you have any questions{!isStaffReply && !isPostCare ? ', need to reschedule,' : ''} or need further assistance, please don&apos;t hesitate to reach out. You can{' '}
                  <a href={ctaHref} style={link}>click here to open the clinic chat</a>{' '}
                  or call or text us at <a href={b.phoneHref} style={link}>{b.phone}</a>.{' '}
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span>
                </>
              : <>If you have any questions or would like to reschedule a future appointment, please don&apos;t hesitate to call or text us at{' '}<a href={b.phoneHref} style={link}>{b.phone}</a>.{' '}<span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span></>
            }
          </p>
        )}

        {/* Closing */}
        <p style={{ ...p, marginBottom: 24 }}>
          {isCancelled
            ? `Thank you for letting us know, and we hope to welcome you back at ${b.clinicName} soon.`
            : isConfirmed
            ? `Thank you for choosing ${b.clinicName}. See you soon!`
            : isRescheduled
            ? `Thank you for choosing ${b.clinicName}. See you soon!`
            : isReminder
            ? `Thank you for choosing ${b.clinicName}. See you soon!`
            : isRequestRejected
            ? `Thank you for choosing ${b.clinicName}.`
            : isBookingRequestReceived
            ? `Thank you for choosing ${b.clinicName}.`
            : isPostCare
            ? `Thank you for choosing ${b.clinicName}. We hope to see you again soon.`
            : isNoShow
            ? `We hope to see you at ${b.clinicName} soon. Please reach out if there is anything we can do.`
            : isStaffReply
            ? `Thank you for choosing ${b.clinicName}. We look forward to assisting you.`
            : `Thank you for choosing ${b.clinicName}. We can't wait to see you on ${sample.dateStr || 'your appointment date'} at ${sample.timeRangeStr || 'the scheduled time'}.`
          }
        </p>

        {/* Signature */}
        <p style={{ ...p, marginBottom: 4 }}>Warm regards,</p>
        <p style={{ ...p, marginBottom: 2, ...bold }}>{b.clinicName}</p>
        <p style={{ ...p, color: '#64748b', marginBottom: 0 }}>
          {b.phone}{b.landline ? ` · ${b.landline}` : ''} &nbsp;·&nbsp;{' '}
          <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{b.websiteLabel}</a>{b.whatsappUrl ? <> &nbsp;·&nbsp; <a href={b.whatsappUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>WhatsApp</a></> : null}
        </p>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0 20px' }} />

        {/* Legal footer */}
        {copy.showFooter && (
          <p style={{ ...muted, margin: 0 }}>
            {isBookingRequestReceived || isRequestRejected
              ? `You received this email because you submitted a booking inquiry with ${b.clinicName}.`
              : `You received this email because you have an appointment with ${b.clinicName}.`}
            {' '}
            <a href={`${baseUrl}/terms`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>Terms of Service</a>
            {' '}·{' '}
            <a href={`${baseUrl}/privacy`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  );
}
