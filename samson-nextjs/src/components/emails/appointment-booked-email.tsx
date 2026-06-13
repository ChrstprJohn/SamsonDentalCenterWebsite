import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface AppointmentBookedEmailProps {
  patientName: string;
  serviceName: string;
  doctorName: string;
  dateStr: string;
  timeRangeStr: string;
  appointmentId: string;
  dashboardUrl: string;
}

export const AppointmentBookedEmail = ({
  patientName = 'Patient',
  serviceName = 'Dental Treatment',
  doctorName = 'Dr. John Doe',
  dateStr = '2026-06-04',
  timeRangeStr = '09:00 AM - 09:30 AM',
  appointmentId = 'f616dc57-4194-428c-901b-2e30205c97e4',
  dashboardUrl = 'http://localhost:3000/user',
}: AppointmentBookedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>We Received Your Appointment Request</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-sm">
            <Heading className="text-black text-[22px] font-bold text-center p-0 my-[24px] mx-0">
              Samson Dental Center
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {patientName},
            </Text>
            
            <Text className="text-black text-[14px] leading-[24px]">
              We have successfully received your appointment request! Below is a summary of your requested time window:
            </Text>

            <Section className="border border-solid border-[#eaeaea] rounded-lg p-[16px] my-6 bg-slate-50/50">
              <div className="flex justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>Appointment ID:</span>
                <strong style={{ fontSize: '12px', fontFamily: 'monospace' }}>{appointmentId}</strong>
              </div>
              <div className="flex justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>Service:</span>
                <strong style={{ fontSize: '12px' }}>{serviceName}</strong>
              </div>
              <div className="flex justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>Doctor:</span>
                <strong style={{ fontSize: '12px' }}>{doctorName}</strong>
              </div>
              <div className="flex justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>Date:</span>
                <strong style={{ fontSize: '12px' }}>{dateStr}</strong>
              </div>
              <div className="flex justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>Time:</span>
                <strong style={{ fontSize: '12px' }}>{timeRangeStr}</strong>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>Status:</span>
                <span style={{ 
                  color: '#d97706', 
                  backgroundColor: '#fef3c7', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase' 
                }}>
                  Pending Approval
                </span>
              </div>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              Our medical staff is currently reviewing your chosen timeline window against the doctor’s schedule. We will notify you via email as soon as your appointment is approved or if any adjustments are needed.
            </Text>

            <Section className="text-center my-[32px]">
              <Link 
                className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px] inline-block hover:bg-blue-700"
                href={dashboardUrl}
              >
                Go to Dashboard Portal
              </Link>
            </Section>

            <Text className="text-[#666666] text-[12px] leading-[24px] mt-8 text-center">
              © {new Date().getFullYear()} Samson Dental Center. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AppointmentBookedEmail;
