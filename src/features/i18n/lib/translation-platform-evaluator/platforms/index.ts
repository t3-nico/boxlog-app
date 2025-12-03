/**
 * プラットフォーム定義のエクスポート
 */

export { createCrowdinPlatform } from './crowdin'
export { createLingoHubPlatform } from './lingohub'
export { createLokalisePlatform } from './lokalise'
export { createPhrasePlatform } from './phrase'
export { createTransifexPlatform } from './transifex'
export { createWeblatePlatform } from './weblate'

import type { TranslationPlatform } from '../types'

import { createCrowdinPlatform } from './crowdin'
import { createLingoHubPlatform } from './lingohub'
import { createLokalisePlatform } from './lokalise'
import { createPhrasePlatform } from './phrase'
import { createTransifexPlatform } from './transifex'
import { createWeblatePlatform } from './weblate'

/**
 * 全プラットフォームの初期化
 */
export function initializePlatforms(): TranslationPlatform[] {
  return [
    createCrowdinPlatform(),
    createLokalisePlatform(),
    createWeblatePlatform(),
    createPhrasePlatform(),
    createTransifexPlatform(),
    createLingoHubPlatform(),
  ]
}
