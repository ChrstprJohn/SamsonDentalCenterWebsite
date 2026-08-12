import { SecretaryEmailDesignStudioView } from '@/modules/staff/views/secretary/secretary-email-design-studio-view';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

export const metadata = {
  title: 'Email Templates | Samson Dental Center',
};

export default async function EmailDesignsPage() {
  let initialConfig: ClinicConfigResponseDto | null = null;

  try {
    const configResponse = await getClinicConfigAction();
    if (configResponse && 'data' in configResponse && configResponse.data) {
      initialConfig = configResponse.data;
    }
  } catch (err) {
    console.error('Failed to load clinic configurations on email template page:', err);
  }

  return <SecretaryEmailDesignStudioView initialConfig={initialConfig} />;
}