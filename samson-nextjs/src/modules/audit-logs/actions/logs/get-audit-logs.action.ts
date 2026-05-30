"use server";

import { z } from 'zod';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { DomainError } from '@/shared/errors';
import { GetAuditLogsDto, getAuditLogsSchema } from '../../dtos/logs/get-audit-logs.dto';
import { AuditLogQueries } from '../../repositories/logs/audit-log.queries';
import { GetAuditLogsUseCase } from '../../use-cases/logs/get-audit-logs.use-case';

export async function getAuditLogsAction(filters?: GetAuditLogsDto) {
  try {
    // Only admins are authorized to read audit logs
    await authorizeRole('ADMIN');

    let parsed: GetAuditLogsDto | undefined;
    if (filters) {
      parsed = getAuditLogsSchema.parse(filters);
    }

    const supabase = await createClient();
    const queries = new AuditLogQueries(supabase);
    const useCase = new GetAuditLogsUseCase(queries);

    const logs = await useCase.execute(parsed);
    return { success: true, data: logs };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.issues[0].message };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
