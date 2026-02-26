/**
 * Overdue Plan Email Template
 * プラン期限超過通知メール
 *
 * notification_preferences.enable_email_notifications が有効な場合に送信
 */

import { Body, Button, Container, Head, Html, Link, Section, Text } from '@react-email/components';

import * as styles from './styles';

export interface OverdueEmailProps {
  userName: string;
  planTitle: string;
  endTime: string;
  appUrl?: string;
}

export function OverdueEmail({
  userName,
  planTitle,
  endTime,
  appUrl = 'https://dayopt.app',
}: OverdueEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.section}>
            <Text style={styles.heading}>Plan Overdue</Text>
            <Text style={styles.paragraph}>Hi {userName || 'there'},</Text>
            <Text style={styles.paragraph}>
              The following plan has passed its scheduled end time and hasn&apos;t been completed:
            </Text>
            <Section style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Plan</Text>
              <Text style={styles.infoBoxValue}>{planTitle}</Text>
              <Text style={{ ...styles.infoBoxLabel, marginTop: '12px' }}>Was due by</Text>
              <Text style={styles.infoBoxValue}>{endTime}</Text>
            </Section>
            <Text style={styles.paragraph}>
              You can reschedule this plan or mark it as complete from your calendar.
            </Text>
            <Button style={styles.button} href={`${appUrl}/calendar`}>
              View Calendar
            </Button>
            <Text style={styles.footer}>
              You&apos;re receiving this because you enabled email notifications.{' '}
              <Link style={styles.link} href={`${appUrl}/settings/notifications`}>
                Manage notification settings
              </Link>
              <br />
              <br />
              The Dayopt Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OverdueEmail;
