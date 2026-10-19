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
  energetic: { include: ['mejores momentos', 'carrera', 'hype', 'acción'], exclude: ['asmr', 'dormir'] },
  chill: { include: ['chill', 'lofi', 'ambient', 'relajante'], exclude: ['última hora', 'rage'] },
  focus: { include: ['deep house', 'synthwave', 'instrumental', 'mix'], exclude: ['reacción'] },
  'gaming-music': { include: ['edm', 'voz femenina'] },
  learn: { include: ['explicado', 'documental', 'tutorial', 'lore'], exclude: ['shorts'] },

  'energetic-workout': { include: ['entrenamiento', 'gimnasio', 'rutina', 'motivación'] },
  'energetic-motorsport': { include: ['f1', 'motogp', 'onboard', 'clasificación'] },
  'energetic-hype-music': { include: ['drum and bass', 'phonk', 'hardstyle', 'edm'] },

  'chill-lofi': { include: ['lofi', 'chillhop', 'ambient'] },
  'chill-cozy-games': { include: ['cozy', 'juego relajante', 'granja', 'stardew'] },
  'chill-nature': { include: ['naturaleza', 'paisajes', 'paseo', 'viaje'], exclude: ['drama'] },

  'focus-deep-work': { include: ['música para estudiar', 'concentración', 'piano', 'sin voces'], exclude: ['voces'] },
  'focus-coding': { include: ['programación', 'live coding', 'música para programar'] },

  'learn-science': { include: ['ciencia', 'espacio', 'física', 'astronomía'] },
  'learn-tech': { include: ['programación', 'software', 'linux', 'javascript'] },
  'learn-history': { include: ['historia', 'lore', 'antigüedad', 'guerra mundial'] },
  'learn-how-it-works': { include: ['cómo funciona', 'ingeniería', 'desmontaje', 'explicado'] },

  gaming: { include: ['gameplay', 'videojuegos', "let's play", 'gaming'], exclude: ['shorts'] },
  'gaming-lore': { include: ['lore', 'historia explicada', 'análisis'] },
  'gaming-strategy': { include: ['estrategia', 'rts', '4x', 'gran estrategia'] },
  'gaming-speedruns': { include: ['speedrun', 'esports', 'torneo', 'récord mundial'] },
  'gaming-indie': { include: ['juego indie', 'devlog', 'gamedev', 'godot'] },

  laugh: { include: ['comedia', 'humor', 'sketch', 'stand-up'], exclude: ['broma', 'cringe'] },
  'laugh-standup': { include: ['stand-up', 'comediante', 'especial de comedia'] },
  'laugh-late-night': { include: ['late night', 'monólogo', 'talk show'] },
  'laugh-animals': { include: ['animales', 'adorables', 'perros', 'gatos'] },

  news: { include: ['noticias', 'análisis', 'explicado'], exclude: ['rage', 'drama', 'reacción'] },
  'news-deep-dives': { include: ['análisis', 'documental', 'investigación'] },
  'news-catch-up': { include: ['resumen semanal', 'informativo', 'resumen', 'titulares'] },
  'news-business': { include: ['economía', 'mercados', 'negocios'] },

  'wind-down': { include: ['calma', 'dormir', 'meditación', 'relajante'], exclude: ['última hora', 'hype', 'terror', 'rage'] },
  'wind-down-sleep-sounds': { include: ['sonido de lluvia', 'ruido blanco', 'música para dormir'] },
  'wind-down-stories': { include: ['cuento para dormir', 'historia para dormir', 'audiolibro'] },
  'wind-down-asmr': { include: ['asmr', 'cosquillas'] },

  make: { include: ['diy', 'bricolaje', 'cómo hacer', 'restauración'] },
  'make-workshop': { include: ['reparación', 'restauración', 'motor', 'moto', 'herramientas'] },
  'make-cooking': { include: ['receta', 'cocina', 'repostería'] },
  'make-home': { include: ['reformas', 'carpintería', 'jardín'] },
} satisfies SeedTagLists;
