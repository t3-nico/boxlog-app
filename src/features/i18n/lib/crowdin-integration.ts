/**
 * Crowdin統合システム
 * BoxLog翻訳管理プラットフォームとしてCrowdin連携機能を提供
 */

interface CrowdinConfig {
  projectId: string
  apiToken: string
  organizationDomain?: string | undefined
  sourceLanguage: string
  targetLanguages: string[]
  baseUrl?: string | undefined
}

interface CrowdinTranslation {
  key: string
  sourceText: string
  targetText: string
  language: string
  approved: boolean
  reviewStatus: 'pending' | 'approved' | 'rejected'
  lastModified: Date
}

interface CrowdinUploadResponse {
  fileId: number
  fileName: string
  uploadedKeys: number
  errors?: string[]
}

/** Crowdin API language progress response item */
interface CrowdinLanguageProgressItem {
  data: {
    languageId: string
    translationProgress: number
    approvalProgress: number
    phrases: number
  }
}

/** Crowdin API translation item */
interface CrowdinTranslationItem {
  data: {
    key: string
    text: string
    translation: string
    language: string
    isApproved: boolean
    updatedAt: string
  }
}

/** Crowdin webhook event */
interface CrowdinWebhookEvent {
  event: string
  project: { id: string; name: string }
  file?: { id: string; name: string }
  language?: string
  translation?: { text: string; approved: boolean }
}

/**
 * Crowdin API統合クラス
 * 翻訳データの同期、レビューワークフロー管理を提供
 */
export class CrowdinIntegration {
  private config: CrowdinConfig
  private apiBaseUrl: string

  constructor(config: CrowdinConfig) {
    this.config = config
    this.apiBaseUrl = config.baseUrl || 'https://api.crowdin.com/api/v2'
  }

  /**
   * 翻訳キーをCrowdinにアップロード
   * BoxLogの翻訳データをCrowdinプロジェクトに同期
   */
  async uploadTranslations(filePath: string, fileContent: string): Promise<CrowdinUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('name', filePath)
      formData.append('content', fileContent)
      formData.append('type', 'json')

      const response = await fetch(`${this.apiBaseUrl}/projects/${this.config.projectId}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Crowdin upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        fileId: data.data.id,
        fileName: data.data.name,
        uploadedKeys: data.data.translationKeys || 0,
      }
    } catch (error) {
      console.error('Crowdin upload error:', error)
      throw error
    }
  }

  /**
   * 翻訳データをCrowdinからダウンロード
   * レビュー済みの翻訳をBoxLogに取り込み
   */
  async downloadTranslations(language: string): Promise<Record<string, string>> {
    try {
      // Build creation
      const buildResponse = await fetch(`${this.apiBaseUrl}/projects/${this.config.projectId}/translations/builds`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetLanguageIds: [language],
        }),
      })

      const buildData = await buildResponse.json()
      const buildId = buildData.data.id

      // Wait for build completion
      await this.waitForBuildCompletion(buildId)

      // Download translations
      const downloadResponse = await fetch(
        `${this.apiBaseUrl}/projects/${this.config.projectId}/translations/builds/${buildId}/download`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
        }
      )

      const downloadData = await downloadResponse.json()
      const fileResponse = await fetch(downloadData.data.url)
      const translations = await fileResponse.json()

      return translations
    } catch (error) {
      console.error('Crowdin download error:', error)
      throw error
    }
  }

  /**
   * 翻訳進捗状況の取得
   * 言語別の翻訳完了率、レビュー状況を取得
   */
  async getTranslationProgress(): Promise<
    Array<{
      language: string
      translated: number
      approved: number
      total: number
      progress: number
    }>
  > {
    try {
      const response = await fetch(`${this.apiBaseUrl}/projects/${this.config.projectId}/languages/progress`, {
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
        },
      })

      const data = await response.json()
      return data.data.map((lang: CrowdinLanguageProgressItem) => ({
        language: lang.data.languageId,
        translated: lang.data.translationProgress,
        approved: lang.data.approvalProgress,
        total: lang.data.phrases,
        progress: Math.round(lang.data.translationProgress),
      }))
    } catch (error) {
      console.error('Crowdin progress error:', error)
      throw error
    }
  }

  /**
   * レビュー待ちの翻訳一覧を取得
   * 品質管理プロセスで使用
   */
  async getPendingReviews(language: string): Promise<CrowdinTranslation[]> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/projects/${this.config.projectId}/translations?languageId=${language}&status=0`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
        }
      )

      const data = await response.json()
      return data.data.map((item: CrowdinTranslationItem) => ({
        key: item.data.key,
        sourceText: item.data.text,
        targetText: item.data.translation,
        language: item.data.language,
        approved: item.data.isApproved,
        reviewStatus: item.data.isApproved ? 'approved' : 'pending',
        lastModified: new Date(item.data.updatedAt),
      }))
    } catch (error) {
      console.error('Crowdin pending reviews error:', error)
      throw error
    }
  }

  /**
   * 翻訳の承認・却下
   * レビューワークフローの管理
   */
  async approveTranslation(translationId: number, approve: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/projects/${this.config.projectId}/approvals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translationId,
          [approve ? 'approve' : 'unapprove']: {},
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Crowdin approval error:', error)
      return false
    }
  }

  /**
   * Webhookイベント処理
   * Crowdinから通知されるイベント（翻訳完了、レビュー承認等）を処理
   */
  async handleWebhookEvent(event: CrowdinWebhookEvent): Promise<void> {
    try {
      switch (event.event) {
        case 'translation.updated':
          await this.onTranslationUpdated(event)
          break
        case 'file.approved':
          await this.onFileApproved(event)
          break
        case 'project.built':
          await this.onProjectBuilt(event)
          break
        default:
          console.log('Unhandled Crowdin webhook event:', event.event)
      }
    } catch (error) {
      console.error('Crowdin webhook error:', error)
    }
  }

  private async waitForBuildCompletion(buildId: number): Promise<void> {
    const maxAttempts = 30
    let attempts = 0

    while (attempts < maxAttempts) {
      const response = await fetch(
        `${this.apiBaseUrl}/projects/${this.config.projectId}/translations/builds/${buildId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
        }
      )

      const data = await response.json()
      if (data.data.status === 'finished') {
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
      attempts++
    }

    throw new Error('Build completion timeout')
  }

  private async onTranslationUpdated(event: CrowdinWebhookEvent): Promise<void> {
    // 翻訳更新時の処理
    console.log('Translation updated:', event)
  }

  private async onFileApproved(event: CrowdinWebhookEvent): Promise<void> {
    // ファイル承認時の処理
    console.log('File approved:', event)
  }

  private async onProjectBuilt(event: CrowdinWebhookEvent): Promise<void> {
    // プロジェクトビルド完了時の処理
    console.log('Project built:', event)
  }
}

/**
 * BoxLog用Crowdin設定の初期化
 */
export function createBoxLogCrowdinConfig(): CrowdinConfig {
  return {
    projectId: process.env.CROWDIN_PROJECT_ID || '',
    apiToken: process.env.CROWDIN_API_TOKEN || '',
    organizationDomain: process.env.CROWDIN_ORGANIZATION_DOMAIN,
    sourceLanguage: 'en',
    targetLanguages: ['ja'],
    baseUrl: 'https://api.crowdin.com/api/v2',
  }
}

/**
 * Crowdin統合の初期化
 * BoxLogアプリケーション起動時に使用
 */
export function initializeCrowdinIntegration(): CrowdinIntegration {
  const config = createBoxLogCrowdinConfig()
  return new CrowdinIntegration(config)
}
