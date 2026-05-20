// US state code <-> name. Used by search so "Texas" and "TX" both match
// city strings formatted as "Houston, TX".

export const STATE_NAME_BY_CODE: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
};

const STATE_CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_BY_CODE).map(([code, name]) => [
    name.toLowerCase(),
    code,
  ])
);

export function expandLocation(cityField: string): string {
  // Given "Houston, TX" → "houston, tx texas" so a search for "texas" matches.
  const trimmed = cityField.trim();
  const m = trimmed.match(/^(.*?)[,\s]+([A-Za-z]{2})\s*$/);
  if (!m) return trimmed.toLowerCase();
  const code = m[2].toUpperCase();
  const name = STATE_NAME_BY_CODE[code];
  return `${trimmed.toLowerCase()} ${name?.toLowerCase() ?? ''}`.trim();
}

export function stateCodeFromQuery(token: string): string | null {
  const t = token.trim().toLowerCase();
  if (t.length === 2 && STATE_NAME_BY_CODE[t.toUpperCase()]) {
    return t.toUpperCase();
  }
  if (STATE_CODE_BY_NAME[t]) return STATE_CODE_BY_NAME[t];
  return null;
}
