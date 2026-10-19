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
  energetic: { include: ['meilleurs moments', 'course', 'hype', 'action'], exclude: ['asmr', 'dormir'] },
  chill: { include: ['chill', 'lofi', 'ambient', 'relaxant'], exclude: ['dernière minute', 'rage'] },
  focus: { include: ['deep house', 'synthwave', 'instrumental', 'mix'], exclude: ['réaction'] },
  'gaming-music': { include: ['edm', 'voix féminine'] },
  learn: { include: ['expliqué', 'documentaire', 'tutoriel', 'lore'], exclude: ['shorts'] },

  'energetic-workout': { include: ['entraînement', 'musculation', 'fitness', 'motivation'] },
  'energetic-motorsport': { include: ['f1', 'motogp', 'caméra embarquée', 'qualifications'] },
  'energetic-hype-music': { include: ['drum and bass', 'phonk', 'hardstyle', 'edm'] },

  'chill-lofi': { include: ['lofi', 'chillhop', 'ambient'] },
  'chill-cozy-games': { include: ['cosy', 'jeu relaxant', 'ferme', 'stardew'] },
  'chill-nature': { include: ['nature', 'paysages', 'balade', 'voyage'], exclude: ['drama'] },

  'focus-deep-work': { include: ['musique pour étudier', 'concentration', 'piano', 'sans paroles'], exclude: ['paroles'] },
  'focus-coding': { include: ['programmation', 'live coding', 'musique pour coder'] },

  'learn-science': { include: ['science', 'espace', 'physique', 'astronomie'] },
  'learn-tech': { include: ['programmation', 'logiciel', 'linux', 'javascript'] },
  'learn-history': { include: ['histoire', 'lore', 'antiquité', 'guerre mondiale'] },
  'learn-how-it-works': { include: ['comment ça marche', 'ingénierie', 'démontage', 'expliqué'] },

  gaming: { include: ['gameplay', 'jeu vidéo', "let's play", 'gaming'], exclude: ['shorts'] },
  'gaming-lore': { include: ['lore', 'histoire expliquée', 'analyse'] },
  'gaming-strategy': { include: ['stratégie', 'rts', '4x', 'grande stratégie'] },
  'gaming-speedruns': { include: ['speedrun', 'esports', 'tournoi', 'record du monde'] },
  'gaming-indie': { include: ['jeu indé', 'devlog', 'gamedev', 'godot'] },

  laugh: { include: ['humour', 'drôle', 'sketch', 'stand-up'], exclude: ['prank', 'cringe'] },
  'laugh-standup': { include: ['stand-up', 'humoriste', 'spectacle'] },
  'laugh-late-night': { include: ['late show', 'monologue', 'talk-show'] },
  'laugh-animals': { include: ['animaux', 'mignon', 'chiens', 'chats'] },

  news: { include: ['actualité', 'analyse', 'décryptage'], exclude: ['rage', 'drama', 'réaction'] },
  'news-deep-dives': { include: ['analyse', 'documentaire', 'enquête'] },
  'news-catch-up': { include: ['résumé de la semaine', 'journal', 'résumé', 'à la une'] },
  'news-business': { include: ['économie', 'bourse', 'business'] },

  'wind-down': { include: ['calme', 'dormir', 'méditation', 'relaxant'], exclude: ['dernière minute', 'hype', 'horreur', 'rage'] },
  'wind-down-sleep-sounds': { include: ['bruit de pluie', 'bruit blanc', 'musique pour dormir'] },
  'wind-down-stories': { include: ['histoire du soir', 'histoire pour dormir', 'livre audio'] },
  'wind-down-asmr': { include: ['asmr', 'frissons'] },

  make: { include: ['diy', 'fabrication', 'tuto', 'restauration'] },
  'make-workshop': { include: ['réparation', 'restauration', 'moteur', 'moto', 'outils'] },
  'make-cooking': { include: ['recette', 'cuisine', 'pâtisserie'] },
  'make-home': { include: ['rénovation', 'travail du bois', 'jardin'] },
} satisfies SeedTagLists;
