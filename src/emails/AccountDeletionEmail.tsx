/**
 * Account Deletion Email Template
 * アカウント削除確認メール (GDPR対応)
 *
 * user.deleteAccount 実行時に送信
 */

import { Body, Container, Head, Html, Link, Section, Text } from '@react-email/components';

import * as styles from './styles';

export interface AccountDeletionEmailProps {
  userName: string;
  deletionDate: string;
  appUrl?: string;
}

export function AccountDeletionEmail({
  userName,
  deletionDate,
  appUrl = 'https://dayopt.app',
}: AccountDeletionEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.section}>
            <Text style={styles.heading}>Account deleted</Text>
            <Text style={styles.paragraph}>Hi {userName || 'there'},</Text>
            <Text style={styles.paragraph}>
              Your Dayopt account has been successfully deleted as of {deletionDate}.
            </Text>
            <Text style={styles.paragraph}>The following data has been permanently removed:</Text>
            <Section style={styles.infoBox}>
              <Text style={{ ...styles.paragraph, margin: '0 0 8px' }}>
                - All plans and time records
              </Text>
              <Text style={{ ...styles.paragraph, margin: '0 0 8px' }}>- Tags and categories</Text>
              <Text style={{ ...styles.paragraph, margin: '0 0 8px' }}>
                - Notification preferences
              </Text>
              <Text style={{ ...styles.paragraph, margin: '0' }}>- Profile information</Text>
            </Section>
            <Text style={styles.paragraph}>
              If you didn&apos;t request this deletion or believe this was a mistake, please contact
              us immediately at{' '}
              <Link style={styles.link} href="mailto:support@dayopt.app">
                support@dayopt.app
              </Link>
              .
            </Text>
            <Text style={styles.paragraph}>
              You&apos;re welcome to create a new account at any time at{' '}
              <Link style={styles.link} href={appUrl}>
                dayopt.app
              </Link>
              .
            </Text>
            <Text style={styles.footer}>
              Thank you for using Dayopt.
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

export default AccountDeletionEmail;
