// src/hooks/useCompany.ts
import { useState, useEffect } from 'react'

interface CompanyDetails {
  id: number
  name: string
  components: string[]
  devices: string[]
  details: {
    full_name: string
    logo: string
  }
}

interface Theme {
  id?: number
  companyId?: number
  colorPrimary: string
  colorPrimaryDark: string
  colorFontTitle: string
  colorFontSubtitle: string
  colorWebMenuBackground: string
  colorWebLogoBackground: string
}

interface ThemeProcessed {
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

// Função auxiliar para verificar se a cor é branca ou muito clara
const isWhiteOrVeryLight = (color: string): boolean => {
  if (!color) return false
  
  // Remove # se existir e converte para maiúsculas
  const hex = color.replace('#', '').toUpperCase()
  
  // Se não tiver #, adiciona
  const fullHex = hex.length === 6 ? hex : `${hex}`
  
  const r = parseInt(fullHex.substring(0, 2), 16)
  const g = parseInt(fullHex.substring(2, 4), 16)
  const b = parseInt(fullHex.substring(4, 6), 16)
  
  // Considera branco se todos os valores RGB forem >= 250
  return r >= 250 && g >= 250 && b >= 250
}

// Função para escurecer uma cor
const darkenColor = (color: string, percent: number): string => {
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - (255 * percent / 100))
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - (255 * percent / 100))
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - (255 * percent / 100))
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

// Função para garantir que a cor tenha #
const ensureHex = (color: string): string => {
  if (!color) return '#FFFFFF'
  return color.startsWith('#') ? color : `#${color}`
}

// Função helper para processar o tema e adicionar #
const processTheme = (theme: Theme | null): ThemeProcessed | null => {
  if (!theme) return null

  const primary = ensureHex(theme.colorPrimary)
  const primaryDark = ensureHex(theme.colorPrimaryDark)
  const fontTitle = ensureHex(theme.colorFontTitle)
  const fontSubtitle = ensureHex(theme.colorFontSubtitle)

  return {
    colors: {
      primary,
      primary_dark: primaryDark,
      accent: null,
      font: {
        title: fontTitle,
        subtitle: fontSubtitle
      }
    },
    css_variables: {
      '--color-primary': primary,
      '--color-primary-dark': primaryDark,
      '--color-accent': null,
      '--color-font-title': fontTitle,
      '--color-font-subtitle': fontSubtitle
    }
  }
}

// Função helper para carregar dados do sessionStorage de forma síncrona
const loadFromSessionStorage = () => {
  try {
    const savedCompany = sessionStorage.getItem('companyData')
    const savedTheme = sessionStorage.getItem('theme')
    const savedUser = sessionStorage.getItem('user')
    
    const companyData = savedCompany ? JSON.parse(savedCompany) : null
    const themeData = savedTheme ? JSON.parse(savedTheme) : null
    const userData = savedUser ? JSON.parse(savedUser) : null
    const language = userData?.language || 'en' // Default para 'en' se não tiver
    
    return { companyData, themeData: processTheme(themeData), language }
  } catch (error) {
    console.error('Erro ao carregar dados do sessionStorage:', error)
    return { companyData: null, themeData: null, language: 'en' }
  }
}

export function useCompany() {
  
  // Inicializa os estados com os dados do sessionStorage de forma síncrona
  const [companyData, setCompanyData] = useState<CompanyDetails | null>(() => {
    const { companyData } = loadFromSessionStorage()
    return companyData
  })
  
  const [theme, setTheme] = useState<ThemeProcessed | null>(() => {
    const { themeData } = loadFromSessionStorage()
    return themeData
  })

  const [language, setLanguage] = useState<string>(() => {
    const { language } = loadFromSessionStorage()
    return language
  })

  // Listener para mudanças no sessionStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'companyData' && e.newValue) {
        const parsed = JSON.parse(e.newValue)
        setCompanyData(parsed)
        console.log('🏢 Dados da empresa atualizados:', parsed)
      }
      
      if (e.key === 'theme' && e.newValue) {
        const rawTheme = JSON.parse(e.newValue)
        setTheme(processTheme(rawTheme))
        console.log('🎨 Tema atualizado')
      }

      if (e.key === 'user' && e.newValue) {
        const userData = JSON.parse(e.newValue)
        if (userData?.language) {
          setLanguage(userData.language)
          console.log('🌐 Language atualizado:', userData.language)
        }
      }
    }

    // Escuta mudanças no storage
    window.addEventListener('storage', handleStorageChange)

    // Verifica periodicamente se os dados foram atualizados
    const intervalId = setInterval(() => {
      const { companyData: newCompanyData, themeData: newThemeData, language: newLanguage } = loadFromSessionStorage()
      
      if (newCompanyData && JSON.stringify(newCompanyData) !== JSON.stringify(companyData)) {
        setCompanyData(newCompanyData)
        console.log('🔄 Company data recarregado:', newCompanyData)
      }
      
      if (newThemeData && JSON.stringify(newThemeData) !== JSON.stringify(theme)) {
        setTheme(newThemeData)
        console.log('🔄 Theme recarregado')
      }

      if (newLanguage !== language) {
        setLanguage(newLanguage)
        console.log('🔄 Language recarregado:', newLanguage)
      }
    }, 500) // Verifica a cada 500ms

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [companyData, theme, language])

  // Aplica as variáveis CSS do tema
  useEffect(() => {
    if (theme?.css_variables) {
      const primaryColor = theme.css_variables['--color-primary']
      const fontTitleColor = theme.css_variables['--color-font-title']
      
      // Verifica se a cor primária é branca
      if (isWhiteOrVeryLight(primaryColor) && fontTitleColor) {
        console.log('🎨 Cor primária detectada como branca. Usando cor do título como primária.')
        
        // Aplica a cor do título como primária
        document.documentElement.style.setProperty('--color-primary', fontTitleColor)
        
        // Gera uma versão mais escura para primary-dark
        const darkenedColor = darkenColor(fontTitleColor, 20)
        document.documentElement.style.setProperty('--color-primary-dark', darkenedColor)
        
        // Aplica as outras variáveis normalmente
        Object.entries(theme.css_variables).forEach(([key, value]) => {
          if (key !== '--color-primary' && key !== '--color-primary-dark' && value) {
            document.documentElement.style.setProperty(key, value)
          }
        })
        
        // Gera variações de cor baseadas na cor do título
        generateColorVariations(fontTitleColor)
      } else {
        // Aplica normalmente se não for branca
        Object.entries(theme.css_variables).forEach(([key, value]) => {
          if (value) {
            document.documentElement.style.setProperty(key, value)
          }
        })
        
        // Gera variações da cor primária original
        if (theme?.colors.primary) {
          generateColorVariations(theme.colors.primary)
        }
      }
    }
  }, [theme])

  // Função para gerar variações de cor automaticamente
  const generateColorVariations = (primaryColor: string) => {
    // Converte hex para RGB
    const hexToRgb = (hex: string) => {
      const cleanHex = hex.replace('#', '')
      const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex)
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

  // Função para forçar recarregamento dos dados
  const reloadCompanyData = () => {
    const { companyData: newCompanyData, themeData: newThemeData, language: newLanguage } = loadFromSessionStorage()
    if (newCompanyData) setCompanyData(newCompanyData)
    if (newThemeData) setTheme(newThemeData)
    if (newLanguage) setLanguage(newLanguage)
  }

  return {
    company: companyData,
    companyId: companyData?.id,
    companyName: companyData?.name,
    companyFullName: companyData?.details?.full_name,
    theme,
    primaryColor: theme?.colors.primary,
    logo: companyData?.details?.logo,
    components: companyData?.components || [],
    devices: companyData?.devices || [],
    language, // ← Novo campo
    reloadCompanyData
  }
}