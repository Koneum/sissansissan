// Service de traduction automatique
// Supporte : Google Translate API, DeepL API, OpenAI

type TranslationProvider = 'google' | 'deepl' | 'openai' | 'libre'

interface TranslationConfig {
  provider: TranslationProvider
  apiKey?: string
  sourceLanguage: string
  targetLanguages: string[]
}

const config: TranslationConfig = {
  provider: (process.env.TRANSLATION_PROVIDER as TranslationProvider) || 'libre',
  apiKey: process.env.TRANSLATION_API_KEY,
  sourceLanguage: 'fr', // Langue par défaut du contenu
  targetLanguages: ['en', 'ar'] // Langues cibles
}

/**
 * Traduit un texte vers une langue cible
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = config.sourceLanguage
): Promise<string> {
  if (!text || text.trim() === '') return text
  if (sourceLang === targetLang) return text

  try {
    switch (config.provider) {
      case 'google':
        return await translateWithGoogle(text, targetLang, sourceLang)
      case 'deepl':
        return await translateWithDeepL(text, targetLang, sourceLang)
      case 'openai':
        return await translateWithOpenAI(text, targetLang, sourceLang)
      case 'libre':
        return await translateWithLibreTranslate(text, targetLang, sourceLang)
      default:
        return text
    }
  } catch (error) {
    console.error('Translation error:', error)
    return text // Retourne le texte original en cas d'erreur
  }
}

/**
 * Traduit un objet vers toutes les langues configurées
 */
export async function translateContent(content: Record<string, any>): Promise<Record<string, any>> {
  const translations: Record<string, any> = {
    [config.sourceLanguage]: content
  }

  for (const targetLang of config.targetLanguages) {
    const translatedContent: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string') {
        translatedContent[key] = await translateText(value, targetLang)
      } else {
        translatedContent[key] = value // Garde les valeurs non-textuelles
      }
    }
    
    translations[targetLang] = translatedContent
  }

  return translations
}

// === GOOGLE TRANSLATE API ===
async function translateWithGoogle(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  if (!config.apiKey) {
    console.warn('Google Translate API key not configured')
    return text
  }

  const url = `https://translation.googleapis.com/language/translate/v2?key=${config.apiKey}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    })
  })

  if (!response.ok) {
    throw new Error(`Google Translate error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data.translations[0].translatedText
}

// === DEEPL API ===
async function translateWithDeepL(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  if (!config.apiKey) {
    console.warn('DeepL API key not configured')
    return text
  }

  const url = 'https://api-free.deepl.com/v2/translate'
  
  const params = new URLSearchParams({
    auth_key: config.apiKey,
    text: text,
    source_lang: sourceLang.toUpperCase(),
    target_lang: targetLang.toUpperCase()
  })

  const response = await fetch(`${url}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`DeepL error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.translations[0].text
}

// === OPENAI API ===
async function translateWithOpenAI(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  if (!config.apiKey) {
    console.warn('OpenAI API key not configured')
    return text
  }

  const langNames: Record<string, string> = {
    en: 'English',
    fr: 'French',
    ar: 'Arabic',
    es: 'Spanish',
    de: 'German'
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${langNames[sourceLang]} to ${langNames[targetLang]}. Return ONLY the translated text, nothing else.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// === LIBRETRANSLATE (Gratuit, open-source) ===
async function translateWithLibreTranslate(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  // Utilise l'instance publique gratuite (peut être lente)
  // Pour production, hébergez votre propre instance
  const url = 'https://libretranslate.com/translate'
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    })
  })

  if (!response.ok) {
    throw new Error(`LibreTranslate error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.translatedText
}

/**
 * Traduit un batch de textes (optimisation)
 */
export async function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang: string = config.sourceLanguage
): Promise<string[]> {
  // Pour l'instant, traduit séquentiellement
  // À optimiser avec des requêtes batch selon l'API utilisée
  const translations = await Promise.all(
    texts.map(text => translateText(text, targetLang, sourceLang))
  )
  return translations
}

export { config as translationConfig }




