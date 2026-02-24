/**
 * Welcome Email Template
 * 新規ユーザー登録時のウェルカムメール
 */

import { Body, Button, Container, Head, Html, Link, Section, Text } from '@react-email/components';

import * as styles from './styles';

export interface WelcomeEmailProps {
  userName: string;
  appUrl?: string;
}

export function WelcomeEmail({ userName, appUrl = 'https://dayopt.app' }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.section}>
            <Text style={styles.heading}>Welcome to Dayopt!</Text>
            <Text style={styles.paragraph}>Hi {userName || 'there'},</Text>
            <Text style={styles.paragraph}>
              Thank you for joining Dayopt. We&apos;re excited to help you manage your time more
              effectively.
            </Text>
            <Text style={styles.paragraph}>
              Dayopt is a time management tool that combines task planning, time tracking, and
              calendar views to help you optimize your daily schedule.
            </Text>
            <Button style={styles.button} href={`${appUrl}/calendar`}>
              Get Started
            </Button>
            <Text style={styles.paragraph}>
              If you have any questions, feel free to reach out to our support team at{' '}
              <Link style={styles.link} href="mailto:support@dayopt.app">
                support@dayopt.app
              </Link>
            </Text>
            <Text style={styles.footer}>
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
