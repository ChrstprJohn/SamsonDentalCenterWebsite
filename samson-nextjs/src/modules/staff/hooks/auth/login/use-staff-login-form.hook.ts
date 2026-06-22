'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffLoginSchema, StaffLoginDto } from '../../../dtos/auth/staff-login.dto';

export function useStaffLoginForm() {
  return useForm<StaffLoginDto>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
}
