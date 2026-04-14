import type {
  AiGeneratedStorefrontPayload,
  StorefrontRuntime,
} from '@/features/storefront/types/storefront.types'
import type { AuditMetadata, DraftResourceMetadata } from '@/types/api-contracts'
import type { GeneratedStore } from '@/types/models'

export type AIDraftLifecycleStatus =
  | 'idle'
  | 'submitting'
  | 'clarifying'
  | 'generating'
  | 'generated'
  | 'validation_failed'
  | 'needs_review'
  | 'fallback_required'
  | 'confirmed'
  | 'failed'

export interface AIDraftClarificationQuestion {
  id: string
  label: string
  prompt: string
  placeholder: string
}

export type AIDraftIssueSeverity = 'error' | 'warning'

export interface AIDraftValidationIssue {
  id: string
  path: string
  message: string
  severity: AIDraftIssueSeverity
}

export interface AIDraftValidationResult {
  isValid: boolean
  hasBlockingIssues: boolean
  issues: AIDraftValidationIssue[]
}

export interface StoreDraft {
  draftId: string | null
  requestId: string | null
  storeId: string | null
  prompt: string
  source: 'ai' | 'starter' | 'manual'
  rawAiResponse: GeneratedStore | null
  runtime: StorefrontRuntime
  rawPayload: AiGeneratedStorefrontPayload
  validation: AIDraftValidationResult
  metadata: DraftResourceMetadata & AuditMetadata
}

export interface AIDraftGenerationResponse {
  kind: 'clarification' | 'draft'
  questions?: AIDraftClarificationQuestion[]
  draft?: StoreDraft
}

export interface SubmitAIDraftPromptRequestDto {
  store_id?: string | null
  prompt: string
}

export interface SubmitAIDraftPromptResponseDto extends DraftResourceMetadata, AuditMetadata {
  status: 'clarification_required' | 'processing' | 'draft_ready' | 'failed'
  questions?: AIDraftClarificationQuestion[]
  raw_ai_response?: GeneratedStore | null
}

export interface SaveAIDraftEditsRequestDto extends DraftResourceMetadata {
  store_id?: string | null
  runtime: StorefrontRuntime
}

export interface ConfirmAIDraftRequestDto extends DraftResourceMetadata {
  store_id?: string | null
  confirmed_runtime: StorefrontRuntime
}

export interface AIDraftLifecycleState {
  status: AIDraftLifecycleStatus
  prompt: string
  clarificationQuestions: AIDraftClarificationQuestion[]
  clarificationAnswers: Record<string, string>
  draft: StoreDraft | null
  errorMessage?: string
  previewApplied: boolean
  confirmedAt?: string
}
