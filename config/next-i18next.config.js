module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en', // English
      'es', // Spanish
      'fr', // French
      'de', // German
      'it', // Italian
      'pt', // Portuguese
      'ru', // Russian
      'ja', // Japanese
      'ko', // Korean
      'zh', // Chinese
      'ar', // Arabic
      'hi', // Hindi
      'th', // Thai
      'vi', // Vietnamese
      'tr', // Turkish
      'nl', // Dutch
      'sv', // Swedish
      'da', // Danish
      'no', // Norwegian
      'fi', // Finnish
      'pl', // Polish
      'cs', // Czech
      'hu', // Hungarian
      'ro', // Romanian
      'bg', // Bulgarian
      'hr', // Croatian
      'sk', // Slovak
      'sl', // Slovenian
      'et', // Estonian
      'lv', // Latvian
      'lt', // Lithuanian
      'mt', // Maltese
      'cy', // Welsh
      'ga', // Irish
      'is', // Icelandic
      'mk', // Macedonian
      'sq', // Albanian
      'sr', // Serbian
      'bs', // Bosnian
      'uk', // Ukrainian
      'be', // Belarusian
      'kk', // Kazakh
      'ky', // Kyrgyz
      'tg', // Tajik
      'tk', // Turkmen
      'uz', // Uzbek
      'mn', // Mongolian
      'my', // Burmese
      'km', // Khmer
      'lo', // Lao
      'si', // Sinhala
      'ta', // Tamil
      'te', // Telugu
      'ml', // Malayalam
      'kn', // Kannada
      'gu', // Gujarati
      'pa', // Punjabi
      'ur', // Urdu
      'fa', // Persian
      'he', // Hebrew
      'am', // Amharic
      'sw', // Swahili
      'zu', // Zulu
      'af', // Afrikaans
      'id', // Indonesian
      'ms', // Malay
      'tl', // Filipino
      'bn', // Bengali
      'ne', // Nepali
      'bo', // Tibetan
      'yi', // Yiddish
      'jw', // Javanese
      'su', // Sundanese
      'ceb', // Cebuano
      'hmn', // Hmong
      'co', // Corsican
      'eo', // Esperanto
      'la', // Latin
      'gd', // Scottish Gaelic
      'fy', // Frisian
      'lb', // Luxembourgish
      'eu', // Basque
      'ca', // Catalan
      'gl', // Galician
    ],
    localeDetection: true,
    domains: [
      {
        domain: 'localhost',
        defaultLocale: 'en',
      },
    ],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  saveMissing: false,
  strictMode: true,
  serializeConfig: false,
  react: {
    useSuspense: false,
  },
} 