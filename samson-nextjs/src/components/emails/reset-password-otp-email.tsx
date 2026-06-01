import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordOtpEmailProps {
  firstName: string;
  otpCode: string;
}

export const ResetPasswordOtpEmail = ({
  firstName = 'Patient',
  otpCode = '123456',
}: ResetPasswordOtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Samson Dental Center Password Reset Code</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              <strong>Samson Dental Center</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We received a request to reset your password. Please use the verification code below to complete the process:
            </Text>
            <Section className="bg-blue-50 rounded-md p-4 my-6 text-center">
              <Text className="text-blue-600 text-[32px] font-bold tracking-[0.2em] m-0">
                {otpCode}
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px] mt-8">
              © {new Date().getFullYear()} Samson Dental Center. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordOtpEmail;
