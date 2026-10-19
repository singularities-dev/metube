import type { Messages } from '../../index.ts';

/**
 * The Tags page: liked and blocked tags, and suggestions from searches and from
 * videos in the feed. {tag} is a tag or search phrase, shown as it is. "Settings"
 * and "Explore" name the app's sections and must match their navigation labels
 * (app.nav.settings, app.nav.explore).
 */
export default {
  'tags.title': 'Tags',
  'tags.activityTitle': 'Activité',
  /** Accessible name of the row of two tabs ("Your tags", "Activity") that switch this page's section. */
  'tags.tabs': 'Section',
  'tags.tab.tags': 'Vos tags',
  'tags.tab.activity': 'Activité',
  'tags.lede': 'Les tags façonnent chaque fil, quelle que soit votre humeur. Les tags aimés remontent en tête ; les tags bloqués n’apparaissent jamais.',

  /** Heading of the list of liked tags (show more videos with these tags); also the list's accessible name. */
  'tags.liked': 'Plus souvent',
  'tags.liked.placeholder': 'Ajouter un tag aimé',
  /** Heading of the list of blocked tags (hide videos with these tags); also the list's accessible name. */
  'tags.blocked': 'Ne jamais afficher',
  'tags.blocked.placeholder': 'Ajouter un tag à bloquer',

  'tags.fromSearches': 'D’après vos recherches',
  'tags.fromSearches.hint': 'Expressions et mots récurrents de votre historique des recherches importé. Le nombre indique combien de fois vous les avez recherchés.',
  'tags.fromSearches.empty': 'Importez votre historique des recherches dans Paramètres pour voir des suggestions ici.',
  /** Shown on hover over a suggested search phrase and read after it by screen readers. */
  'tags.fromSearches.detail': { one: '{count} recherche', other: '{count} recherches' },
  'tags.fromVideos': 'D’après les vidéos de votre fil',
  'tags.fromVideos.hint': 'Tags que les créateurs ajoutent aux vidéos récentes de votre fil, avec pour chacun le nombre de vidéos qui le portent. Ils s’actualisent en même temps que votre fil.',
  'tags.fromVideos.empty': 'Ouvrez Explorer pour charger votre fil, puis les suggestions apparaîtront ici.',
  /** Shown on hover over a suggested tag and read after it by screen readers. */
  'tags.fromVideos.detail': { one: 'Sur {count} vidéo de votre fil', other: 'Sur {count} vidéos de votre fil' },

  /** Icon button on a suggestion: adds {tag} to "More of". */
  'tags.like': 'Aimer {tag}',
  /** Tooltip of that button. */
  'tags.like.title': 'Voir plus souvent',
  /** Icon button on a suggestion: adds {tag} to "Never show". */
  'tags.block': 'Bloquer {tag}',
  /** Tooltip of that button. */
  'tags.block.title': 'Ne jamais afficher',
} satisfies Messages;
