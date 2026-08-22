import React from 'react';
import { EmailBranding, resolveEmailBranding } from '@/components/emails/email-branding';
import { formatRefId } from '@/shared/utils/date.util';
import {
  DesignTokens,
  DraftCopy,
  EmailDesignDefinition,
  EmailThemeMode,
  SampleData,
} from './types';

export interface EmailDesignPreviewProps {
  design: EmailDesignDefinition;
  tokens: DesignTokens;
  copy: DraftCopy;
  sample: SampleData;
  branding?: EmailBranding;
  themeMode?: EmailThemeMode;
}

export function EmailDesignPreview({
  design,
  tokens,
  copy,
  sample,
  branding,
  themeMode = 'light',
}: EmailDesignPreviewProps) {
  const isDark = themeMode === 'dark';

  const fontFamily = 'Arial, Helvetica, sans-serif';

  const p: React.CSSProperties = {
    margin: '0 0 16px',
    color: isDark ? '#f4f4f5' : '#1a1a1a',
    fontSize: 14,
    lineHeight: 1.7,
    fontFamily,
  };
  const bold: React.CSSProperties = {
    fontWeight: 700,
    color: isDark ? '#ffffff' : '#1a1a1a',
    fontFamily,
  };
  const link: React.CSSProperties = {
    color: isDark ? '#60a5fa' : '#2563eb',
    textDecoration: 'underline',
    fontWeight: 600,
    fontFamily,
  };
  const muted: React.CSSProperties = {
    color: isDark ? '#a1a1aa' : '#64748b',
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily,
  };

  const isCancelled = design.id === 'cancelled';
  const isConfirmed = design.id === 'appointment-confirmed';
  const isReminder = design.id === 'reminder-24h' || design.id === 'reminder-48h';
  const isRescheduled = design.id === 'rescheduled';
  const isPostCare = design.id === 'post-care';
  const isFollowUp = design.id === 'checkout-follow-up';
  const isNoShow = design.id === 'no-show';
  const isStaffReply = design.id === 'staff-reply';
  const isBookingRequestReceived = design.id === 'booking-request-received';
  const isRequestRejected = design.id === 'request-rejected';
  const baseUrl = sample.baseUrl || 'http://localhost:3000';
  const b = branding ?? resolveEmailBranding(undefined, baseUrl);
  const feedbackUrl = `${baseUrl}/feedback?ref=${sample.appointmentId || 'APT-SAMPLE'}`;
  const noShowReasonUrl = `${baseUrl}/no-show-reason?ref=${sample.appointmentId || 'APT-SAMPLE'}`;
  const wellbeingUrl = `${baseUrl}/wellbeing?ref=${sample.appointmentId || 'APT-SAMPLE'}`;
  const ctaHref = isPostCare ? feedbackUrl : isNoShow ? noShowReasonUrl : b.websiteUrl;
  const referenceCode = sample.referenceCode || formatRefId(sample.appointmentId);
  const displayLocation = b.locationLine
    ? b.locationLine.replace(new RegExp(`^${b.clinicName},?\\s*`, 'i'), '').trim() || b.locationLine
    : '';

  const statusLabel =
    isConfirmed || isReminder || isRescheduled
      ? 'Confirmed / Approved'
      : isPostCare
      ? 'Completed'
      : isFollowUp
      ? 'Completed'
      : isNoShow
      ? 'Missed'
      : isBookingRequestReceived
      ? 'Pending Review'
      : isRequestRejected
      ? 'Rejected'
      : isCancelled
      ? 'Cancelled'
      : null;

  const statusColor =
    isCancelled || isRequestRejected || isNoShow
      ? isDark
        ? '#f87171'
        : '#dc2626'
      : isPostCare || isFollowUp
      ? isDark
        ? '#2dd4bf'
        : '#0f766e'
      : isDark
      ? '#60a5fa'
      : '#2563eb';

  const showDetails = copy.showSummary && !isCancelled && !isStaffReply && !isRequestRejected && !isNoShow;

  const containerCard: React.CSSProperties = {
    margin: '0 0 20px',
    padding: '16px 20px',
    backgroundColor: isDark ? '#27272a' : '#f8fafc',
    borderRadius: 10,
    border: isDark ? '1px solid #3f3f46' : '1px solid #e2e8f0',
    fontFamily,
  };

  const labelCell: React.CSSProperties = {
    width: 130,
    padding: '6px 12px 6px 0',
    verticalAlign: 'top',
    fontWeight: 700,
    fontSize: 14,
    color: isDark ? '#ffffff' : '#1a1a1a',
    whiteSpace: 'nowrap',
    fontFamily,
  };

  const valueCell: React.CSSProperties = {
    padding: '6px 0',
    verticalAlign: 'top',
    fontSize: 14,
    color: isDark ? '#f4f4f5' : '#1a1a1a',
    lineHeight: 1.6,
    textAlign: 'right',
    fontFamily,
  };

  const listStyle: React.CSSProperties = {
    margin: '0 0 16px',
    paddingLeft: 20,
    listStyle: 'disc',
    color: isDark ? '#f4f4f5' : '#1a1a1a',
    fontSize: 14,
    lineHeight: 1.7,
    fontFamily,
  };

  return (
    <div
      style={{
        background: isDark ? '#18181b' : '#ffffff',
        color: isDark ? '#f4f4f5' : '#1a1a1a',
        fontFamily,
        minHeight: '100%',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      <style>{`
        .eml-body { padding: 36px 36px 44px; }
        .eml-logo { width: 130px; }
        @media only screen and (max-width: 480px) {
          .eml-body { padding: 24px 20px 32px !important; }
          .eml-logo { width: 100px !important; }
        }
      `}</style>
      <div className="eml-body" style={{ maxWidth: 720, margin: '0 auto', background: isDark ? '#18181b' : '#ffffff', fontFamily }}>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <img
            src={b.logoUrl}
            alt={b.clinicName}
            className="eml-logo"
            style={{
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Greeting */}
        <p style={p}>Dear <span style={{ fontWeight: 700, color: isDark ? '#ffffff' : '#1a1a1a' }}>{sample.patientName || 'Valued Patient'}</span>,</p>

        {/* Opening paragraph */}
        <p style={p}>{copy.intro}</p>

        {/* Appointment details block — 2-column label / details in container */}
        {showDetails && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            {isRescheduled && (sample.oldDoctorName || sample.oldServiceName || sample.oldDateStr || sample.oldTimeRangeStr) && (
              <div style={containerCard}>
                <p style={{ ...p, margin: '0 0 8px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#64748b' }}>
                  Previously scheduled:
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                  <tbody>
                    {sample.oldDateStr && (
                      <tr>
                        <td style={{ ...labelCell, width: 120, color: isDark ? '#a1a1aa' : '#64748b', padding: '4px 12px 4px 0' }}>
                          Date:
                        </td>
                        <td style={{ ...valueCell, color: isDark ? '#a1a1aa' : '#64748b', textDecoration: 'line-through', padding: '4px 0' }}>
                          {sample.oldDateStr}
                        </td>
                      </tr>
                    )}
                    {sample.oldTimeRangeStr && (
                      <tr>
                        <td style={{ ...labelCell, width: 120, color: isDark ? '#a1a1aa' : '#64748b', padding: '4px 12px 4px 0' }}>
                          Time:
                        </td>
                        <td style={{ ...valueCell, color: isDark ? '#a1a1aa' : '#64748b', textDecoration: 'line-through', padding: '4px 0' }}>
                          {sample.oldTimeRangeStr}
                        </td>
                      </tr>
                    )}
                    {sample.oldServiceName && (
                      <tr>
                        <td style={{ ...labelCell, width: 120, color: isDark ? '#a1a1aa' : '#64748b', padding: '4px 12px 4px 0' }}>
                          Service:
                        </td>
                        <td style={{ ...valueCell, color: isDark ? '#a1a1aa' : '#64748b', textDecoration: 'line-through', padding: '4px 0' }}>
                          {sample.oldServiceName}
                        </td>
                      </tr>
                    )}
                    {sample.oldDoctorName && (
                      <tr>
                        <td style={{ ...labelCell, width: 120, color: isDark ? '#a1a1aa' : '#64748b', padding: '4px 12px 4px 0' }}>
                          Doctor:
                        </td>
                        <td style={{ ...valueCell, color: isDark ? '#a1a1aa' : '#64748b', textDecoration: 'line-through', padding: '4px 0' }}>
                          {sample.oldDoctorName}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {(isConfirmed || isReminder || (!isRescheduled && !isPostCare && !isFollowUp)) && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your appointment details:</p>
            )}
            {isRescheduled && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your new appointment details:</p>
            )}
            {isPostCare && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your recent visit:</p>
            )}
            {isFollowUp && (
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your recent visit:</p>
            )}
            <div style={containerCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                <tbody>
                  {statusLabel && (
                    <tr>
                      <td style={labelCell}>Status:</td>
                      <td style={{ ...valueCell, fontWeight: 700, color: statusColor }}>
                        {statusLabel}
                        {isBookingRequestReceived && (
                          <span style={{ fontWeight: 400, fontSize: 12, color: isDark ? '#a1a1aa' : '#94a3b8', marginLeft: 6 }}>
                            (preview only — actual status is NEW or CONVERTED)
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                  {sample.dateStr && (
                    <tr>
                      <td style={labelCell}>Date:</td>
                      <td style={valueCell}>{sample.dateStr}</td>
                    </tr>
                  )}
                  {sample.timeRangeStr && (
                    <tr>
                      <td style={labelCell}>Time:</td>
                      <td style={valueCell}>{sample.timeRangeStr}</td>
                    </tr>
                  )}
                  {sample.serviceName && (
                    <tr>
                      <td style={labelCell}>Service:</td>
                      <td style={valueCell}>{sample.serviceName}</td>
                    </tr>
                  )}
                  {sample.doctorName && (
                    <tr>
                      <td style={labelCell}>Doctor:</td>
                      <td style={valueCell}>{sample.doctorName}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCell}>Location:</td>
                    <td style={valueCell}>{displayLocation}</td>
                  </tr>
                  {referenceCode && (
                    <tr>
                      <td style={labelCell}>Reference ID:</td>
                      <td style={valueCell}>{referenceCode}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isRescheduled && sample.rescheduleReason && (
          <p style={p}>Reschedule reason: <span style={bold}>{sample.rescheduleReason}</span></p>
        )}

        {/* Rescheduled — checklist bullets */}
        {isRescheduled && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</p>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>Please arrive 10-15 minutes early so we can get you checked in smoothly.</li>
              <li style={{ marginBottom: 6 }}>
                Have questions or need to reschedule? Call or text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
              </li>
            </ul>
          </div>
        )}

        {isBookingRequestReceived && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Here is a copy of your request:</p>
            <div style={containerCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Status:</td>
                    <td style={{ ...valueCell, fontWeight: 700, color: isDark ? '#60a5fa' : '#2563eb' }}>Pending Review</td>
                  </tr>
                  {sample.dateStr && (
                    <tr>
                      <td style={labelCell}>Preferred date:</td>
                      <td style={valueCell}>{sample.dateStr}</td>
                    </tr>
                  )}
                  {sample.preferredStartTimeStr && (
                    <tr>
                      <td style={labelCell}>Preferred time:</td>
                      <td style={valueCell}>{sample.preferredStartTimeStr}</td>
                    </tr>
                  )}
                  {sample.serviceName && (
                    <tr>
                      <td style={labelCell}>Service:</td>
                      <td style={valueCell}>{sample.serviceName}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCell}>Location:</td>
                    <td style={valueCell}>{displayLocation}</td>
                  </tr>
                  {sample.appointmentId && (
                    <tr>
                      <td style={labelCell}>Reference ID:</td>
                      <td style={valueCell}>{sample.appointmentId}</td>
                    </tr>
                  )}
                  {sample.patientNote && (
                    <tr>
                      <td style={labelCell}>Your note:</td>
                      <td style={valueCell}>{sample.patientNote}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Booking request — what happens next */}
        {isBookingRequestReceived && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>What happens next?</p>
            <ul style={listStyle}>
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
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
              </li>
            </ul>
          </div>
        )}

        {/* Cancelled — details + optional reason + rebook CTA */}
        {isCancelled && (
          <>
            <div style={{ margin: '0 0 16px', paddingLeft: 0 }}>
              <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your cancelled appointment:</p>
              <div style={containerCard}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                  <tbody>
                    {sample.dateStr && (
                      <tr>
                        <td style={labelCell}>Date:</td>
                        <td style={valueCell}>{sample.dateStr}</td>
                      </tr>
                    )}
                    {sample.timeRangeStr && (
                      <tr>
                        <td style={labelCell}>Time:</td>
                        <td style={valueCell}>{sample.timeRangeStr}</td>
                      </tr>
                    )}
                    {sample.serviceName && (
                      <tr>
                        <td style={labelCell}>Service:</td>
                        <td style={valueCell}>{sample.serviceName}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={labelCell}>Location:</td>
                      <td style={valueCell}>{displayLocation}</td>
                    </tr>
                    {referenceCode && (
                      <tr>
                        <td style={labelCell}>Reference ID:</td>
                        <td style={valueCell}>{referenceCode}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
              </li>
              {sample.rebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to book again?{' '}
                  <a href={sample.rebookUrl} target="_blank" rel="noreferrer" style={link}>Click here to make a new request</a>.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* No-show — missed appointment details */}
        {isNoShow && (
          <div style={{ margin: '0 0 16px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Details of your missed visit:</p>
            <div style={containerCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Status:</td>
                    <td style={{ ...valueCell, fontWeight: 700, color: isDark ? '#f87171' : '#dc2626' }}>Missed</td>
                  </tr>
                  {sample.dateStr && (
                    <tr>
                      <td style={labelCell}>Date:</td>
                      <td style={valueCell}>{sample.dateStr}</td>
                    </tr>
                  )}
                  {sample.timeRangeStr && (
                    <tr>
                      <td style={labelCell}>Time:</td>
                      <td style={valueCell}>{sample.timeRangeStr}</td>
                    </tr>
                  )}
                  {sample.serviceName && (
                    <tr>
                      <td style={labelCell}>Service:</td>
                      <td style={valueCell}>{sample.serviceName}</td>
                    </tr>
                  )}
                  {sample.doctorName && (
                    <tr>
                      <td style={labelCell}>Doctor:</td>
                      <td style={valueCell}>{sample.doctorName}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCell}>Location:</td>
                    <td style={valueCell}>{displayLocation}</td>
                  </tr>
                  {referenceCode && (
                    <tr>
                      <td style={labelCell}>Reference ID:</td>
                      <td style={valueCell}>{referenceCode}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No-show — optional feedback CTA */}
        {isNoShow && copy.showCta && copy.ctaLabel && (
          <p style={p}>
            Let us know why you couldn&apos;t make it, it helps us improve.{' '}
            <a href={noShowReasonUrl} style={link}>Tell us why</a>{' '}
            (optional).
          </p>
        )}

        {/* No-show — what's next checklist */}
        {isNoShow && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>What&apos;s Next?</p>
            <ul style={listStyle}>
              {sample.rebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to reschedule?{' '}
                  <a href={sample.rebookUrl} target="_blank" rel="noreferrer" style={link}>Click here to request a new appointment</a>.
                </li>
              )}
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
              </li>
            </ul>
          </div>
        )}

        {/* Staff reply — primary paragraph */}
        {isStaffReply && (
          <p style={p}>
            If you have questions or need further assistance regarding your appointment, please don&apos;t hesitate to call or text us at{' '}
            <span style={bold}>{b.phone}</span>{b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
          </p>
        )}

        {/* Staff reply — help checklist bullets */}
        {isStaffReply && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</p>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>
                Questions? Call/text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
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
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>Please arrive 10-15 minutes early so we can get you checked in smoothly.</li>
              <li style={{ marginBottom: 6 }}>
                Have questions or need to reschedule? Call or text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
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
            If you have a free moment, we would love to hear how your visit went.{' '}
            <a href={ctaHref} style={link}>Click here to share your feedback.</a> Your feedback helps us improve our service.
          </p>
        )}

        {/* Follow-up wellbeing CTA */}
        {isFollowUp && copy.showCta && copy.ctaLabel && (
          <p style={p}>
            How are you feeling today? Take a moment to let us know:{' '}
            <a href={wellbeingUrl} style={link}>Tell us how you&apos;re feeling</a>. Your response helps our team support your recovery.
          </p>
        )}

        {/* Post-care — after your visit bullets */}
        {isPostCare && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</p>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>Follow all post-treatment care instructions from your doctor.</li>
              <li style={{ marginBottom: 6 }}>
                Concerns or questions? Call/text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
              </li>
            </ul>
          </div>
        )}

        {/* Follow-up — check in on you bullets */}
        {isFollowUp && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Quick Reminders</p>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>Follow all post-treatment care instructions from your doctor.</li>
              <li style={{ marginBottom: 6 }}>
                Concerns or questions? Call/text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
              </li>
              <li style={{ marginTop: 6 }}>
                If you are experiencing a severe emergency, call us immediately at{' '}
                <span style={bold}>{b.phone}</span>{' '}
                or visit the nearest emergency room.
              </li>
            </ul>
          </div>
        )}

        {/* Appreciation / care paragraph */}
        {!isConfirmed && !isRescheduled && !isReminder && !isPostCare && !isFollowUp && !isCancelled && !isStaffReply && !isRequestRejected && !isNoShow && !isBookingRequestReceived && (
          <p style={p}>
            Your health is our top priority, and we greatly appreciate your trust in our care. If you have any specific concerns or requests for your appointment, please feel free to let us know.
          </p>
        )}

        {/* Request rejected — what was requested */}
        {isRequestRejected && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Your request:</p>
            <div style={containerCard}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Status:</td>
                    <td style={{ ...valueCell, fontWeight: 700, color: isDark ? '#f87171' : '#dc2626' }}>Rejected</td>
                  </tr>
                  {sample.dateStr && (
                    <tr>
                      <td style={labelCell}>Preferred date:</td>
                      <td style={valueCell}>{sample.dateStr}</td>
                    </tr>
                  )}
                  {sample.preferredStartTimeStr && (
                    <tr>
                      <td style={labelCell}>Preferred time:</td>
                      <td style={valueCell}>{sample.preferredStartTimeStr}</td>
                    </tr>
                  )}
                  {sample.serviceName && (
                    <tr>
                      <td style={labelCell}>Service:</td>
                      <td style={valueCell}>{sample.serviceName}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={labelCell}>Location:</td>
                    <td style={valueCell}>{displayLocation}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request rejected — labeled reason */}
        {isRequestRejected && (
          <p style={p}>Rejection reason: <span style={bold}>{sample.rejectionReason || 'Unfortunately, we are unable to accommodate your request at this time.'}</span></p>
        )}

        {/* Request rejected — what you can do */}
        {isRequestRejected && (
          <div style={{ margin: '0 0 20px', paddingLeft: 0 }}>
            <p style={{ ...p, margin: '0 0 8px', fontWeight: 700 }}>Need Help?</p>
            <ul style={listStyle}>
              <li style={{ marginBottom: 6 }}>
                Request a different date or time — call/text us at{' '}
                <span style={bold}>{b.phone}</span>
                {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}.
              </li>
              <li style={{ marginBottom: 6 }}>
                You can visit our website:{' '}
                <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
              </li>
              {sample.rebookUrl && (
                <li style={{ marginBottom: 6 }}>
                  Ready to book again?{' '}
                  <a href={sample.rebookUrl} target="_blank" rel="noreferrer" style={link}>Click here to make a new request</a>.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Single consolidated contact block */}
        {!isConfirmed && !isCancelled && !isRescheduled && !isReminder && !isPostCare && !isFollowUp && !isStaffReply && !isBookingRequestReceived && !isRequestRejected && !isNoShow && (
          <p style={p}>
            If you have any questions{!isPostCare ? ', need to reschedule,' : ''} or need further assistance, please don&apos;t hesitate to call or text us at{' '}
            <span style={bold}>{b.phone}</span>
            {b.landline ? <> · Landline: <span style={bold}>{b.landline}</span></> : ''}, or you can visit our website at{' '}
            <a href={b.websiteUrl} target="_blank" rel="noreferrer" style={link}>{b.websiteLabel}</a>.
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
            : isFollowUp
            ? `We hope you are feeling well. Thank you for trusting ${b.clinicName} with your care.`
            : isNoShow
            ? `We hope to see you at ${b.clinicName} soon. Please reach out if there is anything we can do.`
            : isStaffReply
            ? `Thank you for choosing ${b.clinicName}. We look forward to assisting you.`
            : `Thank you for choosing ${b.clinicName}. We can't wait to see you on ${sample.dateStr || 'your appointment date'} at ${sample.timeRangeStr || 'the scheduled time'}.`
          }
        </p>

        {/* Signature */}
        <p style={{ ...p, marginBottom: 4 }}>Warm regards,</p>
        <p style={{ ...p, marginBottom: 0, ...bold }}>{b.clinicName}</p>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: isDark ? '1px solid #27272a' : '1px solid #e2e8f0', margin: '32px 0 20px' }} />

        {/* Legal footer */}
        {copy.showFooter && (
          <p style={{ ...muted, margin: 0 }}>
            {isBookingRequestReceived || isRequestRejected
              ? `You received this email because you submitted a booking inquiry with ${b.clinicName}.`
              : `You received this email because you have an appointment with ${b.clinicName}.`}
            {' '}
            <a href={`${baseUrl}/terms`} target="_blank" rel="noreferrer" style={{ color: isDark ? '#71717a' : '#94a3b8' }}>Terms of Service</a>
            {' '}·{' '}
            <a href={`${baseUrl}/privacy`} target="_blank" rel="noreferrer" style={{ color: isDark ? '#71717a' : '#94a3b8' }}>Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  );
}
