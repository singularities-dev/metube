import type { Messages } from '../../index.ts';

/**
 * The Tags page: liked and blocked tags, and suggestions from searches and from
 * videos in the feed. {tag} is a tag or search phrase, shown as it is. "Settings"
 * and "Explore" name the app's sections and must match their navigation labels
 * (app.nav.settings, app.nav.explore).
 */
export default {
  'tags.title': 'Tags',
  'tags.activityTitle': 'Aktivität',
  /** Accessible name of the row of two tabs ("Your tags", "Activity") that switch this page's section. */
  'tags.tabs': 'Bereich',
  'tags.tab.tags': 'Deine Tags',
  'tags.tab.activity': 'Aktivität',
  'tags.lede': 'Tags prägen jeden Feed, egal in welcher Stimmung du bist. Tags, die du magst, kommen nach oben; blockierte Tags erscheinen nie.',

  /** Heading of the list of liked tags (show more videos with these tags); also the list's accessible name. */
  'tags.liked': 'Mehr davon',
  'tags.liked.placeholder': 'Tag hinzufügen, das du magst',
  /** Heading of the list of blocked tags (hide videos with these tags); also the list's accessible name. */
  'tags.blocked': 'Nie zeigen',
  'tags.blocked.placeholder': 'Tag zum Blockieren hinzufügen',

  'tags.fromSearches': 'Aus deinen Suchanfragen',
  'tags.fromSearches.hint': 'Suchbegriffe und wiederkehrende Wörter aus deinem importierten Suchverlauf. Die Zahl zeigt, wie oft du danach gesucht hast.',
  'tags.fromSearches.empty': 'Importiere deinen Suchverlauf in den Einstellungen, um hier Vorschläge zu sehen.',
  /** Shown on hover over a suggested search phrase and read after it by screen readers. */
  'tags.fromSearches.detail': { one: '{count}-mal gesucht', other: '{count}-mal gesucht' },
  'tags.fromVideos': 'Aus Videos in deinem Feed',
  'tags.fromVideos.hint': 'Tags, die Creator bei aktuellen Videos in deinem Feed verwenden, jeweils mit der Anzahl der Videos. Sie werden zusammen mit deinem Feed aktualisiert.',
  'tags.fromVideos.empty': 'Öffne „Entdecken“, um deinen Feed zu laden. Dann erscheinen hier Vorschläge.',
  /** Shown on hover over a suggested tag and read after it by screen readers. */
  'tags.fromVideos.detail': { one: 'Bei {count} Video in deinem Feed', other: 'Bei {count} Videos in deinem Feed' },

  /** Icon button on a suggestion: adds {tag} to "More of". */
  'tags.like': '{tag} mögen',
  /** Tooltip of that button. */
  'tags.like.title': 'Mehr davon sehen',
  /** Icon button on a suggestion: adds {tag} to "Never show". */
  'tags.block': '{tag} blockieren',
  /** Tooltip of that button. */
  'tags.block.title': 'Nie wieder zeigen',
} satisfies Messages;
