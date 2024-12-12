import { TranslateProviderUsageResult } from '@shared/types/provider'

export interface ProviderService {
  usage(): Promise<TranslateProviderUsageResult>
}
