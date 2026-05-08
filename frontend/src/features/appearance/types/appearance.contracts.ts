export interface StoreAppearanceDto {
  primaryColor?: string | null
  backgroundColor?: string | null
  font?: string | null
  style?: string | null
  logoUrl?: string | null
}

export interface AppearanceResponseDto {
  store_id: string | number
  appearance: StoreAppearanceDto
}

export interface AppearanceAssetDto {
  asset_id: string
  url: string
  alt?: string | null
  mime_type?: string | null
}

export interface StoreAppearanceModel {
  storeId: string
  primaryColor: string
  backgroundColor: string
  font: string
  style: string
  logoUrl: string | null
}

export interface UpdateAppearanceInput {
  primaryColor: string
  backgroundColor: string
  font: string
  style: string
  logoUrl?: string | null
}

export interface ThemeTemplateDto {
  id: string | number
  name?: string | null
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ThemeTemplateModel {
  id: string
  name: string
  description: string
  createdAt: string | null
  updatedAt: string | null
}

export interface StoreThemeDto {
  id: string | number
  store: string | number
  theme_template?: ThemeTemplateDto | null
  primary_color?: string | null
  secondary_color?: string | null
  font_family?: string | null
  logo_url?: string | null
  banner_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface StoreThemeModel {
  id: string
  storeId: string
  themeTemplateId: string | null
  themeTemplateName: string
  themeTemplateDescription: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  logoUrl: string | null
  bannerUrl: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface UpdateStoreThemeInput {
  themeTemplate?: string | number | null
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  logoUrl?: string | null
  bannerUrl?: string | null
}

export function normalizeAppearanceResponse(dto: AppearanceResponseDto): StoreAppearanceModel {
  return {
    storeId: String(dto.store_id),
    primaryColor: dto.appearance.primaryColor ?? '#243b77',
    backgroundColor: dto.appearance.backgroundColor ?? '#f8fafc',
    font: dto.appearance.font ?? 'system',
    style: dto.appearance.style ?? 'modern',
    logoUrl: dto.appearance.logoUrl ?? null,
  }
}

export function normalizeThemeTemplate(dto: ThemeTemplateDto): ThemeTemplateModel {
  return {
    id: String(dto.id),
    name: dto.name ?? 'Template',
    description: dto.description ?? '',
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

export function normalizeStoreTheme(dto: StoreThemeDto): StoreThemeModel {
  return {
    id: String(dto.id),
    storeId: String(dto.store),
    themeTemplateId:
      dto.theme_template?.id !== undefined && dto.theme_template?.id !== null
        ? String(dto.theme_template.id)
        : null,
    themeTemplateName: dto.theme_template?.name ?? '',
    themeTemplateDescription: dto.theme_template?.description ?? '',
    primaryColor: dto.primary_color ?? '#243b77',
    secondaryColor: dto.secondary_color ?? '#c67f4d',
    fontFamily: dto.font_family ?? 'system',
    logoUrl: dto.logo_url ?? null,
    bannerUrl: dto.banner_url ?? null,
    createdAt: dto.created_at ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}
