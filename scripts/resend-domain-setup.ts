/**
 * Resend Domain Setup Script
 * ドメインの追加と検証状態の確認を自動化
 *
 * 使い方:
 * npx tsx scripts/resend-domain-setup.ts
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function setupDomain() {
  const domain = 'dayopt.app';

  console.log(`🔍 Setting up domain: ${domain}`);

  try {
    // 1. ドメインを追加
    console.log('\n📝 Step 1: Adding domain...');
    const createResult = await resend.domains.create({
      name: domain,
    });

    if ('error' in createResult) {
      console.error('❌ Failed to add domain:', createResult.error);
      return;
    }

    console.log('✅ Domain added successfully!');
    console.log('📋 Domain ID:', createResult.data?.id);

    // 2. DNS設定を取得
    console.log('\n📝 Step 2: Fetching DNS records...');
    const domainId = createResult.data?.id;

    if (!domainId) {
      console.error('❌ Domain ID not found');
      return;
    }

    const domainInfo = await resend.domains.get(domainId);

    if ('error' in domainInfo) {
      console.error('❌ Failed to get domain info:', domainInfo.error);
      return;
    }

    console.log('\n📋 DNS Records to Add:');
    console.log('─────────────────────────────────────');

    const records = domainInfo.data?.records || [];

    records.forEach((record, index) => {
      console.log(`\n${index + 1}. ${record.record} Record:`);
      console.log(`   Type:     ${record.type}`);
      console.log(`   Name:     ${record.name}`);
      console.log(`   Value:    ${record.value}`);
      console.log(`   Priority: ${record.priority || 'N/A'}`);
    });

    console.log('\n─────────────────────────────────────');
    console.log('\n⚠️  Next Steps:');
    console.log('1. Add these DNS records to your domain registrar');
    console.log('2. Wait 24-48 hours for DNS propagation');
    console.log('3. Run this script again to verify');

    // 3. 検証状態を確認
    console.log('\n📝 Step 3: Checking verification status...');
    const status = domainInfo.data?.status;

    if (status === 'verified') {
      console.log('✅ Domain is already verified!');
    } else if (status === 'pending') {
      console.log('⏳ Domain verification is pending');
      console.log('   Please add the DNS records and wait for propagation');
    } else {
      console.log(`⚠️  Domain status: ${status}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function verifyDomain() {
  const domain = 'dayopt.app';

  console.log(`🔍 Verifying domain: ${domain}`);

  try {
    // ドメイン一覧を取得
    const domainsResult = await resend.domains.list();

    if ('error' in domainsResult) {
      console.error('❌ Failed to list domains:', domainsResult.error);
      return;
    }

    const domains = domainsResult.data?.data || [];
    const targetDomain = domains.find((d) => d.name === domain);

    if (!targetDomain) {
      console.error(`❌ Domain ${domain} not found`);
      console.log('Run this script without arguments to add the domain first');
      return;
    }

    console.log('\n📋 Domain Information:');
    console.log('─────────────────────────────────────');
    console.log(`Name:      ${targetDomain.name}`);
    console.log(`Status:    ${targetDomain.status}`);
    console.log(`Region:    ${targetDomain.region}`);
    console.log(`Created:   ${targetDomain.created_at}`);
    console.log('─────────────────────────────────────');

    if (targetDomain.status === 'verified') {
      console.log('\n✅ Domain is verified and ready to use!');
      console.log('\n📝 Update your .env.local:');
      console.log(`RESEND_FROM_EMAIL=notifications@${domain}`);
    } else {
      console.log('\n⏳ Domain verification is still pending');
      console.log('Please ensure DNS records are properly configured');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// メイン処理
const command = process.argv[2];

if (command === 'verify') {
  verifyDomain();
} else {
  setupDomain();
}
