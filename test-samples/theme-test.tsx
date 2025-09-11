/**
 * ESLint Theme Enforcement テストファイル
 */

import React from 'react';
import { colors } from '@/config/theme'; // ✅ OK: theme import

export function TestComponent() {
  return (
    <div>
      {/* ✅ OK: theme使用 */}
      <button className={colors.primary.DEFAULT}>
        OK Button
      </button>

      {/* ❌ NG: 直接色指定 */}
      <button className="bg-red-500 text-white">
        Error Button
      </button>

      {/* ❌ NG: テンプレートリテラル内の直接色 */}
      <div className={`text-blue-600 font-bold`}>
        Template Error
      </div>

      {/* ❌ NG: ダークモード個別指定 */}
      <div className="bg-white dark:bg-gray-900">
        Dark Mode Error
      </div>

      {/* ❌ NG: ホバー個別指定 */}
      <button className="hover:bg-orange-500">
        Hover Error
      </button>

      {/* ✅ OK: 許可パターン */}
      <div className="flex items-center justify-center w-full h-screen p-4">
        Layout OK
      </div>
    </div>
  );
}

// ❌ NG: themeインポートなしで色使用
export function NoImportComponent() {
  return (
    <div className="bg-purple-600">
      No Import Error
    </div>
  );
}