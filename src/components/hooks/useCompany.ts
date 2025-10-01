// src/hooks/useCompany.ts
import { useState, useEffect } from 'react'

interface CompanyDetails {
  id: number
  company_id: number
  full_name: string
  def_address1: string
  def_city: string
  def_state: string
  def_country: string
  def_phone1: string
  web_site: string
  support_email: string
  contact_email: string
  logo_base64?: string
  time_zone: string
  currency: string | null
}

interface Theme {
  colors: {
    primary: string
    primary_dark: string
    accent: string | null
    font: {
      title: string
      subtitle: string
    }
  }
  css_variables: {
    '--color-primary': string
    '--color-primary-dark': string
    '--color-accent': string | null
    '--color-font-title': string
    '--color-font-subtitle': string
  }
}

export function useCompany() {
  const [companyData, setCompanyData] = useState<CompanyDetails | null>(null)
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    // Carrega os dados salvos no sessionStorage
    const savedCompany = sessionStorage.getItem('companyData')
    const savedTheme = sessionStorage.getItem('theme')

    if (savedCompany) {
      const parsed = JSON.parse(savedCompany)
      setCompanyData(parsed.details)
    }

    if (savedTheme) {
      setTheme(JSON.parse(savedTheme))
    }
  }, [])

  // Aplica as variáveis CSS do tema
  useEffect(() => {
    if (theme?.css_variables) {
      Object.entries(theme.css_variables).forEach(([key, value]) => {
        if (value) {
          document.documentElement.style.setProperty(key, value)
        }
      })
    }

    // Se tiver cor primária, gera variações automáticas
    if (theme?.colors.primary) {
      generateColorVariations(theme.colors.primary)
    }
  }, [theme])

  // Função para gerar variações de cor automaticamente
  const generateColorVariations = (primaryColor: string) => {
    // Converte hex para RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    // Converte RGB para Hex
    const rgbToHex = (r: number, g: number, b: number) => {
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }).join('')
    }

    // Clareia ou escurece uma cor
    const adjustBrightness = (rgb: any, percent: number) => {
      return {
        r: Math.max(0, Math.min(255, rgb.r + (255 - rgb.r) * percent)),
        g: Math.max(0, Math.min(255, rgb.g + (255 - rgb.g) * percent)),
        b: Math.max(0, Math.min(255, rgb.b + (255 - rgb.b) * percent))
      }
    }

    const rgb = hexToRgb(primaryColor)
    if (!rgb) return

    // Gera tons mais claros (50 a 400)
    const shades = [
      { name: '50', adjust: 0.95 },
      { name: '100', adjust: 0.9 },
      { name: '200', adjust: 0.75 },
      { name: '300', adjust: 0.5 },
      { name: '400', adjust: 0.25 },
      { name: '500', adjust: 0 },    // Cor original
      { name: '600', adjust: -0.15 },
      { name: '700', adjust: -0.3 },
      { name: '800', adjust: -0.45 },
      { name: '900', adjust: -0.6 },
      { name: '950', adjust: -0.75 }
    ]

    shades.forEach(shade => {
      let color
      if (shade.adjust === 0) {
        color = rgbToHex(rgb.r, rgb.g, rgb.b)
      } else if (shade.adjust > 0) {
        const adjusted = adjustBrightness(rgb, shade.adjust)
        color = rgbToHex(adjusted.r, adjusted.g, adjusted.b)
      } else {
        const factor = 1 + shade.adjust
        color = rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor)
      }
      document.documentElement.style.setProperty(`--color-primary-${shade.name}`, color)
    })
  }

  return {
    company: companyData,
    theme,
    primaryColor: theme?.colors.primary,
    logo: companyData?.logo_base64
  }
}