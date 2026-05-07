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

export type AIBackendDraftWorkflowStatus =
  | 'processing'
  | 'needs_clarification'
  | 'draft_ready'
  | 'failed'
  | 'applied'

export interface AIDraftClarificationQuestion {
  id: string
  label: string
  prompt: string
  placeholder: string
  options?: string[]
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
  rawAiResponse: GeneratedStore | AIBackendDraftPayload | null
  runtime: StorefrontRuntime
  rawPayload: AiGeneratedStorefrontPayload
  persistedPayload: AiGeneratedStorefrontPayload | null
  validation: AIDraftValidationResult
  metadata: DraftResourceMetadata & AuditMetadata
  backendStatus?: AIBackendDraftWorkflowStatus | null
  backendIsFallback?: boolean
  backendReason?: string | null
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

export interface AIBackendDraftPayload {
  store: {
    name?: string
    description?: string
  }
  store_settings: {
    currency?: string
    language?: 'en' | 'ar' | string
    timezone?: string
  }
  theme: {
    theme_template?: string
    primary_color?: string
    secondary_color?: string
    font_family?: string
    logo_url?: string
    banner_url?: string
  }
  categories: Array<{
    name?: string
    description?: string
  }>
  products: Array<{
    name?: string
    description?: string
    price?: number
    sku?: string
    category_name?: string
    stock_quantity?: number
    image_url?: string
  }>
  clarification_needed: boolean
  clarification_questions: Array<{
    question_key?: string
    question_text?: string
    options?: string[]
  }>
}

export interface AIBackendDraftStateResponse {
  store_id: number
  draft_payload: AIBackendDraftPayload
  draft_metadata: Record<string, unknown> & {
    status?: AIBackendDraftWorkflowStatus
    mode?: 'clarification' | 'draft_ready'
    request_id?: string | null
    draft_id?: string | null
    expires_at?: string | null
    confirmed_at?: string | null
    audit_id?: string | null
    actor_id?: string | null
    actor_type?: 'merchant' | 'admin' | 'system' | 'ai' | null
    created_at?: string | null
  }
}

export interface AIBackendApplyDraftResponse {
  store_id: number
  final_status: string
  store_core_applied: boolean
  categories: {
    created: string[]
    skipped: string[]
  }
  products: {
    created: string[]
    skipped: string[]
  }
  draft_cleanup_scheduled: boolean
}
