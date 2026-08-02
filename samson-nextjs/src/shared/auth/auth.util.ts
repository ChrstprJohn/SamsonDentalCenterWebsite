import 'server-only';
import { createAdminClient, createClient } from '@/shared/database/server';
import { UnauthorizedError } from '@/shared/errors/';

export type TrustedUserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  suffix: string | null;
  avatarUrl: string | null;
  role: 'PATIENT' | 'SECRETARY' | 'DOCTOR' | 'ADMIN';
  isActive: boolean;
  status: string;
};

export async function getAuthenticatedUser() {
     const supabase = await createClient();

     const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError('You must be logged in to perform this action.');
  }

  return user;
}

/**
 * Reads authorization data from the server-owned users table instead of
 * trusting mutable auth user metadata. The admin client is used only on the
 * server for this narrow identity lookup so RLS cannot turn authorization
 * into an accidental self-service permission check.
 */
export async function getTrustedUserProfile(userId: string): Promise<TrustedUserProfile> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, middle_name, suffix, avatar_url, role, is_active, status')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    throw new UnauthorizedError('Your account does not have a valid clinic profile.');
  }

  if (!data.is_active || data.status === 'ARCHIVED') {
    throw new UnauthorizedError('Your clinic account is inactive.');
  }

  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    middleName: data.middle_name ?? null,
    suffix: data.suffix ?? null,
    avatarUrl: data.avatar_url ?? null,
    role: data.role,
    isActive: data.is_active,
    status: data.status,
  };
}

export async function getAuthenticatedUserContext() {
  const user = await getAuthenticatedUser();
  const profile = await getTrustedUserProfile(user.id);
  return { user, profile, role: profile.role };
}

const ROLE_HIERARCHY: Record<string, number> = {
  PATIENT: 1,
  SECRETARY: 2,
  ADMIN: 3,
};

export async function authorizeRole(requiredRole: string) {
  const { user, role: userRole } = await getAuthenticatedUserContext();

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  if (userLevel < requiredLevel) {
    throw new UnauthorizedError(`Insufficient permissions. Required: ${requiredRole}`);
  }

  return user;
}
