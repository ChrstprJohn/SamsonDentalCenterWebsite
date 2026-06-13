import type { NewDependentInput } from '../hooks/booking/use-user-booking';
import type { DependentProfileDto } from '@/modules/patients/dtos/exports';

export const getPatientName = (
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT',
  selectedDependentId: string | null,
  newDependentData: NewDependentInput | null,
  userProfile: any,
  userDependents?: DependentProfileDto[]
): string => {
  if (patientType === 'SELF') {
    return [
      userProfile?.firstName,
      userProfile?.middleName,
      userProfile?.lastName,
      userProfile?.suffix
    ].filter(Boolean).join(' ').trim() || 'Patient';
  }
  if (patientType === 'NEW_DEPENDENT' && newDependentData) {
    return [
      newDependentData.firstName,
      newDependentData.middleName,
      newDependentData.lastName,
      newDependentData.suffix
    ].filter(Boolean).join(' ').trim() || 'Family Member';
  }
  if (patientType === 'EXISTING_DEPENDENT' && selectedDependentId && userDependents) {
    const dep = userDependents.find((d) => d.id === selectedDependentId);
    if (dep) {
      return [
        dep.firstName,
        dep.middleName,
        dep.lastName,
        dep.suffix
      ].filter(Boolean).join(' ').trim() || 'Family Member';
    }
  }
  return 'Patient';
};

export const getPatientRelationship = (
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT',
  selectedDependentId: string | null,
  newDependentData: NewDependentInput | null,
  userDependents?: DependentProfileDto[]
): string | null => {
  if (patientType === 'SELF') return null;
  if (patientType === 'NEW_DEPENDENT' && newDependentData) {
    return newDependentData.relationship || 'Dependent';
  }
  if (patientType === 'EXISTING_DEPENDENT' && selectedDependentId && userDependents) {
    const dep = userDependents.find((d) => d.id === selectedDependentId);
    return dep?.relationship || 'Dependent';
  }
  return 'Dependent';
};
