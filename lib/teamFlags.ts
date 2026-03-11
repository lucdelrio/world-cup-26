const TEAM_TO_ISO2: Record<string, string> = {
  argentina: 'AR',
  australia: 'AU',
  belgium: 'BE',
  brazil: 'BR',
  cameroon: 'CM',
  canada: 'CA',
  chile: 'CL',
  colombia: 'CO',
  croatia: 'HR',
  denmark: 'DK',
  ecuador: 'EC',
  egypt: 'EG',
  england: 'GB',
  france: 'FR',
  germany: 'DE',
  ghana: 'GH',
  iran: 'IR',
  'ir iran': 'IR',
  iraq: 'IQ',
  italy: 'IT',
  japan: 'JP',
  mexico: 'MX',
  morocco: 'MA',
  netherlands: 'NL',
  'new zealand': 'NZ',
  nigeria: 'NG',
  norway: 'NO',
  paraguay: 'PY',
  peru: 'PE',
  poland: 'PL',
  portugal: 'PT',
  qatar: 'QA',
  'republic of ireland': 'IE',
  'saudi arabia': 'SA',
  scotland: 'GB',
  senegal: 'SN',
  serbia: 'RS',
  spain: 'ES',
  sweden: 'SE',
  switzerland: 'CH',
  tunisia: 'TN',
  turkey: 'TR',
  'united states': 'US',
  usa: 'US',
  uruguay: 'UY',
  venezuela: 'VE',
  wales: 'GB',
  albania: 'AL',
  algeria: 'DZ',
  austria: 'AT',
  'bosnia and herzegovina': 'BA',
  'costa rica': 'CR',
  'czech republic': 'CZ',
  czechia: 'CZ',
  finland: 'FI',
  greece: 'GR',
  honduras: 'HN',
  iceland: 'IS',
  israel: 'IL',
  'ivory coast': 'CI',
  "cote d'ivoire": 'CI',
  jordan: 'JO',
  korea: 'KR',
  'south korea': 'KR',
  'korea republic': 'KR',
  mali: 'ML',
  panama: 'PA',
  romania: 'RO',
  slovakia: 'SK',
  slovenia: 'SI',
  ukraine: 'UA',
  'united arab emirates': 'AE',
};

const UNKNOWN_FLAG = '\u{1F3F3}\uFE0F';

function normalizeTeamName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.]/g, '')
    .trim()
    .toLowerCase();
}

function isoToFlagEmoji(iso2: string): string {
  if (!/^[A-Z]{2}$/.test(iso2)) return UNKNOWN_FLAG;
  const base = 0x1f1e6;
  const first = base + (iso2.charCodeAt(0) - 65);
  const second = base + (iso2.charCodeAt(1) - 65);
  return String.fromCodePoint(first, second);
}

export function getTeamIso2(teamName: string): string | null {
  const key = normalizeTeamName(teamName);
  return TEAM_TO_ISO2[key] ?? null;
}

export function getTeamFlagImageUrl(teamName: string): string | null {
  const iso2 = getTeamIso2(teamName);
  if (!iso2) return null;
  return `https://flagcdn.com/w40/${iso2.toLowerCase()}.png`;
}

export function getTeamFlag(teamName: string): string {
  const key = normalizeTeamName(teamName);
  const iso2 = TEAM_TO_ISO2[key];
  if (!iso2) return UNKNOWN_FLAG;
  return isoToFlagEmoji(iso2);
}

export function withTeamFlag(teamName: string): string {
  return `${getTeamFlag(teamName)} ${teamName}`;
}
