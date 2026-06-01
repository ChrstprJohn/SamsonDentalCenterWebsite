import { registerSubscriber } from '@/shared/outbox/outbox.registry';
import { onPatientRegisteredSubscriber } from '@/modules/emails/subscribers/on-patient-registered.subscriber';

/**
 * Bootstraps the Event Bus Registry.
 * This file acts as the Orchestrator layer, wiring specific Domain Modules 
 * (like Emails or SMS) to the generic Shared Event Bus.
 * 
 * By importing this file in the dispatcher, we guarantee that all subscribers
 * are registered in the Next.js serverless environment before events are processed.
 */
export const bootstrapEventSubscribers = () => {
  registerSubscriber('PATIENT_REGISTERED', onPatientRegisteredSubscriber.handle);
  
  // Future SMS Module
  // registerSubscriber('PATIENT_REGISTERED', onPatientRegisteredSmsSubscriber.handle);
};
