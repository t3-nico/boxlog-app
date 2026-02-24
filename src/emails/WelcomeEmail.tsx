/**
 * Welcome Email Template
 * 新規ユーザー登録時のウェルカムメール
 */

import { Body, Button, Container, Head, Html, Link, Section, Text } from '@react-email/components';

export interface WelcomeEmailProps {
  userName: string;
  appUrl?: string;
}

export function WelcomeEmail({ userName, appUrl = 'https://dayopt.app' }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Welcome to Dayopt! 🎉</Text>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Thank you for joining Dayopt. We&apos;re excited to help you manage your time more
              effectively.
            </Text>
            <Text style={paragraph}>
              Dayopt is a time management tool that combines task planning, time tracking, and
              calendar views to help you optimize your daily schedule.
            </Text>
            <Button style={button} href={`${appUrl}/calendar`}>
              Get Started
            </Button>
            <Text style={paragraph}>
              If you have any questions, feel free to reach out to our support team at{' '}
              <Link style={link} href="mailto:support@dayopt.app">
                support@dayopt.app
              </Link>
            </Text>
            <Text style={footer}>
              Best regards,
              <br />
              The Dayopt Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const section = {
  padding: '0 48px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
};

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
};

const footer = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#898989',
  marginTop: '32px',
};
