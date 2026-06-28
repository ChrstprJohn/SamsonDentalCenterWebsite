'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { checkInAction } from '@/modules/appointments/actions/status/check-in.action';
import { undoCheckInAction } from '@/modules/appointments/actions/status/undo-check-in.action';
import { markNoShowAction } from '@/modules/appointments/actions/status/mark-no-show.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { checkoutAction } from '@/modules/billing/actions/invoicing/checkout.action';
import { getInvoicesAction } from '@/modules/billing/actions/invoicing/get-invoices.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { createClient } from '@/shared/database/client';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import type { InvoiceResponseDto } from '@/modules/billing/dtos/exports';
import { getTodayLocalDateStr } from '@/shared/utils/date.util';

export function useSecretaryCheckInOutTracker() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponseDto[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [checkoutInvoice, setCheckoutInvoice] = useState<InvoiceResponseDto | null>(null);
  const [checkoutAppt, setCheckoutAppt] = useState<AppointmentDto | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'HMO'>('CASH');
  const [servicesCatalog, setServicesCatalog] = useState<{ id: string; name: string; price: number }[]>([]);
  const [additionalItems, setAdditionalItems] = useState<{ serviceId?: string; description: string; unitPrice: number; quantity: number }[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPrice, setCustomPrice] = useState(0);
  const [customQty, setCustomQty] = useState(1);
  const [viewAppt, setViewAppt] = useState<AppointmentDto | null>(null);
  const [viewInvoiceItems, setViewInvoiceItems] = useState<any[]>([]);
  const [rescheduleAppt, setRescheduleAppt] = useState<AppointmentDto | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);
  const todayStr = getTodayLocalDateStr();
  const toNaiveUtc = (date: Date) => new Date(date.getTime() + (-date.getTimezoneOffset()) * 60000);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const apptRes = await getClinicAppointmentsAction({ date: todayStr });
      if (apptRes.success && apptRes.data) setAppointments(apptRes.data);
      else setErrorMessage(apptRes.error || 'Failed to load appointments');
      const invRes = await getInvoicesAction({ limit: 100, page: 1 });
      if (invRes.success && invRes.data) setInvoices(invRes.data);
      const svcRes = await getServicesAction();
      if (svcRes.data) setServicesCatalog(svcRes.data.map((service: any) => ({ id: service.id, name: service.name, price: Number(service.price || 0) })));
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentTime(toNaiveUtc(new Date()));
    const tick = setInterval(() => setCurrentTime(toNaiveUtc(new Date())), 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel('check-in-out-tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const getCheckInStatus = (appointment: AppointmentDto) => {
    if (!currentTime) return { enabled: false, message: 'Check In' };
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    const windowStart = new Date(startTime.getTime() - 30 * 60 * 1000);
    if (currentTime < windowStart) return { enabled: false, message: `In ${Math.ceil((windowStart.getTime() - currentTime.getTime()) / 60000)}m` };
    if (currentTime > endTime) return { enabled: false, message: 'Expired' };
    return { enabled: true, message: 'Check In' };
  };

  const runStatusAction = (action: () => Promise<any>, fallback: string) => {
    startTransition(async () => {
      const res = await action();
      if (!res.success) alert(res.error || fallback);
      else fetchData();
    });
  };

  const handleCheckIn = (appointmentId: string) => runStatusAction(() => checkInAction({ appointmentId }), 'Failed to check in');
  const handleMarkNoShow = (appointmentId: string) => runStatusAction(() => markNoShowAction({ appointmentId }), 'Failed to mark no-show');
  const handleUndoCheckIn = (appointmentId: string) => {
    if (!confirm('Are you sure you want to undo this check-in?')) return;
    runStatusAction(() => undoCheckInAction({ appointmentId }), 'Failed to undo check-in');
  };

  const handleCheckoutComplete = () => {
    if (!checkoutInvoice || !checkoutAppt) return;
    startTransition(async () => {
      const res = await checkoutAction({ invoiceId: checkoutInvoice.id, paymentMethod, discountPercent, additionalItems });
      if (!res.success) alert(res.error || 'Failed to complete checkout');
      else {
        setCheckoutInvoice(null);
        setCheckoutAppt(null);
        setDiscountPercent(0);
        setAdditionalItems([]);
        fetchData();
      }
    });
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleAppt || !rescheduleDate || !rescheduleTime || !rescheduleDoctor) return;
    startTransition(async () => {
      const startIso = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();
      const endIso = new Date(new Date(startIso).getTime() + 30 * 60 * 1000).toISOString();
      const res = await updateAppointmentStatusAction({
        appointmentId: rescheduleAppt.id,
        status: 'APPROVED',
        statusReason: 'Rescheduling past no-show appointment',
        newDate: rescheduleDate,
        newStartTime: startIso,
        newEndTime: endIso,
        newDoctorId: rescheduleDoctor,
      });
      if (!res.success) alert(res.error || 'Failed to reschedule');
      else {
        setRescheduleAppt(null);
        fetchData();
      }
    });
  };

  const getDraftInvoiceForAppt = (apptId: string) => invoices.find((invoice) => invoice.appointmentId === apptId && invoice.status === 'DRAFT') || null;
  const getFinalizedInvoiceForAppt = (apptId: string) => invoices.find((invoice) => invoice.appointmentId === apptId && invoice.status === 'FINALIZED') || null;
  const getSubtotal = () => (checkoutInvoice?.amount || 0) + additionalItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const calculateFinalPrice = () => Math.max(0, getSubtotal() - getSubtotal() * (discountPercent / 100));

  const handleViewApptDetails = async (appointment: AppointmentDto) => {
    setViewAppt(appointment);
    setViewInvoiceItems([]);
    const invoice = getFinalizedInvoiceForAppt(appointment.id);
    if (!invoice) return;
    const { data } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id);
    if (data) setViewInvoiceItems(data);
  };

  const columns = useMemo(() => ({
    approved: appointments.filter((appointment) => appointment.status === 'APPROVED'),
    noShow: appointments.filter((appointment) => appointment.status === 'NO_SHOW'),
    checkedIn: appointments.filter((appointment) => appointment.status === 'CHECKED_IN'),
    readyCheckout: appointments.filter((appointment) => appointment.status === 'TREATMENT_RENDERED'),
    completed: appointments.filter((appointment) => appointment.status === 'COMPLETED'),
  }), [appointments]);

  const stats = {
    totalCheckedInToday: appointments.filter((appointment) => ['CHECKED_IN', 'TREATMENT_RENDERED', 'COMPLETED'].includes(appointment.status)).length,
    completedToday: columns.completed.length,
    pendingCheckout: columns.readyCheckout.length,
    totalRevenue: invoices.filter((invoice) => invoice.status === 'FINALIZED' && appointments.some((appointment) => appointment.id === invoice.appointmentId)).reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
  };

  const addLineItem = () => {
    if (!customDescription.trim()) return;
    setAdditionalItems((prev) => [...prev, { serviceId: selectedServiceId === 'custom' ? undefined : selectedServiceId, description: customDescription, unitPrice: customPrice, quantity: customQty }]);
    setSelectedServiceId('');
    setCustomDescription('');
    setCustomPrice(0);
    setCustomQty(1);
  };

  const closeCheckout = () => {
    setCheckoutInvoice(null);
    setCheckoutAppt(null);
    setAdditionalItems([]);
  };

  return {
    appointments, invoices, columns, stats, currentTime, todayStr, isLoading, errorMessage, isPending,
    checkoutInvoice, checkoutAppt, setCheckoutInvoice, setCheckoutAppt, discountPercent, setDiscountPercent,
    paymentMethod, setPaymentMethod, servicesCatalog, additionalItems, setAdditionalItems, selectedServiceId,
    setSelectedServiceId, customDescription, setCustomDescription, customPrice, setCustomPrice, customQty, setCustomQty,
    viewAppt, setViewAppt, viewInvoiceItems, rescheduleAppt, setRescheduleAppt, rescheduleDate, setRescheduleDate,
    rescheduleTime, setRescheduleTime, rescheduleDoctor, setRescheduleDoctor, getCheckInStatus, handleCheckIn,
    handleUndoCheckIn, handleMarkNoShow, handleCheckoutComplete, handleRescheduleSubmit, calculateFinalPrice,
    handleViewApptDetails, getDraftInvoiceForAppt, getFinalizedInvoiceForAppt, addLineItem, closeCheckout,
  };
}
