const translations = {
  en: {
    homeTitle: 'World Cup 2026',
    homeSubtitle: 'Pick a section',
    menuToday: 'Today',
    menuFixture: 'Fixture',
    menuPredictions: 'Predictions',

    todayTitle: 'Today',
    todayDescription: 'Matches scheduled for today will appear here.',

    fixtureTitle: 'Full Fixture',
    fixtureSourceApi: 'Source: API-Football',
    fixtureSourceJson: 'Source: External JSON',
    fixtureLoading: 'Loading fixture...',
    fixtureErrorTitle: 'Error loading matches',
    fixtureErrorFallback: 'Could not load the fixture.',
    retry: 'Retry',
    resultLabel: 'Result',
    emptyFixture: 'No matches available.',

    predictionsTitle: 'Predictions',
    predictionsSubtitle: 'Enter your score prediction for each match.',
    predictionsLoading: 'Loading matches...',
    predictionsErrorTitle: 'Error loading matches',
    predictionsErrorFallback: 'Could not load matches.',
    emptyPredictions: 'No matches available for predictions.',

    defaultStage: 'World Cup 2026',
    versus: 'vs',
  },
  es: {
    homeTitle: 'Mundial 2026',
    homeSubtitle: 'Elegi una seccion',
    menuToday: 'Hoy',
    menuFixture: 'Fixture',
    menuPredictions: 'Predicciones',

    todayTitle: 'Hoy',
    todayDescription: 'Los partidos de hoy apareceran aca.',

    fixtureTitle: 'Fixture completo',
    fixtureSourceApi: 'Fuente: API-Football',
    fixtureSourceJson: 'Fuente: JSON externo',
    fixtureLoading: 'Cargando fixture...',
    fixtureErrorTitle: 'Error al cargar partidos',
    fixtureErrorFallback: 'No se pudo cargar el fixture.',
    retry: 'Reintentar',
    resultLabel: 'Resultado',
    emptyFixture: 'No hay partidos disponibles.',

    predictionsTitle: 'Predicciones',
    predictionsSubtitle: 'Completá tu resultado para cada partido.',
    predictionsLoading: 'Cargando partidos...',
    predictionsErrorTitle: 'Error al cargar partidos',
    predictionsErrorFallback: 'No se pudieron cargar los partidos.',
    emptyPredictions: 'No hay partidos disponibles para pronosticar.',

    defaultStage: 'Mundial 2026',
    versus: 'vs',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];

const currentLanguage: Language = 'en';

export function t(key: TranslationKey, language: Language = currentLanguage): string {
  return translations[language][key] ?? translations.en[key];
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}
