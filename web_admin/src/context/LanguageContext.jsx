import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('lang') || 'en'
  )

  const setLang = (newLang) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useT() {
  return useContext(LanguageContext).t
}

export function useLang() {
  const { lang, setLang } = useContext(LanguageContext)
  return { lang, setLang }
}
