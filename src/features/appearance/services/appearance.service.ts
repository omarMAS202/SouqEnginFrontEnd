import { useAuthStore } from '@/features/auth/store/auth-store'
import { appConfig } from '@/config/app'
import { dataSourceMode } from '@/services/data-source'
import { httpRequest } from '@/services/http-client'
import {
  getStoreAppearance,
  updateStoreAppearance,
  uploadStoreLogo,
} from '@/services/mock-db'

import type {
  AppearanceAssetDto,
  AppearanceResponseDto,
  StoreAppearanceModel,
  StoreThemeDto,
  StoreThemeModel,
  ThemeTemplateDto,
  ThemeTemplateModel,
  UpdateAppearanceInput,
  UpdateStoreThemeInput,
} from '../types/appearance.contracts'
import {
  normalizeAppearanceResponse,
  normalizeStoreTheme,
  normalizeThemeTemplate,
} from '../types/appearance.contracts'

function getAccessToken() {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('Authentication token is missing while loading appearance settings.')
  }

  return accessToken
}

export const appearanceService = {
  async get(storeId: string): Promise<StoreAppearanceModel> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<AppearanceResponseDto>(`/stores/${storeId}/appearance/`, {
        method: 'GET',
        accessToken,
      })

      return normalizeAppearanceResponse(data)
    }

    return getStoreAppearance(storeId)
  },

  async update(storeId: string, input: UpdateAppearanceInput): Promise<StoreAppearanceModel> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<AppearanceResponseDto>(`/stores/${storeId}/appearance/`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({
          appearance: {
            primaryColor: input.primaryColor,
            backgroundColor: input.backgroundColor,
            font: input.font,
            style: input.style,
            logoUrl: input.logoUrl ?? null,
          },
        }),
      })

      return normalizeAppearanceResponse(data)
    }

    return updateStoreAppearance(storeId, input)
  },
  async replace(storeId: string, input: UpdateAppearanceInput): Promise<StoreAppearanceModel> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const { data } = await httpRequest<AppearanceResponseDto>(`/stores/${storeId}/appearance/`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify({
          appearance: {
            primaryColor: input.primaryColor,
            backgroundColor: input.backgroundColor,
            font: input.font,
            style: input.style,
            logoUrl: input.logoUrl ?? null,
          },
        }),
      })

      return normalizeAppearanceResponse(data)
    }

    return updateStoreAppearance(storeId, input)
  },

  async uploadLogo(storeId: string, file: File, alt?: string): Promise<AppearanceAssetDto> {
    if (dataSourceMode === 'backend' && appConfig.apiBaseUrl) {
      const accessToken = getAccessToken()
      const body = new FormData()
      body.append('file', file)

      if (alt?.trim()) {
        body.append('alt', alt.trim())
      }

      const { data } = await httpRequest<AppearanceAssetDto>(`/stores/${storeId}/assets/logo/`, {
        method: 'POST',
        accessToken,
        body,
      })

      return data
    }

    return uploadStoreLogo(storeId, file.name, alt)
  },
  async getTheme(storeId: string): Promise<StoreThemeModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      const appearance = await this.get(storeId)
      return {
        id: storeId,
        storeId,
        themeTemplateId: null,
        themeTemplateName: '',
        themeTemplateDescription: '',
        primaryColor: appearance.primaryColor,
        secondaryColor: appearance.primaryColor,
        fontFamily: appearance.font,
        logoUrl: appearance.logoUrl,
        bannerUrl: null,
        createdAt: null,
        updatedAt: null,
      }
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreThemeDto>(`/stores/${storeId}/theme/`, {
      method: 'GET',
      accessToken,
    })

    return normalizeStoreTheme(data)
  },
  async updateTheme(storeId: string, input: UpdateStoreThemeInput): Promise<StoreThemeModel> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      const appearance = await this.update(storeId, {
        primaryColor: input.primaryColor ?? '#243b77',
        backgroundColor: '#f8fafc',
        font: input.fontFamily ?? 'system',
        style: 'modern',
        logoUrl: input.logoUrl ?? null,
      })

      return {
        id: storeId,
        storeId,
        themeTemplateId: input.themeTemplate !== undefined && input.themeTemplate !== null ? String(input.themeTemplate) : null,
        themeTemplateName: '',
        themeTemplateDescription: '',
        primaryColor: appearance.primaryColor,
        secondaryColor: input.secondaryColor ?? appearance.primaryColor,
        fontFamily: input.fontFamily ?? appearance.font,
        logoUrl: input.logoUrl ?? appearance.logoUrl,
        bannerUrl: input.bannerUrl ?? null,
        createdAt: null,
        updatedAt: null,
      }
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<StoreThemeDto>(`/stores/${storeId}/theme/`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify({
        theme_template: input.themeTemplate ?? null,
        primary_color: input.primaryColor,
        secondary_color: input.secondaryColor,
        font_family: input.fontFamily,
        logo_url: input.logoUrl ?? null,
        banner_url: input.bannerUrl ?? null,
      }),
    })

    return normalizeStoreTheme(data)
  },
  async listThemeTemplates(storeId: string): Promise<ThemeTemplateModel[]> {
    if (dataSourceMode !== 'backend' || !appConfig.apiBaseUrl) {
      return []
    }

    const accessToken = getAccessToken()
    const { data } = await httpRequest<ThemeTemplateDto[]>(`/stores/${storeId}/themes/templates/`, {
      method: 'GET',
      accessToken,
    })

    return data.map((template) => normalizeThemeTemplate(template))
  },
}
