/**
 * 国際規格準拠テストファイル
 * 各種コンプライアンス違反のサンプル
 */

import React from 'react';

// ❌ GDPR違反: 個人データのログ出力
console.log('User data:', {
  email: 'user@example.com',
  phone: '+81-90-1234-5678'
});

// ❌ SOC 2違反: ハードコードされたシークレット
const API_KEY = 'sk-1234567890abcdef';
const DATABASE_PASSWORD = 'admin123';

// ❌ セキュリティ違反: HTTPでの個人データ送信
fetch('http://unsecure-api.com/users', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    creditCard: '1234-5678-9012-3456'
  })
});

// ❌ WCAG違反: アクセシビリティ不備
export const ComplianceTestComponent = () => {
  const handleSubmit = () => {
    // ❌ 監査ログなしの重要操作
    deleteUserData();
  };

  return (
    <div>
      {/* ❌ alt属性なし */}
      <img src="/chart.png" />
      
      {/* ❌ ラベル関連付けなし */}
      <input type="email" />
      <span>メールアドレス</span>
      
      {/* ❌ キーボードイベントなし */}
      <div onClick={handleSubmit}>
        重要な操作
      </div>
      
      {/* ❌ ボタンの役割不明 */}
      <button onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

// ❌ データ保持期間未指定
function saveUserData(userData: any) {
  localStorage.setItem('userData', JSON.stringify(userData));
  // retentionPeriod の指定なし
}

// ❌ 同意確認なしのトラッキング
function trackUserBehavior(data: any) {
  analytics.track('user_action', data);
  // hasConsent() チェックなし
}

// ❌ 削除機能なし
// deleteUserData, bulkDelete などの実装がない

function deleteUserData() {
  // 実装なし
}