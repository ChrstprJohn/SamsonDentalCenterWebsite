import React from 'react';
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
}

export function EmailDesignPreview({
  design,
  tokens,
  copy,
  sample,
}: EmailDesignPreviewProps) {
  const isCancelled = design.id === 'cancelled';
  const isConfirmed = design.id === 'appointment-confirmed';
  const isReminder = design.id === 'reminder-24h' || design.id === 'reminder-48h';
  const isRescheduled = design.id === 'rescheduled';
  const isPostCare = design.id === 'post-care';
  const isStaffReply = design.id === 'staff-reply';
  const isBookingRequestReceived = design.id === 'booking-request-received';
  const isRequestRejected = design.id === 'request-rejected';
  const baseUrl = sample.baseUrl || 'http://localhost:3000';
  const chatUrl = `${baseUrl}/manage?token=${sample.appointmentId || 'APT-SAMPLE'}&openChat=true`;
  const feedbackUrl = `${baseUrl}/feedback?ref=${sample.appointmentId || 'APT-SAMPLE'}`;
  const ctaHref = isPostCare ? feedbackUrl : chatUrl;

  const statusLabel = isConfirmed || isReminder || isRescheduled ? 'Confirmed / Approved' : isPostCare ? 'Completed' : isBookingRequestReceived ? 'Pending Review' : null;

  const showDetails = copy.showSummary && !isCancelled && !isStaffReply && !isRequestRejected;

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
      <div className="eml-body" style={{ maxWidth: 600, margin: '0 auto', background: '#ffffff' }}>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <img
            src="/images/SamsonLOGOGO-removebg-preview.png"
            alt="Samson Dental Center"
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
            {isRescheduled && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your new appointment details:</p>
            )}
            {statusLabel && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Status:</span>{' '}
                <span style={{ fontWeight: 700, color: isPostCare ? '#0f766e' : '#2563eb' }}>{statusLabel}</span>
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
            <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Location:</span> Samson Dental Center, Quezon City, Metro Manila</p>
            {sample.dateStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Date:</span> {sample.dateStr}</p>
            )}
            {sample.timeRangeStr && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Time:</span> {sample.timeRangeStr}</p>
            )}
            {sample.appointmentId && (
              <p style={{ ...p, margin: '0 0 4px' }}><span style={bold}>Reference ID:</span> {sample.appointmentId}</p>
            )}
          </div>
        )}

        {/* Cancelled — date line + optional reason */}
        {isCancelled && sample.dateStr && (
          <p style={p}>
            Your appointment originally scheduled for <span style={bold}>{sample.dateStr}</span> has been cancelled.{' '}
            <span style={{ fontWeight: 700 }}>
              {sample.cancellationReason || 'This appointment has been cancelled as requested.'}
            </span>
          </p>
        )}

        {/* Staff reply — primary CTA paragraph */}
        {isStaffReply && copy.showCta && (
          <p style={p}>
            Please{' '}
            <a href={ctaHref} style={link}>click here to open your clinic chat</a>{' '}
            to view the message and continue the conversation.
          </p>
        )}

        {/* Instructions */}
        {copy.showInstructions && (copy.primaryInstruction || copy.secondaryInstruction) && (
          <>
            {copy.primaryInstruction && <p style={p}>{copy.primaryInstruction}</p>}
            {copy.secondaryInstruction && <p style={p}>{copy.secondaryInstruction}</p>}
          </>
        )}

        {/* Post-care feedback CTA */}
        {isPostCare && copy.showCta && copy.ctaLabel && (
          <p style={p}>
            If you have a moment, we would love to hear about your experience &mdash; please{' '}
            <a href={ctaHref} style={link}>click here to share your feedback</a>. Your feedback helps us continue to improve.
          </p>
        )}

        {/* Appreciation / care paragraph */}
        {!isCancelled && !isStaffReply && !isRequestRejected && (
          <p style={p}>
            {isPostCare
              ? 'Your health and well-being are our top priority, and we greatly appreciate your trust in our care. If you have any specific concerns following your visit, please feel free to let us know.'
              : isBookingRequestReceived
              ? 'We appreciate your patience while we review your request. Our team will reach out to you shortly to confirm the details of your appointment.'
              : 'Your health is our top priority, and we greatly appreciate your trust in our care. If you have any specific concerns or requests for your appointment, please feel free to let us know.'
            }
          </p>
        )}

        {/* Request rejected — apology paragraph + reason */}
        {isRequestRejected && (
          <p style={p}>
            We sincerely apologize for any inconvenience this may cause.{' '}
            <span style={{ fontWeight: 700 }}>
              {sample.rejectionReason || 'Unfortunately, we are unable to accommodate your request at this time.'}
            </span>{' '}
            If you would like to explore alternative dates or have any questions about our available services, please do not hesitate to contact us.
          </p>
        )}

        {/* Single consolidated contact block — chat link + phone if chat available, phone-only if not */}
        <p style={p}>
          {copy.showCta && !isPostCare
            ? <>
                If you have any questions{!isStaffReply && !isPostCare ? ', need to reschedule,' : ''} or need further assistance, please don&apos;t hesitate to reach out. You can{' '}
                <a href={ctaHref} style={link}>click here to open the clinic chat</a>{' '}
                or call or text us at <a href="tel:028123456" style={link}>(02) 8123-4567</a>.{' '}
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span>
              </>
            : <>If you have any questions or would like to reschedule a future appointment, please don&apos;t hesitate to call or text us at{' '}<a href="tel:028123456" style={link}>(02) 8123-4567</a>.{' '}<span style={{ color: '#dc2626', fontWeight: 600 }}>Please note that replies to this email are not monitored.</span></>
          }
        </p>

        {/* Closing */}
        <p style={{ ...p, marginBottom: 24 }}>
          {isCancelled
            ? "Thank you for letting us know, and we hope to welcome you back at Samson Dental Center soon."
            : isRequestRejected
            ? "We hope to have the opportunity to serve you in the future. Thank you for considering Samson Dental Center."
            : isBookingRequestReceived
            ? "Thank you for choosing Samson Dental Center. We look forward to welcoming you soon."
            : isPostCare
            ? "Thank you for choosing Samson Dental Center. We're dedicated to providing you with the best possible dental care experience."
            : `Thank you for choosing Samson Dental Center. We can't wait to see you on ${sample.dateStr || 'your appointment date'} at ${sample.timeRangeStr || 'the scheduled time'}.`
          }
        </p>

        {/* Signature */}
        <p style={{ ...p, marginBottom: 4 }}>Warm regards,</p>
        <p style={{ ...p, marginBottom: 2, ...bold }}>Samson Dental Center</p>
        <p style={{ ...p, color: '#64748b', marginBottom: 0 }}>
          (02) 8123-4567 &nbsp;·&nbsp;{' '}
          <a href={baseUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>samsondentalcenter.com.ph</a>
        </p>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0 20px' }} />

        {/* Legal footer */}
        {copy.showFooter && (
          <p style={{ ...muted, margin: 0 }}>
            {isBookingRequestReceived || isRequestRejected
              ? 'You received this email because you submitted a booking inquiry with Samson Dental Center.'
              : 'You received this email because you have an appointment with Samson Dental Center.'}
            {' '}If you believe this was sent in error, please contact our office.{' '}
            <a href={`${baseUrl}/terms`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>Terms of Service</a>
            {' '}·{' '}
            <a href={`${baseUrl}/privacy`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  );
}
