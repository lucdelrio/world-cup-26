const translations = {
  en: {
    homeTitle: 'World Cup 2026',
    homeSubtitle: 'Pick a section',
    homeTodaySubtitle: "Today's matches",
    homeTodayLoading: "Loading today's matches...",
    homeTodayErrorTitle: 'Error loading today matches',
    homeTodayErrorFallback: "Could not load today's matches.",
    homeTodayEmpty: 'No matches scheduled for today.',
    menuToday: 'Today',
    menuFixture: 'Fixture',
    menuGroups: 'Groups',
    menuPredictions: 'Predictions',

    groupsTitle: 'World Cup Groups',
    groupsSubtitle: 'Group phase overview',
    groupsLoading: 'Loading groups...',
    groupsErrorTitle: 'Error loading groups',
    groupsErrorFallback: 'Could not load groups.',
    groupsUnknown: 'Unknown Group',
    groupsEmpty: 'No groups available.',
    teamsCount: 'teams',
    matchesCount: 'matches',

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
    roundLabel: 'Round',
    locationLabel: 'Location',
    tbdLabel: 'TBD',
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
    homeTodaySubtitle: 'Partidos de hoy',
    homeTodayLoading: 'Cargando partidos de hoy...',
    homeTodayErrorTitle: 'Error al cargar partidos de hoy',
    homeTodayErrorFallback: 'No se pudieron cargar los partidos de hoy.',
    homeTodayEmpty: 'No hay partidos programados para hoy.',
    menuToday: 'Hoy',
    menuFixture: 'Fixture',
    menuGroups: 'Grupos',
    menuPredictions: 'Predicciones',

    groupsTitle: 'Grupos del Mundial',
    groupsSubtitle: 'Resumen de la fase de grupos',
    groupsLoading: 'Cargando grupos...',
    groupsErrorTitle: 'Error al cargar grupos',
    groupsErrorFallback: 'No se pudieron cargar los grupos.',
    groupsUnknown: 'Grupo desconocido',
    groupsEmpty: 'No hay grupos disponibles.',
    teamsCount: 'equipos',
    matchesCount: 'partidos',

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
    roundLabel: 'Fecha',
    locationLabel: 'Ubicacion',
    tbdLabel: 'Por definir',
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
