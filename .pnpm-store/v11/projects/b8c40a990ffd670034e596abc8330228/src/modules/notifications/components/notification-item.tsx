import Link from 'next/link';
import { Calendar, MailWarning, AlertTriangle, CircleAlert, Check, FileText } from 'lucide-react';
import { NotificationResponseDto } from '../dtos/management/notification-response.dto';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_APPOINTMENT_REQUEST':
      case 'NEW_RESCHEDULE_REQUEST':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'PATIENT_CANCEL_ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'TREATMENT_RENDERED':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'FAILED_EMAIL_ALERT':
        return <MailWarning className="w-4 h-4 text-amber-400" />;
      default:
        return <CircleAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`group flex items-start justify-between gap-3 p-3 rounded-xl transition-all duration-200 ${
      notification.isRead
        ? 'bg-slate-800/10 border border-slate-800/30 opacity-55'
        : 'bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-slate-700/70'
    }`}>
      <Link href={notification.linkUrl} className="flex-1 min-w-0 flex gap-3">
        <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-slate-900/60 border border-slate-700/20">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors duration-150">
            {notification.title}
          </p>
          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
            {notification.message}
          </p>
          <span className="text-[9px] text-slate-500 block mt-1" suppressHydrationWarning>
            {getRelativeTime(notification.createdAt)}
          </span>
        </div>
      </Link>
      {!notification.isRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-all duration-150"
          title="Mark as Read"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
