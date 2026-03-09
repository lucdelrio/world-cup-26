/**
 * Fetches the 2026 World Cup fixture from an external source.
 * 1. EXPO_PUBLIC_FIXTURE_JSON_URL → JSON array of matches
 * 2. EXPO_PUBLIC_API_FOOTBALL_KEY → API-Football (api-sports.io)
 */

import type { Match } from './types';

const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2026;
const CACHE_TTL_MS = 60 * 60 * 1000;
let cached: { matches: Match[]; fetchedAt: number } | null = null;

function getCustomUrl(): string | undefined {
  return typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIXTURE_JSON_URL
    ? process.env.EXPO_PUBLIC_FIXTURE_JSON_URL
    : undefined;
}

function getApiKey(): string | undefined {
  return typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_FOOTBALL_KEY
    ? process.env.EXPO_PUBLIC_API_FOOTBALL_KEY
    : undefined;
}

/** Expected JSON shape for custom URL: array of matches.
 * Supports multiple schemas, including:
 * - Custom: { id, homeTeam, awayTeam, date, venue, city, stage, homeGoals, awayGoals, status }
 * - FixtureDownload: { MatchNumber, DateUtc, Location, HomeTeam, AwayTeam, Group, HomeTeamScore, AwayTeamScore }
 */
function parseCustomJson(data: unknown): Match[] {
  if (!Array.isArray(data)) throw new Error('JSON must be an array of matches');
  const matches: Match[] = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i] as Record<string, unknown>;
    const id = String(row?.id ?? row?.fixtureId ?? row?.MatchNumber ?? i);
    const homeTeam = String(row?.homeTeam ?? row?.home_team ?? row?.HomeTeam ?? '');
    const awayTeam = String(row?.awayTeam ?? row?.away_team ?? row?.AwayTeam ?? '');
    const date = String(row?.date ?? row?.datetime ?? row?.DateUtc ?? '');
    if (!homeTeam || !awayTeam || !date) continue;
    const d = new Date(date);
    const homeScore =
      row?.homeGoals != null
        ? Number(row.homeGoals)
        : row?.HomeTeamScore != null
        ? Number(row.HomeTeamScore)
        : null;
    const awayScore =
      row?.awayGoals != null
        ? Number(row.awayGoals)
        : row?.AwayTeamScore != null
        ? Number(row.AwayTeamScore)
        : null;
    const status: Match['status'] =
      homeScore != null && awayScore != null ? 'finished' : 'scheduled';
    matches.push({
      id,
      homeTeam,
      awayTeam,
      date: d.toISOString(),
      time: row?.time as string | undefined,
      venue: (row?.venue as string | undefined) ?? (row?.Location as string | undefined),
      city: row?.city as string | undefined,
      stage: (row?.stage as string | undefined) ?? (row?.Group as string | undefined),
      homeGoals: homeScore,
      awayGoals: awayScore,
      status,
    });
  }
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** API-Football response: { response: [ { fixture, league, teams, goals } ] } */
function parseApiFootballResponse(data: unknown): Match[] {
  const obj = data as { response?: Array<{
    fixture?: { id?: number; date?: string; venue?: { name?: string }; status?: { short?: string } };
    league?: { round?: string };
    teams?: { home?: { name?: string }; away?: { name?: string } };
    goals?: { home?: number | null; away?: number | null };
  }> };
  const list = obj?.response;
  if (!Array.isArray(list)) throw new Error('Invalid API-Football response');
  const matches: Match[] = list.map((item) => {
    const fixture = item?.fixture ?? {};
    const teams = item?.teams ?? {};
    const goals = item?.goals ?? {};
    const dateStr = fixture.date ?? '';
    const statusMap: Record<string, Match['status']> = {
      TBD: 'scheduled', NS: 'scheduled', PST: 'postponed',
      LIVE: 'live', '1H': 'live', HT: 'live', '2H': 'live', ET: 'live', P: 'live',
      FT: 'finished', AET: 'finished', PEN: 'finished',
    };
    const status = statusMap[fixture.status?.short ?? ''] ?? 'scheduled';
    return {
      id: String(fixture.id ?? ''),
      homeTeam: teams.home?.name ?? '',
      awayTeam: teams.away?.name ?? '',
      date: dateStr,
      time: dateStr ? new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined,
      venue: fixture.venue?.name,
      stage: item?.league?.round,
      homeGoals: goals.home ?? null,
      awayGoals: goals.away ?? null,
      status,
    };
  });
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function fetchFixture(bypassCache = false): Promise<Match[]> {
  if (!bypassCache && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS)
    return cached.matches;

  const customUrl = getCustomUrl();
  if (customUrl) {
    const res = await fetch(customUrl, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Fixture URL: ${res.status} ${res.statusText}`);
    const data = await res.json();
    const matches = parseCustomJson(data);
    cached = { matches, fetchedAt: Date.now() };
    return matches;
  }

  const apiKey = getApiKey();
  if (apiKey) {
    const url = `https://v3.football.api-sports.io/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`;
    const res = await fetch(url, {
      headers: { 'x-apisports-key': apiKey, Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`API-Football: ${res.status} ${res.statusText}`);
    const data = await res.json();
    const matches = parseApiFootballResponse(data);
    cached = { matches, fetchedAt: Date.now() };
    return matches;
  }

  throw new Error(
    'Configure EXPO_PUBLIC_FIXTURE_JSON_URL or EXPO_PUBLIC_API_FOOTBALL_KEY. See README.'
  );
}

export function getFixtureSource(): 'custom-url' | 'api-football' | null {
  if (getCustomUrl()) return 'custom-url';
  if (getApiKey()) return 'api-football';
  return null;
}

export function clearFixtureCache(): void {
  cached = null;
}
