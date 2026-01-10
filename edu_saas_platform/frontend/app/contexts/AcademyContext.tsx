'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { settingsApi, getMediaUrl } from '../lib/api'

interface AcademySettings {
  academy_name: string
  logo: string | null
  primary_color: string
  secondary_color: string
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
  email: string
  phone: string
  address: string
  whatsapp_number: string
  facebook_url: string
  youtube_url: string
}

// Default values (Fallback design)
const defaultSettings: AcademySettings = {
  academy_name: 'AP Learning',
  logo: null,
  primary_color: '#2563eb', // Blue
  secondary_color: '#7c3aed', // Purple
  hero_title: 'Learn Without Limits',
  hero_subtitle: 'Start your journey today with our expert courses.',
  hero_image: null,
  email: 'info@academy.lk',
  phone: '+94 77 123 4567',
  address: 'Colombo, Sri Lanka',
  whatsapp_number: '',
  facebook_url: '',
  youtube_url: ''
}

const AcademyContext = createContext<{ settings: AcademySettings; loading: boolean }>({
  settings: defaultSettings,
  loading: true
})

export function AcademyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AcademySettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get()
        // Process images with getMediaUrl
        const processed = {
            ...data,
            logo: data.logo ? getMediaUrl(data.logo) : null,
            hero_image: data.hero_image ? getMediaUrl(data.hero_image) : null
        }
        setSettings(processed)
        
        // ✅ Apply CSS Variables for Gradients
        document.documentElement.style.setProperty('--primary', data.primary_color)
        document.documentElement.style.setProperty('--secondary', data.secondary_color)
      } catch (e) {
        console.error("Using default settings", e)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  return (
    <AcademyContext.Provider value={{ settings, loading }}>
      {children}
    </AcademyContext.Provider>
  )
}

export const useAcademy = () => useContext(AcademyContext)