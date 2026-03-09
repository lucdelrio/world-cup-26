/**
 * Single match in the 2026 World Cup fixture (unified format from any source).
 */
export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time?: string;
  venue?: string;
  city?: string;
  stage?: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  status?: 'scheduled' | 'live' | 'finished' | 'postponed';
};

export type FixtureSource = 'api-football' | 'custom-url';
