import 'server-only';
import { createClient } from '@/shared/database/server';
import { UnauthorizedError } from '@/shared/errors/';

export async function getAuthenticatedUser() {
     const supabase = await createClient();

     const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError('You must be logged in to perform this action.');
  }

  return user;
}

const ROLE_HIERARCHY: Record<string, number> = {
  PATIENT: 1,
  SECRETARY: 2,
  ADMIN: 3,
};

export async function authorizeRole(requiredRole: string) {
  const user = await getAuthenticatedUser();
  const userRole = user.user_metadata?.role as string;

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  if (userLevel < requiredLevel) {
    throw new UnauthorizedError(`Insufficient permissions. Required: ${requiredRole}`);
  }

  return user;
}