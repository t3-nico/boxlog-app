/**
 * PostgreSQL日時形式診断ツール
 * Supabaseから取得した生データの形式を確認し、ブラウザ間の挙動差を検出
 */

export const debugDateFormat = (label: string, dateValue: any) => {
  console.group(`🔍 DATE DEBUG: ${label}`);
  
  console.log('Raw value:', dateValue);
  console.log('Type:', typeof dateValue);
  
  if (dateValue === null || dateValue === undefined) {
    console.log('⚠️ Value is null or undefined');
    console.groupEnd();
    return;
  }
  
  // 文字列の場合、形式を分析
  if (typeof dateValue === 'string') {
    console.log('String length:', dateValue.length);
    console.log('Contains T:', dateValue.includes('T'));
    console.log('Contains Z:', dateValue.includes('Z'));
    console.log('Contains +:', dateValue.includes('+'));
    console.log('Contains space:', dateValue.includes(' '));
    
    // 各種パースを試みる
    const parseAttempts = [
      { method: 'new Date()', result: null as Date | null, error: null as string | null },
      { method: 'Date.parse()', result: null as number | null, error: null as string | null },
    ];
    
    // new Date()
    try {
      const d = new Date(dateValue);
      parseAttempts[0].result = d;
      console.log('✅ new Date() success:', {
        valid: !isNaN(d.getTime()),
        iso: d.toISOString(),
        local: d.toLocaleString('ja-JP'),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        date: d.getDate(),
        hours: d.getHours(),
        minutes: d.getMinutes(),
        timezoneOffset: d.getTimezoneOffset()
      });
    } catch (e: any) {
      parseAttempts[0].error = e.message;
      console.error('❌ new Date() failed:', e.message);
    }
    
    // Date.parse()
    try {
      const timestamp = Date.parse(dateValue);
      parseAttempts[1].result = timestamp;
      console.log('✅ Date.parse() success:', {
        timestamp,
        valid: !isNaN(timestamp),
        asDate: new Date(timestamp).toISOString()
      });
    } catch (e: any) {
      parseAttempts[1].error = e.message;
      console.error('❌ Date.parse() failed:', e.message);
    }
  }
  
  // ブラウザ情報
  console.log('Browser info:', {
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset()
  });
  
  console.groupEnd();
};

/**
 * PostgreSQL日時形式の検証パターン
 */
export const postgresDatePatterns = {
  // ISO 8601 with timezone
  isoWithTz: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
  
  // ISO 8601 with Z
  isoWithZ: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
  
  // ISO 8601 without timezone
  isoNoTz: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  
  // PostgreSQL timestamp format
  pgTimestamp: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}([+-]\d{2})?$/,
  
  // Date only
  dateOnly: /^\d{4}-\d{2}-\d{2}$/
};

/**
 * どのパターンにマッチするか判定
 */
export const identifyDateFormat = (dateStr: string): string => {
  for (const [name, pattern] of Object.entries(postgresDatePatterns)) {
    if (pattern.test(dateStr)) {
      return name;
    }
  }
  return 'unknown';
};