// Demo-only heuristic scanner. Swap this out for a real API call to the
// trained moderation model once the backend endpoint is ready — the
// analyzeText() signature (text -> { flagged, hits }) can stay the same,
// so nothing calling it needs to change.

const TRIGGER_WORDS = {
  insults: ['stupid', 'idiot', 'dumb', 'loser', 'pathetic', 'worthless', 'ugly', 'freak', 'trash', 'clown'],
  threats: ["beat you up", "watch your back", "you'll regret", 'coming for you', 'hurt you'],
  exclusion: ['nobody likes you', 'no one wants you here', 'go away', 'not welcome', 'get lost'],
};

export function analyzeText(text) {
  const lower = text.toLowerCase();
  const hits = [];

  for (const [category, words] of Object.entries(TRIGGER_WORDS)) {
    for (const word of words) {
      if (lower.includes(word)) hits.push({ category, term: word });
    }
  }

  const shouting = (text.match(/[A-Z]{5,}/g) || []).length > 0 && text.length > 8;
  if (shouting) hits.push({ category: 'tone', term: 'excessive caps / shouting' });

  return {
    flagged: hits.length > 0,
    hits,
  };
}