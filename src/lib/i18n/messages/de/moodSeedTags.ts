import type { SeedTagLists } from '../../seedTags.ts';

/**
 * The starter moods' tags, by mood ID (their names are moodSeed.*). These are
 * search terms, not messages: MeTube searches YouTube for a mood's first three
 * tags and matches every tag against video titles and tags as whole words. So
 * write each the way people in this language title and tag videos, lower-case
 * and in its most common form, rather than as a literal translation. Keep genre
 * names, loanwords and names this language uses as they are (lofi, asmr, edm,
 * f1, motogp, esports, speedrun, gameplay, phonk, synthwave, shorts…).
 * `include` is the mood's "More of" list and `exclude` its "Never show" list.
 * They are used only until the user edits that list.
 */
export default {
  energetic: { include: ['highlights', 'rennen', 'hype', 'action'], exclude: ['asmr', 'einschlafen'] },
  chill: { include: ['chill', 'lofi', 'ambient', 'entspannung'], exclude: ['eilmeldung', 'rage'] },
  focus: { include: ['deep house', 'synthwave', 'instrumental', 'mix'], exclude: ['reaktion'] },
  'gaming-music': { include: ['edm', 'frauenstimme'] },
  learn: { include: ['erklärt', 'doku', 'tutorial', 'lore'], exclude: ['shorts'] },

  'energetic-workout': { include: ['workout', 'training', 'fitness', 'motivation'] },
  'energetic-motorsport': { include: ['f1', 'motogp', 'onboard', 'qualifying'] },
  'energetic-hype-music': { include: ['drum and bass', 'phonk', 'hardstyle', 'edm'] },

  'chill-lofi': { include: ['lofi', 'chillhop', 'ambient'] },
  'chill-cozy-games': { include: ['cozy', 'entspannt', 'farming', 'stardew'] },
  'chill-nature': { include: ['natur', 'landschaft', 'spaziergang', 'reise'], exclude: ['drama'] },

  'focus-deep-work': { include: ['lernmusik', 'konzentration', 'klavier', 'ohne gesang'], exclude: ['gesang'] },
  'focus-coding': { include: ['programmieren', 'live coding', 'musik zum programmieren'] },

  'learn-science': { include: ['wissenschaft', 'weltraum', 'physik', 'astronomie'] },
  'learn-tech': { include: ['programmieren', 'software', 'linux', 'javascript'] },
  'learn-history': { include: ['geschichte', 'lore', 'antike', 'weltkrieg'] },
  'learn-how-it-works': { include: ['wie funktioniert', 'technik', 'zerlegt', 'erklärt'] },

  gaming: { include: ['gameplay', 'spieletest', "let's play", 'gaming'], exclude: ['shorts'] },
  'gaming-lore': { include: ['lore', 'story erklärt', 'analyse'] },
  'gaming-strategy': { include: ['strategie', 'rts', '4x', 'grand strategy'] },
  'gaming-speedruns': { include: ['speedrun', 'esports', 'turnier', 'weltrekord'] },
  'gaming-indie': { include: ['indie-spiel', 'devlog', 'gamedev', 'godot'] },

  laugh: { include: ['comedy', 'lustig', 'sketch', 'stand-up'], exclude: ['prank', 'cringe'] },
  'laugh-standup': { include: ['stand-up', 'comedian', 'kabarett'] },
  'laugh-late-night': { include: ['late night', 'monolog', 'talkshow'] },
  'laugh-animals': { include: ['tiere', 'süß', 'hunde', 'katzen'] },

  news: { include: ['nachrichten', 'analyse', 'erklärt'], exclude: ['rage', 'drama', 'reaktion'] },
  'news-deep-dives': { include: ['analyse', 'doku', 'recherche'] },
  'news-catch-up': { include: ['wochenrückblick', 'briefing', 'zusammenfassung', 'schlagzeilen'] },
  'news-business': { include: ['wirtschaft', 'börse', 'unternehmen'] },

  'wind-down': { include: ['ruhig', 'einschlafen', 'meditation', 'entspannung'], exclude: ['eilmeldung', 'hype', 'horror', 'rage'] },
  'wind-down-sleep-sounds': { include: ['regengeräusche', 'weißes rauschen', 'schlafmusik'] },
  'wind-down-stories': { include: ['gute-nacht-geschichte', 'einschlafgeschichte', 'hörbuch'] },
  'wind-down-asmr': { include: ['asmr', 'tingles'] },

  make: { include: ['diy', 'selber bauen', 'anleitung', 'restauration'] },
  'make-workshop': { include: ['reparatur', 'restauration', 'motor', 'motorrad', 'werkzeug'] },
  'make-cooking': { include: ['rezept', 'kochen', 'backen'] },
  'make-home': { include: ['heimwerken', 'holzbearbeitung', 'garten'] },
} satisfies SeedTagLists;
